/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

const Helpers = {
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} - Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
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
     * @returns {*} - Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },
    
    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} - Whether value is empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },
    
    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} - Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalize(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} - Title case string
     */
    titleCase(str) {
        if (!str || typeof str !== 'string') return '';
        return str.toLowerCase().split(' ').map(word => this.capitalize(word)).join(' ');
    },
    
    /**
     * Convert camelCase to kebab-case
     * @param {string} str - String to convert
     * @returns {string} - Kebab case string
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    },
    
    /**
     * Convert kebab-case to camelCase
     * @param {string} str - String to convert
     * @returns {string} - Camel case string
     */
    kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    /**
     * Truncate string to specified length
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} - Truncated string
     */
    truncate(str, length, suffix = '...') {
        if (!str || typeof str !== 'string') return '';
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },
    
    /**
     * Escape HTML characters
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    /**
     * Parse query string to object
     * @param {string} queryString - Query string to parse
     * @returns {Object} - Parsed object
     */
    parseQueryString(queryString) {
        const params = {};
        const pairs = (queryString || window.location.search.slice(1)).split('&');
        
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        
        return params;
    },
    
    /**
     * Convert object to query string
     * @param {Object} obj - Object to convert
     * @returns {string} - Query string
     */
    objectToQueryString(obj) {
        const pairs = [];
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
                pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
            }
        }
        
        return pairs.join('&');
    },
    
    /**
     * Get nested object property safely
     * @param {Object} obj - Object to search
     * @param {string} path - Dot notation path
     * @param {*} defaultValue - Default value if not found
     * @returns {*} - Property value or default
     */
    getNestedProperty(obj, path, defaultValue = null) {
        try {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : defaultValue;
            }, obj);
        } catch {
            return defaultValue;
        }
    },
    
    /**
     * Set nested object property
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    },
    
    /**
     * Sort array of objects by property
     * @param {Array} array - Array to sort
     * @param {string} property - Property to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} - Sorted array
     */
    sortByProperty(array, property, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = this.getNestedProperty(a, property);
            const bVal = this.getNestedProperty(b, property);
            
            if (aVal === bVal) return 0;
            
            const comparison = aVal < bVal ? -1 : 1;
            return direction === 'asc' ? comparison : -comparison;
        });
    },
    
    /**
     * Filter array by search term
     * @param {Array} array - Array to filter
     * @param {string} searchTerm - Search term
     * @param {Array} searchFields - Fields to search in
     * @returns {Array} - Filtered array
     */
    filterBySearch(array, searchTerm, searchFields = []) {
        if (!searchTerm || !searchTerm.trim()) return array;
        
        const term = searchTerm.toLowerCase().trim();
        
        return array.filter(item => {
            if (searchFields.length === 0) {
                // Search all string properties
                return Object.values(item).some(value => 
                    typeof value === 'string' && value.toLowerCase().includes(term)
                );
            } else {
                // Search specific fields
                return searchFields.some(field => {
                    const value = this.getNestedProperty(item, field);
                    return typeof value === 'string' && value.toLowerCase().includes(term);
                });
            }
        });
    },
    
    /**
     * Group array by property
     * @param {Array} array - Array to group
     * @param {string} property - Property to group by
     * @returns {Object} - Grouped object
     */
    groupBy(array, property) {
        return array.reduce((groups, item) => {
            const key = this.getNestedProperty(item, property);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    },
    
    /**
     * Calculate percentage
     * @param {number} value - Value
     * @param {number} total - Total
     * @param {number} decimals - Number of decimal places
     * @returns {number} - Percentage
     */
    percentage(value, total, decimals = 2) {
        if (total === 0) return 0;
        return Number(((value / total) * 100).toFixed(decimals));
    },
    
    /**
     * Calculate sum of array property
     * @param {Array} array - Array to sum
     * @param {string} property - Property to sum
     * @returns {number} - Sum
     */
    sum(array, property) {
        return array.reduce((total, item) => {
            const value = this.getNestedProperty(item, property);
            return total + (Number(value) || 0);
        }, 0);
    },
    
    /**
     * Calculate average of array property
     * @param {Array} array - Array to average
     * @param {string} property - Property to average
     * @returns {number} - Average
     */
    average(array, property) {
        if (array.length === 0) return 0;
        return this.sum(array, property) / array.length;
    },
    
    /**
     * Get unique values from array property
     * @param {Array} array - Array to process
     * @param {string} property - Property to get unique values from
     * @returns {Array} - Unique values
     */
    unique(array, property) {
        const values = array.map(item => this.getNestedProperty(item, property));
        return [...new Set(values)];
    },
    
    /**
     * Check if device is mobile
     * @returns {boolean} - Whether device is mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    /**
     * Check if device is tablet
     * @returns {boolean} - Whether device is tablet
     */
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    /**
     * Check if device is desktop
     * @returns {boolean} - Whether device is desktop
     */
    isDesktop() {
        return window.innerWidth > 1024;
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Whether copy was successful
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    },
    
    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - Filename
     * @param {string} type - MIME type
     */
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
    
    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted size
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },
    
    /**
     * Wait for specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} - Promise that resolves after wait time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} - Promise that resolves with function result
     */
    async retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (i === maxRetries) {
                    throw lastError;
                }
                
                const delay = baseDelay * Math.pow(2, i);
                await this.wait(delay);
            }
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
}
