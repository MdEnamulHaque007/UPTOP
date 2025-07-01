/**
 * Google Sheets Data Service
 * Fetches and processes data from Google Sheets using OpenSheet API
 */

class GoogleSheetsService {
    constructor() {
        // Configuration - easily changeable
        this.config = {
            sheetId: '1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc',
            sheetName: 'PO',
            baseUrl: 'https://opensheet.elk.sh',
            timeout: 10000, // 10 seconds
            retryAttempts: 3,
            retryDelay: 1000 // 1 second
        };
        
        this.cache = {
            data: null,
            timestamp: null,
            duration: 5 * 60 * 1000 // 5 minutes
        };
        
        this.isLoading = false;
    }

    /**
     * Get the complete API URL
     * @returns {string} Complete API URL
     */
    getApiUrl() {
        return `${this.config.baseUrl}/${this.config.sheetId}/${this.config.sheetName}`;
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        Utils.log('info', 'Configuration updated', this.config);
    }

    /**
     * Fetch data from Google Sheets
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Array>} Array of data objects
     */
    async fetchData(useCache = true) {
        Utils.log('info', 'Fetching data from Google Sheets', { useCache });

        // Return cached data if available and not expired
        if (useCache && this.isCacheValid()) {
            Utils.log('info', 'Returning cached data');
            return this.cache.data;
        }

        // Prevent multiple simultaneous requests
        if (this.isLoading) {
            Utils.log('warn', 'Request already in progress, waiting...');
            return this.waitForCurrentRequest();
        }

        this.isLoading = true;

        try {
            const data = await this.fetchWithRetry();
            const processedData = this.processData(data);
            
            // Cache the processed data
            this.cacheData(processedData);
            
            Utils.log('info', 'Data fetched successfully', { count: processedData.length });
            return processedData;

        } catch (error) {
            Utils.log('error', 'Failed to fetch data', error);
            
            // Try to return stale cached data as fallback
            if (this.cache.data) {
                Utils.log('warn', 'Returning stale cached data due to fetch error');
                return this.cache.data;
            }
            
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetch data with retry logic
     * @returns {Promise<Array>} Raw data from API
     */
    async fetchWithRetry() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                Utils.log('info', `Fetch attempt ${attempt}/${this.config.retryAttempts}`);
                
                const data = await this.makeRequest();
                return data;
                
            } catch (error) {
                lastError = error;
                Utils.log('warn', `Fetch attempt ${attempt} failed: ${error.message}`);
                
                // Don't retry on the last attempt
                if (attempt < this.config.retryAttempts) {
                    const delay = this.config.retryDelay * attempt;
                    Utils.log('info', `Retrying in ${delay}ms`);
                    await this.delay(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Make HTTP request to OpenSheet API
     * @returns {Promise<Array>} Raw data from API
     */
    async makeRequest() {
        const url = this.getApiUrl();
        Utils.log('info', 'Making request to:', url);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format: expected array');
            }

            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your internet connection');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error - please check your internet connection');
            }
            
            throw error;
        }
    }

    /**
     * Process and clean raw data from API
     * @param {Array} rawData - Raw data from API
     * @returns {Array} Processed data
     */
    processData(rawData) {
        if (!Array.isArray(rawData) || rawData.length === 0) {
            Utils.log('warn', 'No data received from API');
            return [];
        }

        const processedData = [];
        const errors = [];

        rawData.forEach((row, index) => {
            try {
                const processedRow = this.processRow(row, index);
                if (processedRow) {
                    processedData.push(processedRow);
                }
            } catch (error) {
                errors.push(`Row ${index + 1}: ${error.message}`);
            }
        });

        if (errors.length > 0) {
            Utils.log('warn', 'Data processing errors', errors);
        }

        Utils.log('info', 'Data processed', {
            total: rawData.length,
            valid: processedData.length,
            errors: errors.length
        });

        return processedData;
    }

