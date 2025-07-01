/**
 * Spreadsheet Service
 * Handles fetching data from Google Sheets using OpenSheet API
 * Includes caching, error handling, and retry logic
 */

class SpreadsheetService {
    constructor() {
        this.cache = new Map();
        this.lastFetchTime = null;
        this.isLoading = false;
    }

    /**
     * Fetch data from Google Sheets
     * @param {boolean} useCache - Whether to use cached data
     * @returns {Promise<Array>} Array of data objects
     */
    async fetchData(useCache = true) {
        CONFIG.log('info', 'Fetching data from Google Sheets', { useCache });

        // Return cached data if available and not expired
        if (useCache && this.isCacheValid()) {
            CONFIG.log('info', 'Returning cached data');
            return this.cache.get('data');
        }

        // Prevent multiple simultaneous requests
        if (this.isLoading) {
            CONFIG.log('warn', 'Request already in progress, waiting...');
            return this.waitForCurrentRequest();
        }

        this.isLoading = true;

        try {
            const data = await this.fetchWithRetry();
            
            // Validate and process data
            const processedData = this.processData(data);
            
            // Cache the data
            this.cacheData(processedData);
            
            this.lastFetchTime = new Date();
            CONFIG.log('info', 'Data fetched successfully', { count: processedData.length });
            
            return processedData;

        } catch (error) {
            CONFIG.log('error', 'Failed to fetch data', error);
            
            // Try to return stale cached data as fallback
            if (this.cache.has('data')) {
                CONFIG.log('warn', 'Returning stale cached data due to fetch error');
                return this.cache.get('data');
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
        
        for (let attempt = 1; attempt <= CONFIG.GOOGLE_SHEETS.RETRY_ATTEMPTS; attempt++) {
            try {
                CONFIG.log('debug', `Fetch attempt ${attempt}/${CONFIG.GOOGLE_SHEETS.RETRY_ATTEMPTS}`);
                
                const data = await this.makeRequest();
                return data;
                
            } catch (error) {
                lastError = error;
                CONFIG.log('warn', `Fetch attempt ${attempt} failed`, error.message);
                
                // Don't retry on the last attempt
                if (attempt < CONFIG.GOOGLE_SHEETS.RETRY_ATTEMPTS) {
                    const delay = CONFIG.GOOGLE_SHEETS.RETRY_DELAY * attempt;
                    CONFIG.log('debug', `Retrying in ${delay}ms`);
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
        const url = CONFIG.getApiUrl();
        CONFIG.log('debug', 'Making request to', url);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: CONFIG.API.HEADERS,
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
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Process and validate raw data
     * @param {Array} rawData - Raw data from API
     * @returns {Array} Processed data
     */
    processData(rawData) {
        if (!Array.isArray(rawData) || rawData.length === 0) {
            CONFIG.log('warn', 'No data received from API');
            return [];
        }

        const processedData = [];
        const errors = [];

        rawData.forEach((row, index) => {
            try {
                const processedRow = this.processRow(row);
                
                // Validate row data
                const validation = Helpers.validateData(processedRow);
                if (validation.isValid) {
                    processedData.push(processedRow);
                } else {
                    errors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
                }
                
            } catch (error) {
                errors.push(`Row ${index + 1}: ${error.message}`);
            }
        });

        if (errors.length > 0) {
            CONFIG.log('warn', 'Data validation errors', errors);
        }

        CONFIG.log('info', 'Data processed', {
            total: rawData.length,
            valid: processedData.length,
            errors: errors.length
        });

        return processedData;
    }

    /**
     * Process individual row data
     * @param {Object} row - Raw row data
     * @returns {Object} Processed row data
     */
    processRow(row) {
        const processed = {};

        // Map and clean data fields
        processed.po_number = this.cleanString(row.po_number || row['PO Number'] || '');
        processed.date = this.parseDate(row.date || row['Date'] || '');
        processed.supplier = this.cleanString(row.supplier || row['Supplier'] || '');
        processed.quantity = this.parseNumber(row.quantity || row['Quantity'] || 0);
        processed.unit_price = this.parseNumber(row.unit_price || row['Unit Price'] || 0);
        processed.total_value = this.parseNumber(row.total_value || row['Total Value'] || 0);
        processed.status = this.cleanString(row.status || row['Status'] || 'pending');

        // Calculate total_value if not provided
        if (!processed.total_value && processed.quantity && processed.unit_price) {
            processed.total_value = processed.quantity * processed.unit_price;
        }

        // Add additional fields if present
        if (row.description || row['Description']) {
            processed.description = this.cleanString(row.description || row['Description']);
        }

        if (row.category || row['Category']) {
            processed.category = this.cleanString(row.category || row['Category']);
        }

        return processed;
    }

    /**
     * Clean string values
     * @param {*} value - Value to clean
     * @returns {string} Cleaned string
     */
    cleanString(value) {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }

    /**
     * Parse number values
     * @param {*} value - Value to parse
     * @returns {number} Parsed number
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        
        // Remove currency symbols and commas
        const cleaned = String(value).replace(/[$,]/g, '');
        const parsed = parseFloat(cleaned);
        
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Parse date values
     * @param {*} value - Value to parse
     * @returns {string} ISO date string
     */
    parseDate(value) {
        if (!value) return '';
        
        const date = Helpers.parseDate(value);
        return date ? date.toISOString().split('T')[0] : '';
    }

    /**
     * Cache data with timestamp
     * @param {Array} data - Data to cache
     */
    cacheData(data) {
        this.cache.set('data', data);
        this.cache.set('timestamp', Date.now());
        
        // Also save to localStorage for persistence
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
        } catch (error) {
            CONFIG.log('warn', 'Failed to save cache to localStorage', error);
        }
    }

    /**
     * Check if cached data is still valid
     * @returns {boolean} True if cache is valid
     */
    isCacheValid() {
        if (!this.cache.has('data') || !this.cache.has('timestamp')) {
            // Try to load from localStorage
            this.loadCacheFromStorage();
        }

        if (!this.cache.has('data') || !this.cache.has('timestamp')) {
            return false;
        }

        const cacheAge = Date.now() - this.cache.get('timestamp');
        return cacheAge < CONFIG.GOOGLE_SHEETS.CACHE_DURATION;
    }

    /**
     * Load cache from localStorage
     */
    loadCacheFromStorage() {
        try {
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.CACHE);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                this.cache.set('data', data);
                this.cache.set('timestamp', timestamp);
            }
        } catch (error) {
            CONFIG.log('warn', 'Failed to load cache from localStorage', error);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CACHE);
        CONFIG.log('info', 'Cache cleared');
    }

    /**
     * Wait for current request to complete
     * @returns {Promise<Array>} Data from current request
     */
    async waitForCurrentRequest() {
        while (this.isLoading) {
            await this.delay(100);
        }
        
        if (this.cache.has('data')) {
            return this.cache.get('data');
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
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            hasData: this.cache.has('data'),
            dataCount: this.cache.has('data') ? this.cache.get('data').length : 0,
            lastFetchTime: this.lastFetchTime,
            cacheAge: this.cache.has('timestamp') ? Date.now() - this.cache.get('timestamp') : null,
            isValid: this.isCacheValid()
        };
    }
}

// Create singleton instance
const spreadsheetService = new SpreadsheetService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = spreadsheetService;
}
