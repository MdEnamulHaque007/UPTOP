/**
 * Configuration file for the Inventory Management Dashboard
 * Contains all app settings, API endpoints, and constants
 */

const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        // Your Google Sheet ID
        SHEET_ID: '1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc',

        // OpenSheet API base URL
        BASE_URL: 'https://opensheet.elk.sh',

        // Sheet name to fetch data from (matches your 'PO' sheet)
        SHEET_NAME: 'PO',

        // Columns range (A to N as specified)
        COLUMNS: 'A:N',
        
        // Cache duration in milliseconds (5 minutes)
        CACHE_DURATION: 5 * 60 * 1000,
        
        // Retry configuration
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000, // 1 second
    },

    // API Configuration
    API: {
        // Request timeout in milliseconds
        TIMEOUT: 10000, // 10 seconds
        
        // Headers for requests
        HEADERS: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // UI Configuration
    UI: {
        // Table pagination
        ITEMS_PER_PAGE: 10,
        
        // Chart colors
        CHART_COLORS: {
            primary: '#3b82f6',
            secondary: '#64748b',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4'
        },
        
        // Animation durations
        ANIMATION_DURATION: 300,
        
        // Toast notification duration
        TOAST_DURATION: 5000, // 5 seconds
        
        // Loading debounce delay
        DEBOUNCE_DELAY: 300 // 300ms
    },

    // Date formats
    DATE_FORMATS: {
        DISPLAY: 'MMM DD, YYYY',
        INPUT: 'YYYY-MM-DD',
        CHART: 'MMM DD'
    },

    // Currency formatting
    CURRENCY: {
        SYMBOL: '$',
        LOCALE: 'en-US',
        DECIMAL_PLACES: 2
    },

    // Local storage keys
    STORAGE_KEYS: {
        THEME: 'inventory_theme',
        CACHE: 'inventory_cache',
        FILTERS: 'inventory_filters',
        TABLE_SETTINGS: 'inventory_table_settings'
    },

    // Error messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        DATA_FETCH_ERROR: 'Failed to fetch data from Google Sheets.',
        INVALID_DATA: 'Invalid data format received.',
        CACHE_ERROR: 'Error accessing cached data.',
        EXPORT_ERROR: 'Failed to export data.',
        FILTER_ERROR: 'Error applying filters.'
    },

    // Success messages
    SUCCESS_MESSAGES: {
        DATA_LOADED: 'Data loaded successfully',
        DATA_REFRESHED: 'Data refreshed successfully',
        EXPORT_COMPLETE: 'Data exported successfully',
        FILTERS_APPLIED: 'Filters applied successfully'
    },

    // Default filter values
    DEFAULT_FILTERS: {
        dateRange: 'month',
        startDate: null,
        endDate: null,
        searchTerm: '',
        sortField: 'date',
        sortDirection: 'desc'
    },

    // Chart configuration
    CHART_CONFIG: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#3b82f6',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: '#e2e8f0'
                },
                ticks: {
                    color: '#64748b'
                }
            }
        }
    },

    // Expected data structure from Google Sheets
    DATA_SCHEMA: {
        REQUIRED_FIELDS: [
            'po_number',
            'date',
            'supplier',
            'quantity',
            'unit_price',
            'total_value',
            'status'
        ],
        FIELD_TYPES: {
            po_number: 'string',
            date: 'date',
            supplier: 'string',
            quantity: 'number',
            unit_price: 'number',
            total_value: 'number',
            status: 'string'
        }
    },

    // Development settings
    DEBUG: {
        ENABLED: false, // Set to true for development
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        MOCK_DATA: false // Use mock data instead of API
    }
};

// Utility function to get the complete API URL
CONFIG.getApiUrl = function() {
    return `${this.GOOGLE_SHEETS.BASE_URL}/${this.GOOGLE_SHEETS.SHEET_ID}/${this.GOOGLE_SHEETS.SHEET_NAME}`;
};

// Utility function to check if debug mode is enabled
CONFIG.isDebugMode = function() {
    return this.DEBUG.ENABLED || localStorage.getItem('debug') === 'true';
};

// Utility function to log debug messages
CONFIG.log = function(level, message, data = null) {
    if (!this.isDebugMode()) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
        case 'debug':
            console.debug(logMessage, data);
            break;
        case 'info':
            console.info(logMessage, data);
            break;
        case 'warn':
            console.warn(logMessage, data);
            break;
        case 'error':
            console.error(logMessage, data);
            break;
        default:
            console.log(logMessage, data);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
