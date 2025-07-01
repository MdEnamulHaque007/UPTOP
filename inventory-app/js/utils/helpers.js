/**
 * Utility helper functions for the Inventory Management Dashboard
 * Contains date manipulation, formatting, validation, and other utility functions
 */

const Helpers = {
    /**
     * Format currency values
     * @param {number} value - The numeric value to format
     * @param {string} currency - Currency symbol (default from config)
     * @returns {string} Formatted currency string
     */
    formatCurrency(value, currency = CONFIG.CURRENCY.SYMBOL) {
        if (value === null || value === undefined || isNaN(value)) {
            return `${currency}0.00`;
        }
        
        return new Intl.NumberFormat(CONFIG.CURRENCY.LOCALE, {
            style: 'currency',
            currency: currency === '$' ? 'USD' : currency,
            minimumFractionDigits: CONFIG.CURRENCY.DECIMAL_PLACES,
            maximumFractionDigits: CONFIG.CURRENCY.DECIMAL_PLACES
        }).format(Number(value));
    },

    /**
     * Format numbers with thousands separators
     * @param {number} value - The numeric value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    formatNumber(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        
        return new Intl.NumberFormat(CONFIG.CURRENCY.LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(Number(value));
    },

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @param {string} format - Format string (optional)
     * @returns {string} Formatted date string
     */
    formatDate(date, format = CONFIG.DATE_FORMATS.DISPLAY) {
        if (!date) return '';
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        // Simple format mapping
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        };
        
        return dateObj.toLocaleDateString('en-US', options);
    },

    /**
     * Parse date from various formats
     * @param {string} dateString - Date string to parse
     * @returns {Date|null} Parsed date or null if invalid
     */
    parseDate(dateString) {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Get date range based on filter type
     * @param {string} filterType - Type of date filter
     * @returns {Object} Object with startDate and endDate
     */
    getDateRange(filterType) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filterType) {
            case 'today':
                return {
                    startDate: new Date(today),
                    endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
                };
                
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                return {
                    startDate: startOfWeek,
                    endDate: endOfWeek
                };
                
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                
                return {
                    startDate: startOfMonth,
                    endDate: endOfMonth
                };
                
            case 'all':
            default:
                return {
                    startDate: null,
                    endDate: null
                };
        }
    },

    /**
     * Check if a date is within a range
     * @param {Date} date - Date to check
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @returns {boolean} True if date is within range
     */
    isDateInRange(date, startDate, endDate) {
        if (!date) return false;
        if (!startDate && !endDate) return true;
        
        const checkDate = new Date(date);
        
        if (startDate && checkDate < startDate) return false;
        if (endDate && checkDate > endDate) return false;
        
        return true;
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = CONFIG.UI.DEBOUNCE_DELAY) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 1000) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Validate data against schema
     * @param {Object} data - Data to validate
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result
     */
    validateData(data, schema = CONFIG.DATA_SCHEMA) {
        const errors = [];
        const requiredFields = schema.REQUIRED_FIELDS || [];
        const fieldTypes = schema.FIELD_TYPES || {};
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!(field in data) || data[field] === null || data[field] === undefined) {
                errors.push(`Missing required field: ${field}`);
            }
        });
        
        // Check field types
        Object.keys(fieldTypes).forEach(field => {
            if (field in data && data[field] !== null && data[field] !== undefined) {
                const expectedType = fieldTypes[field];
                const actualValue = data[field];
                
                switch (expectedType) {
                    case 'number':
                        if (isNaN(Number(actualValue))) {
                            errors.push(`Field ${field} should be a number`);
                        }
                        break;
                    case 'date':
                        if (!this.parseDate(actualValue)) {
                            errors.push(`Field ${field} should be a valid date`);
                        }
                        break;
                    case 'string':
                        if (typeof actualValue !== 'string') {
                            errors.push(`Field ${field} should be a string`);
                        }
                        break;
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Sort array of objects by field
     * @param {Array} array - Array to sort
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} Sorted array
     */
    sortArray(array, field, direction = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            // Handle different data types
            if (CONFIG.DATA_SCHEMA.FIELD_TYPES[field] === 'number') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else if (CONFIG.DATA_SCHEMA.FIELD_TYPES[field] === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filter array by search term
     * @param {Array} array - Array to filter
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered array
     */
    filterBySearch(array, searchTerm) {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(term)
            );
        });
    },

    /**
     * Calculate percentage change
     * @param {number} current - Current value
     * @param {number} previous - Previous value
     * @returns {Object} Change object with value and percentage
     */
    calculateChange(current, previous) {
        if (!previous || previous === 0) {
            return { value: current, percentage: 0, direction: 'neutral' };
        }
        
        const change = current - previous;
        const percentage = (change / previous) * 100;
        const direction = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        return {
            value: change,
            percentage: Math.abs(percentage),
            direction
        };
    },

    /**
     * Export data to CSV
     * @param {Array} data - Data to export
     * @param {string} filename - Filename for download
     */
    exportToCSV(data, filename = 'inventory_data.csv') {
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes in values
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    /**
     * Get status badge class
     * @param {string} status - Status value
     * @returns {string} CSS class for status badge
     */
    getStatusClass(status) {
        if (!status) return 'status-badge';
        
        const statusLower = status.toLowerCase();
        
        if (statusLower.includes('completed') || statusLower.includes('delivered')) {
            return 'status-badge completed';
        } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
            return 'status-badge pending';
        } else if (statusLower.includes('cancelled') || statusLower.includes('rejected')) {
            return 'status-badge cancelled';
        }
        
        return 'status-badge';
    },

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Scroll to element smoothly
     * @param {string|Element} element - Element or selector to scroll to
     * @param {number} offset - Offset from top
     */
    scrollTo(element, offset = 0) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;
        
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
}