    /**
     * Process individual row data
     * @param {Object} row - Raw row data
     * @param {number} index - Row index
     * @returns {Object|null} Processed row data
     */
    processRow(row, index) {
        if (!row || typeof row !== 'object') {
            return null;
        }

        // Create processed row with cleaned data
        const processed = {};

        // Process each field in the row
        Object.keys(row).forEach(key => {
            const cleanKey = this.cleanFieldName(key);
            const cleanValue = this.cleanFieldValue(row[key]);
            
            if (cleanKey && cleanValue !== null) {
                processed[cleanKey] = cleanValue;
            }
        });

        // Add row index for reference
        processed._rowIndex = index + 1;

        // Skip empty rows
        const hasData = Object.keys(processed).some(key => 
            key !== '_rowIndex' && processed[key] !== '' && processed[key] !== null
        );

        return hasData ? processed : null;
    }

    /**
     * Clean field names (column headers)
     * @param {string} fieldName - Original field name
     * @returns {string} Cleaned field name
     */
    cleanFieldName(fieldName) {
        if (!fieldName) return '';
        
        return String(fieldName)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * Clean field values
     * @param {*} value - Original field value
     * @returns {*} Cleaned field value
     */
    cleanFieldValue(value) {
        if (value === null || value === undefined) return null;
        
        const stringValue = String(value).trim();
        
        // Return null for empty strings
        if (stringValue === '') return null;
        
        // Try to parse as number if it looks like one
        if (/^\d+\.?\d*$/.test(stringValue) || /^\$?\d{1,3}(,\d{3})*\.?\d*$/.test(stringValue)) {
            const numericValue = Utils.parseNumber(stringValue);
            if (!isNaN(numericValue)) {
                return numericValue;
            }
        }
        
        return stringValue;
    }

    /**
     * Cache data with timestamp
     * @param {Array} data - Data to cache
     */
    cacheData(data) {
        this.cache.data = data;
        this.cache.timestamp = Date.now();
        
        Utils.log('info', 'Data cached', { count: data.length });
    }

    /**
     * Check if cached data is still valid
     * @returns {boolean} True if cache is valid
     */
    isCacheValid() {
        if (!this.cache.data || !this.cache.timestamp) {
            return false;
        }

        const cacheAge = Date.now() - this.cache.timestamp;
        return cacheAge < this.cache.duration;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.data = null;
        this.cache.timestamp = null;
        Utils.log('info', 'Cache cleared');
    }

    /**
     * Wait for current request to complete
     * @returns {Promise<Array>} Data from current request
     */
    async waitForCurrentRequest() {
        while (this.isLoading) {
            await this.delay(100);
        }
        
        if (this.cache.data) {
            return this.cache.data;
        }
        
        throw new Error('No data available after waiting for request');
    }

    /**
     * Delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get service status and statistics
     * @returns {Object} Service status
     */
    getStatus() {
        return {
            isLoading: this.isLoading,
            hasCache: !!this.cache.data,
            cacheAge: this.cache.timestamp ? Date.now() - this.cache.timestamp : null,
            cacheValid: this.isCacheValid(),
            dataCount: this.cache.data ? this.cache.data.length : 0,
            config: { ...this.config },
            apiUrl: this.getApiUrl()
        };
    }

    /**
     * Test connection to Google Sheets
     * @returns {Promise<Object>} Test result
     */
    async testConnection() {
        try {
            Utils.log('info', 'Testing connection to Google Sheets');
            
            const startTime = Date.now();
            const data = await this.makeRequest();
            const endTime = Date.now();
            
            return {
                success: true,
                responseTime: endTime - startTime,
                dataCount: data.length,
                sampleData: data.slice(0, 3),
                message: `Successfully connected! Retrieved ${data.length} rows in ${endTime - startTime}ms`
            };
            
        } catch (error) {
            Utils.log('error', 'Connection test failed', error);
            
            return {
                success: false,
                error: error.message,
                message: `Connection failed: ${error.message}`
            };
        }
    }
}

// Create singleton instance
const gsDataService = new GoogleSheetsService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gsDataService;
}
