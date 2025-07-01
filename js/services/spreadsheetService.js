/**
 * Spreadsheet Service
 * Handles data fetching from Google Sheets using OpenSheet or Google Sheets API
 */

const SpreadsheetService = {
    // Service state
    isInitialized: false,
    lastFetchTime: null,
    refreshInterval: null,
    
    /**
     * Initialize the spreadsheet service
     */
    init() {
        try {
            // Set up automatic refresh if enabled
            if (CONFIG.GOOGLE_SHEETS.REFRESH_INTERVAL > 0) {
                this.setupAutoRefresh();
            }
            
            this.isInitialized = true;
            console.log('SpreadsheetService initialized');
            
        } catch (error) {
            console.error('Failed to initialize SpreadsheetService:', error);
        }
    },
    
    /**
     * Fetch data from a specific sheet
     * @param {string} sheetName - Name of the sheet to fetch
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Array>} - Array of row objects
     */
    async getSheetData(sheetName, useCache = true) {
        try {
            // Check cache first if enabled
            if (useCache) {
                const cachedData = DataCache.get(sheetName);
                if (cachedData) {
                    console.log(`Using cached data for sheet: ${sheetName}`);
                    return cachedData;
                }
            }
            
            // Fetch fresh data
            console.log(`Fetching data from sheet: ${sheetName}`);
            
            let data;
            if (CONFIG.GOOGLE_SHEETS.API_KEY) {
                // Use Google Sheets API
                data = await this.fetchWithSheetsAPI(sheetName);
            } else {
                // Use OpenSheet
                data = await this.fetchWithOpenSheet(sheetName);
            }
            
            // Process and validate data
            const processedData = this.processSheetData(data, sheetName);
            
            // Cache the data
            DataCache.set(sheetName, processedData);
            
            // Update last fetch time
            this.lastFetchTime = new Date();
            
            // Emit data update event
            EventEmitter.emit('data:updated', {
                sheet: sheetName,
                data: processedData,
                timestamp: this.lastFetchTime
            });
            
            return processedData;
            
        } catch (error) {
            console.error(`Failed to fetch data from sheet ${sheetName}:`, error);
            
            // Try to return cached data as fallback
            const cachedData = DataCache.get(sheetName);
            if (cachedData) {
                console.warn(`Using stale cached data for sheet: ${sheetName}`);
                return cachedData;
            }
            
            // Emit error event
            EventEmitter.emit('data:error', {
                sheet: sheetName,
                error: error.message
            });
            
            throw error;
        }
    },
    
    /**
     * Fetch data using Google Sheets API
     * @param {string} sheetName - Name of the sheet
     * @returns {Promise<Array>} - Raw sheet data
     */
    async fetchWithSheetsAPI(sheetName) {
        const url = `${CONFIG.GOOGLE_SHEETS.API_URL}/${CONFIG.GOOGLE_SHEETS.SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.values || [];
    },
    
    /**
     * Fetch data using OpenSheet
     * @param {string} sheetName - Name of the sheet
     * @returns {Promise<Array>} - Raw sheet data
     */
    async fetchWithOpenSheet(sheetName) {
        const url = `${CONFIG.GOOGLE_SHEETS.OPENSHEET_URL}/${CONFIG.GOOGLE_SHEETS.SHEET_ID}/${encodeURIComponent(sheetName)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`OpenSheet error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    },
    
    /**
     * Process raw sheet data into structured objects
     * @param {Array} rawData - Raw data from sheet
     * @param {string} sheetName - Name of the sheet
     * @returns {Array} - Processed data objects
     */
    processSheetData(rawData, sheetName) {
        if (!Array.isArray(rawData) || rawData.length === 0) {
            return [];
        }
        
        // For OpenSheet, data is already objects
        if (typeof rawData[0] === 'object' && !Array.isArray(rawData[0])) {
            return this.validateSheetData(rawData, sheetName);
        }
        
        // For Google Sheets API, convert arrays to objects
        const headers = rawData[0];
        const rows = rawData.slice(1);
        
        const processedData = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
        
        return this.validateSheetData(processedData, sheetName);
    },
    
    /**
     * Validate sheet data based on configuration
     * @param {Array} data - Data to validate
     * @param {string} sheetName - Name of the sheet
     * @returns {Array} - Validated data
     */
    validateSheetData(data, sheetName) {
        // Get required fields for this sheet type
        const sheetType = this.getSheetType(sheetName);
        const requiredFields = CONFIG.VALIDATION.REQUIRED_FIELDS[sheetType];
        
        if (!requiredFields) {
            return data; // No validation rules defined
        }
        
        // Filter out rows with missing required fields
        const validData = data.filter(row => {
            return requiredFields.every(field => {
                const value = row[field];
                return value !== undefined && value !== null && value.toString().trim() !== '';
            });
        });
        
        if (validData.length !== data.length) {
            console.warn(`Filtered out ${data.length - validData.length} invalid rows from ${sheetName}`);
        }
        
        return validData;
    },
    
    /**
     * Get sheet type from sheet name
     * @param {string} sheetName - Name of the sheet
     * @returns {string} - Sheet type
     */
    getSheetType(sheetName) {
        const sheetMappings = {
            [CONFIG.GOOGLE_SHEETS.SHEETS.PURCHASE_ORDERS]: 'PURCHASE_ORDER',
            [CONFIG.GOOGLE_SHEETS.SHEETS.PRODUCTION]: 'PRODUCTION',
            [CONFIG.GOOGLE_SHEETS.SHEETS.FINISHED_GOODS]: 'FINISHED_GOODS',
            [CONFIG.GOOGLE_SHEETS.SHEETS.ISSUES]: 'ISSUE',
            [CONFIG.GOOGLE_SHEETS.SHEETS.BGRADE_SALES]: 'BGRADE_SALE'
        };
        
        return sheetMappings[sheetName] || 'UNKNOWN';
    },
    
    /**
     * Refresh all data from sheets
     * @returns {Promise<Object>} - Object containing all sheet data
     */
    async refreshData() {
        try {
            console.log('Refreshing all sheet data...');
            
            const sheets = Object.values(CONFIG.GOOGLE_SHEETS.SHEETS);
            const promises = sheets.map(sheetName => 
                this.getSheetData(sheetName, false) // Force fresh fetch
            );
            
            const results = await Promise.allSettled(promises);
            const data = {};
            
            results.forEach((result, index) => {
                const sheetName = sheets[index];
                if (result.status === 'fulfilled') {
                    data[sheetName] = result.value;
                } else {
                    console.error(`Failed to refresh ${sheetName}:`, result.reason);
                    data[sheetName] = [];
                }
            });
            
            console.log('Data refresh complete');
            
            // Emit refresh complete event
            EventEmitter.emit('data:refresh-complete', data);
            
            return data;
            
        } catch (error) {
            console.error('Failed to refresh data:', error);
            throw error;
        }
    },
    
    /**
     * Get aggregated data for dashboard
     * @returns {Promise<Object>} - Aggregated data object
     */
    async getDashboardData() {
        try {
            // Fetch all required sheets
            const [
                purchaseOrders,
                production,
                finishedGoods,
                issues,
                bgradeSales
            ] = await Promise.all([
                this.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.PURCHASE_ORDERS),
                this.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.PRODUCTION),
                this.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.FINISHED_GOODS),
                this.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.ISSUES),
                this.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.BGRADE_SALES)
            ]);
            
            // Calculate aggregated metrics
            const dashboardData = {
                summary: {
                    totalPurchaseOrders: purchaseOrders.length,
                    totalProduction: production.length,
                    totalFinishedGoods: finishedGoods.length,
                    totalIssues: issues.length,
                    totalBgradeSales: bgradeSales.length,
                    
                    // Calculate values
                    totalPurchaseValue: this.calculateTotal(purchaseOrders, 'total_amount'),
                    totalProductionValue: this.calculateTotal(production, 'value'),
                    totalFinishedGoodsValue: this.calculateTotal(finishedGoods, 'total_value'),
                    totalBgradeSalesValue: this.calculateTotal(bgradeSales, 'sale_amount')
                },
                
                // Recent data (last 30 days)
                recent: {
                    purchaseOrders: this.getRecentData(purchaseOrders, 30),
                    production: this.getRecentData(production, 30),
                    issues: this.getRecentData(issues, 30),
                    bgradeSales: this.getRecentData(bgradeSales, 30)
                },
                
                // Raw data
                raw: {
                    purchaseOrders,
                    production,
                    finishedGoods,
                    issues,
                    bgradeSales
                }
            };
            
            return dashboardData;
            
        } catch (error) {
            console.error('Failed to get dashboard data:', error);
            throw error;
        }
    },
    
    /**
     * Calculate total value from array of objects
     * @param {Array} data - Array of data objects
     * @param {string} field - Field to sum
     * @returns {number} - Total value
     */
    calculateTotal(data, field) {
        return data.reduce((total, item) => {
            const value = parseFloat(item[field]) || 0;
            return total + value;
        }, 0);
    },
    
    /**
     * Get recent data within specified days
     * @param {Array} data - Array of data objects
     * @param {number} days - Number of days to look back
     * @returns {Array} - Filtered recent data
     */
    getRecentData(data, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return data.filter(item => {
            const itemDate = new Date(item.date || item.created_date);
            return itemDate >= cutoffDate;
        });
    },
    
    /**
     * Setup automatic data refresh
     */
    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(async () => {
            try {
                await this.refreshData();
                console.log('Auto-refresh completed');
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, CONFIG.GOOGLE_SHEETS.REFRESH_INTERVAL);
        
        console.log(`Auto-refresh set up with ${CONFIG.GOOGLE_SHEETS.REFRESH_INTERVAL / 1000}s interval`);
    },
    
    /**
     * Stop automatic refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('Auto-refresh stopped');
        }
    },
    
    /**
     * Get last fetch time
     * @returns {Date|null} - Last fetch time
     */
    getLastFetchTime() {
        return this.lastFetchTime;
    },
    
    /**
     * Check if service is initialized
     * @returns {boolean} - Initialization status
     */
    isReady() {
        return this.isInitialized;
    }
};
