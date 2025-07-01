/**
 * Utility functions for the inventory management app
 */

const Utils = {
    /**
     * Format currency values
     * @param {number} value - The numeric value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return '$0.00';
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
        
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(Number(value));
    },

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    },

    /**
     * Format date and time for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date and time string
     */
    formatDateTime(date) {
        if (!date) return '';
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
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
     * Escape HTML characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {string} type - Message type (loading, success, error, info)
     * @param {boolean} autoHide - Whether to auto-hide the message
     */
    showStatus(message, type = 'info', autoHide = false) {
        const container = document.getElementById('status-container');
        if (!container) return;

        // Clear existing messages
        container.innerHTML = '';

        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        
        // Add appropriate icon
        const icons = {
            loading: '<span class="spinner"></span>',
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        
        statusDiv.innerHTML = `
            ${icons[type] || icons.info}
            <span>${message}</span>
        `;
        
        container.appendChild(statusDiv);

        // Auto-hide after 5 seconds for success/error messages
        if (autoHide && (type === 'success' || type === 'error')) {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 5000);
        }
    },

    /**
     * Hide status messages
     */
    hideStatus() {
        const container = document.getElementById('status-container');
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Show/hide loading state for an element
     * @param {string|Element} element - Element or selector
     * @param {boolean} show - Whether to show loading state
     */
    toggleLoading(element, show) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        if (show) {
            el.classList.add('loading');
        } else {
            el.classList.remove('loading');
        }
    },

    /**
     * Export data to CSV
     * @param {Array} data - Data to export
     * @param {string} filename - Filename for download
     */
    exportToCSV(data, filename = 'inventory_data.csv') {
        if (!data || data.length === 0) {
            this.showStatus('No data to export', 'error', true);
            return;
        }
        
        try {
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
                        return value || '';
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
            
            this.showStatus('Data exported successfully!', 'success', true);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showStatus('Failed to export data', 'error', true);
        }
    },

    /**
     * Filter array by search term
     * @param {Array} array - Array to filter
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered array
     */
    filterBySearch(array, searchTerm) {
        if (!searchTerm || !array) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(term)
            );
        });
    },

    /**
     * Calculate summary statistics from data
     * @param {Array} data - Data array
     * @returns {Object} Summary statistics
     */
    calculateSummary(data) {
        if (!data || data.length === 0) {
            return {
                totalItems: 0,
                totalQuantity: 0,
                totalValue: 0,
                lastUpdated: 'Never'
            };
        }

        const summary = {
            totalItems: data.length,
            totalQuantity: 0,
            totalValue: 0,
            lastUpdated: this.formatDateTime(new Date())
        };

        data.forEach(item => {
            // Try different possible field names for quantity
            const quantity = this.parseNumber(
                item.quantity || item.qty || item.amount || 0
            );
            
            // Try different possible field names for value/price
            const value = this.parseNumber(
                item.total_value || item.value || item.price || 
                item.total || item.amount || 0
            );

            summary.totalQuantity += quantity;
            summary.totalValue += value;
        });

        return summary;
    },

    /**
     * Parse number from various formats
     * @param {*} value - Value to parse
     * @returns {number} Parsed number
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        
        // Remove currency symbols and commas
        const cleaned = String(value).replace(/[$,]/g, '');
        const parsed = parseFloat(cleaned);
        
        return isNaN(parsed) ? 0 : parsed;
    },

    /**
     * Generate a unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Smooth scroll to element
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
    },

    /**
     * Log messages with timestamp (for debugging)
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Message to log
     * @param {*} data - Additional data to log
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level) {
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
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
