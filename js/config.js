/**
 * Application Configuration
 * Central configuration file for the Shoe Manufacturing Inventory Management System
 */

const CONFIG = {
    // Application Information
    APP_NAME: 'Shoe Manufacturing Inventory',
    APP_VERSION: '1.0.0',
    
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        // Option 1: Using OpenSheet (no API key required)
        OPENSHEET_URL: 'https://opensheet.elk.sh',
        SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Replace with your sheet ID
        
        // Option 2: Using Google Sheets API (requires API key)
        API_KEY: '', // Add your Google Sheets API key here
        API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
        
        // Sheet Names/Tabs
        SHEETS: {
            PURCHASE_ORDERS: 'Purchase Orders',
            PRODUCTION: 'Production',
            FINISHED_GOODS: 'Finished Goods',
            ISSUES: 'Issues',
            BGRADE_SALES: 'B-Grade Sales',
            USERS: 'Users' // For authentication if using sheet-based auth
        },
        
        // Data refresh interval (in milliseconds) - Set to 0 to disable auto-refresh
        REFRESH_INTERVAL: 0, // Disabled - was 300000 (5 minutes)
        
        // Cache duration (in milliseconds)
        CACHE_DURATION: 600000 // 10 minutes
    },
    
    // Authentication Configuration
    AUTH: {
        // Authentication method: 'firebase', 'local', 'sheet'
        METHOD: 'local',
        
        // Firebase configuration (if using Firebase Auth)
        FIREBASE: {
            apiKey: '',
            authDomain: '',
            projectId: '',
            storageBucket: '',
            messagingSenderId: '',
            appId: ''
        },
        
        // Local storage keys
        STORAGE_KEYS: {
            USER: 'shoe_inventory_user',
            TOKEN: 'shoe_inventory_token',
            REMEMBER_ME: 'shoe_inventory_remember'
        },
        
        // Session timeout (in milliseconds)
        SESSION_TIMEOUT: 28800000, // 8 hours
        
        // Default users for local authentication (for demo purposes)
        DEFAULT_USERS: [
            {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'System Administrator',
                email: 'admin@shoemanufacturing.com'
            },
            {
                username: 'accounts',
                password: 'acc123',
                role: 'accounts',
                name: 'Accounts Manager',
                email: 'accounts@shoemanufacturing.com'
            },
            {
                username: 'production',
                password: 'prod123',
                role: 'production',
                name: 'Production Manager',
                email: 'production@shoemanufacturing.com'
            },
            {
                username: 'export',
                password: 'exp123',
                role: 'export',
                name: 'Export Manager',
                email: 'export@shoemanufacturing.com'
            }
        ]
    },
    
    // Role-based Access Control
    ROLES: {
        admin: {
            name: 'Administrator',
            permissions: ['read', 'write', 'delete', 'export', 'manage_users'],
            pages: ['dashboard', 'inventory', 'production', 'export', 'settings'],
            color: '#dc2626'
        },
        accounts: {
            name: 'Accounts',
            permissions: ['read', 'write', 'export'],
            pages: ['dashboard', 'inventory', 'export'],
            color: '#059669'
        },
        production: {
            name: 'Production',
            permissions: ['read', 'write'],
            pages: ['dashboard', 'inventory', 'production'],
            color: '#d97706'
        },
        export: {
            name: 'Export',
            permissions: ['read', 'export'],
            pages: ['dashboard', 'inventory', 'export'],
            color: '#7c3aed'
        }
    },
    
    // Chart Configuration
    CHARTS: {
        // Default chart colors
        COLORS: {
            PRIMARY: '#2563eb',
            SUCCESS: '#10b981',
            WARNING: '#f59e0b',
            ERROR: '#ef4444',
            INFO: '#06b6d4',
            SECONDARY: '#64748b'
        },
        
        // Chart.js default options
        DEFAULT_OPTIONS: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            }
        }
    },
    
    // Data Formatting
    FORMATTING: {
        // Currency settings
        CURRENCY: {
            SYMBOL: '$',
            LOCALE: 'en-US',
            DECIMAL_PLACES: 2
        },
        
        // Date settings
        DATE: {
            FORMAT: 'MM/dd/yyyy',
            LOCALE: 'en-US'
        },
        
        // Number settings
        NUMBER: {
            LOCALE: 'en-US',
            DECIMAL_PLACES: 2
        }
    },
    
    // Pagination
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 25,
        PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
        MAX_VISIBLE_PAGES: 5
    },
    
    // Toast Notifications
    TOAST: {
        DURATION: 5000, // 5 seconds
        POSITION: 'top-right',
        MAX_TOASTS: 3
    },
    
    // Data Validation
    VALIDATION: {
        // Field length limits
        MAX_LENGTHS: {
            NAME: 100,
            DESCRIPTION: 500,
            EMAIL: 255,
            PHONE: 20
        },
        
        // Required fields by data type
        REQUIRED_FIELDS: {
            PURCHASE_ORDER: ['po_number', 'supplier', 'date', 'total_amount'],
            PRODUCTION: ['batch_number', 'product_code', 'quantity', 'date'],
            FINISHED_GOODS: ['product_code', 'quantity', 'unit_price'],
            ISSUE: ['issue_type', 'description', 'date', 'reported_by'],
            BGRADE_SALE: ['product_code', 'quantity', 'sale_price', 'date']
        }
    },
    
    // API Endpoints (if using custom backend)
    API: {
        BASE_URL: '',
        ENDPOINTS: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            DATA: '/api/data',
            EXPORT: '/api/export'
        },
        TIMEOUT: 30000 // 30 seconds
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_OFFLINE_MODE: true,
        ENABLE_EXPORT: true,
        ENABLE_REAL_TIME_UPDATES: false,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_DARK_MODE: false
    },
    
    // Debug Settings
    DEBUG: {
        ENABLED: false, // Set to true for development
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        SHOW_PERFORMANCE: false
    }
};

// Freeze the configuration to prevent accidental modifications
Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
