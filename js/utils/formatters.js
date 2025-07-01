/**
 * Data Formatters
 * Utility functions for formatting data display
 */

const Formatters = {
    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @param {string} currency - Currency code (default: from config)
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted currency string
     */
    currency(value, currency = CONFIG.FORMATTING.CURRENCY.SYMBOL, decimals = CONFIG.FORMATTING.CURRENCY.DECIMAL_PLACES) {
        if (value === null || value === undefined || isNaN(value)) {
            return `${currency}0.00`;
        }
        
        const num = Number(value);
        return new Intl.NumberFormat(CONFIG.FORMATTING.CURRENCY.LOCALE, {
            style: 'currency',
            currency: currency === '$' ? 'USD' : currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    
    /**
     * Format number with thousands separators
     * @param {number} value - Numeric value
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted number string
     */
    number(value, decimals = CONFIG.FORMATTING.NUMBER.DECIMAL_PLACES) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        
        const num = Number(value);
        return new Intl.NumberFormat(CONFIG.FORMATTING.NUMBER.LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    
    /**
     * Format percentage
     * @param {number} value - Numeric value (0-100 or 0-1)
     * @param {number} decimals - Number of decimal places
     * @param {boolean} isDecimal - Whether input is decimal (0-1) or percentage (0-100)
     * @returns {string} - Formatted percentage string
     */
    percentage(value, decimals = 1, isDecimal = false) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }
        
        const num = Number(value);
        const percentage = isDecimal ? num * 100 : num;
        
        return new Intl.NumberFormat(CONFIG.FORMATTING.NUMBER.LOCALE, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(isDecimal ? num : num / 100);
    },
    
    /**
     * Format date
     * @param {Date|string|number} date - Date to format
     * @param {string} format - Format string (default: from config)
     * @returns {string} - Formatted date string
     */
    date(date, format = CONFIG.FORMATTING.DATE.FORMAT) {
        if (!date) return '';
        
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        } else {
            return '';
        }
        
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        // Simple format mapping
        const formatMap = {
            'MM/dd/yyyy': { month: '2-digit', day: '2-digit', year: 'numeric' },
            'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
            'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
            'MMM dd, yyyy': { month: 'short', day: 'numeric', year: 'numeric' },
            'MMMM dd, yyyy': { month: 'long', day: 'numeric', year: 'numeric' }
        };
        
        const options = formatMap[format] || formatMap['MM/dd/yyyy'];
        
        return new Intl.DateTimeFormat(CONFIG.FORMATTING.DATE.LOCALE, options).format(dateObj);
    },
    
    /**
     * Format time
     * @param {Date|string|number} date - Date/time to format
     * @param {boolean} includeSeconds - Whether to include seconds
     * @returns {string} - Formatted time string
     */
    time(date, includeSeconds = false) {
        if (!date) return '';
        
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        } else {
            return '';
        }
        
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        if (includeSeconds) {
            options.second = '2-digit';
        }
        
        return new Intl.DateTimeFormat(CONFIG.FORMATTING.DATE.LOCALE, options).format(dateObj);
    },
    
    /**
     * Format datetime
     * @param {Date|string|number} date - Date/time to format
     * @param {string} dateFormat - Date format
     * @param {boolean} includeSeconds - Whether to include seconds in time
     * @returns {string} - Formatted datetime string
     */
    datetime(date, dateFormat = CONFIG.FORMATTING.DATE.FORMAT, includeSeconds = false) {
        const formattedDate = this.date(date, dateFormat);
        const formattedTime = this.time(date, includeSeconds);
        
        if (!formattedDate || !formattedTime) return '';
        
        return `${formattedDate} ${formattedTime}`;
    },
    
    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {Date|string|number} date - Date to format
     * @returns {string} - Relative time string
     */
    relativeTime(date) {
        if (!date) return '';
        
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        } else {
            return '';
        }
        
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return this.date(dateObj);
        }
    },
    
    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted file size
     */
    fileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return '';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },
    
    /**
     * Format phone number
     * @param {string} phone - Phone number
     * @param {string} format - Format pattern
     * @returns {string} - Formatted phone number
     */
    phone(phone, format = '(###) ###-####') {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return format
                .replace(/###/g, () => cleaned.substr(0, 3))
                .replace(/###/g, () => cleaned.substr(3, 3))
                .replace(/####/g, () => cleaned.substr(6, 4));
        }
        
        return phone; // Return original if can't format
    },
    
    /**
     * Format text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add
     * @returns {string} - Truncated text
     */
    truncate(text, maxLength, suffix = '...') {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },
    
    /**
     * Format status badge
     * @param {string} status - Status value
     * @param {Object} statusMap - Status to display mapping
     * @returns {string} - HTML for status badge
     */
    statusBadge(status, statusMap = {}) {
        if (!status) return '';
        
        const defaultMap = {
            active: { text: 'Active', class: 'badge-success' },
            inactive: { text: 'Inactive', class: 'badge-secondary' },
            pending: { text: 'Pending', class: 'badge-warning' },
            completed: { text: 'Completed', class: 'badge-success' },
            cancelled: { text: 'Cancelled', class: 'badge-error' },
            draft: { text: 'Draft', class: 'badge-secondary' },
            published: { text: 'Published', class: 'badge-success' }
        };
        
        const map = { ...defaultMap, ...statusMap };
        const statusConfig = map[status.toLowerCase()] || { text: status, class: 'badge-secondary' };
        
        return `<span class="badge ${statusConfig.class}">${statusConfig.text}</span>`;
    },
    
    /**
     * Format priority indicator
     * @param {string|number} priority - Priority value
     * @returns {string} - HTML for priority indicator
     */
    priority(priority) {
        if (!priority) return '';
        
        const priorityMap = {
            1: { text: 'Low', class: 'badge-info', icon: 'fa-arrow-down' },
            2: { text: 'Medium', class: 'badge-warning', icon: 'fa-minus' },
            3: { text: 'High', class: 'badge-error', icon: 'fa-arrow-up' },
            low: { text: 'Low', class: 'badge-info', icon: 'fa-arrow-down' },
            medium: { text: 'Medium', class: 'badge-warning', icon: 'fa-minus' },
            high: { text: 'High', class: 'badge-error', icon: 'fa-arrow-up' }
        };
        
        const config = priorityMap[priority.toString().toLowerCase()];
        if (!config) return priority;
        
        return `<span class="badge ${config.class}">
            <i class="fas ${config.icon}"></i> ${config.text}
        </span>`;
    },
    
    /**
     * Format change indicator (positive/negative)
     * @param {number} value - Change value
     * @param {boolean} isPercentage - Whether value is percentage
     * @param {boolean} reverseColors - Reverse color logic (red for positive)
     * @returns {string} - HTML for change indicator
     */
    changeIndicator(value, isPercentage = false, reverseColors = false) {
        if (value === null || value === undefined || isNaN(value)) {
            return '<span class="text-muted">—</span>';
        }
        
        const num = Number(value);
        const isPositive = num > 0;
        const isNegative = num < 0;
        
        let colorClass = 'text-muted';
        let icon = 'fa-minus';
        
        if (isPositive) {
            colorClass = reverseColors ? 'text-error' : 'text-success';
            icon = 'fa-arrow-up';
        } else if (isNegative) {
            colorClass = reverseColors ? 'text-success' : 'text-error';
            icon = 'fa-arrow-down';
        }
        
        const formattedValue = isPercentage ? 
            this.percentage(Math.abs(num), 1, true) : 
            this.number(Math.abs(num));
        
        return `<span class="${colorClass}">
            <i class="fas ${icon}"></i> ${formattedValue}
        </span>`;
    },
    
    /**
     * Format list of items
     * @param {Array} items - Array of items
     * @param {string} separator - Separator between items
     * @param {number} maxItems - Maximum items to show
     * @returns {string} - Formatted list
     */
    list(items, separator = ', ', maxItems = null) {
        if (!Array.isArray(items) || items.length === 0) return '';
        
        let displayItems = items;
        
        if (maxItems && items.length > maxItems) {
            displayItems = items.slice(0, maxItems);
            const remaining = items.length - maxItems;
            displayItems.push(`+${remaining} more`);
        }
        
        return displayItems.join(separator);
    },
    
    /**
     * Format boolean as Yes/No
     * @param {boolean} value - Boolean value
     * @param {string} trueText - Text for true value
     * @param {string} falseText - Text for false value
     * @returns {string} - Formatted boolean
     */
    boolean(value, trueText = 'Yes', falseText = 'No') {
        if (value === null || value === undefined) return '';
        return value ? trueText : falseText;
    },
    
    /**
     * Format address
     * @param {Object} address - Address object
     * @returns {string} - Formatted address
     */
    address(address) {
        if (!address || typeof address !== 'object') return '';
        
        const parts = [
            address.street,
            address.city,
            address.state,
            address.zip,
            address.country
        ].filter(part => part && part.trim());
        
        return parts.join(', ');
    },
    
    /**
     * Format name (first last)
     * @param {Object|string} name - Name object or string
     * @returns {string} - Formatted name
     */
    name(name) {
        if (!name) return '';
        
        if (typeof name === 'string') return name;
        
        if (typeof name === 'object') {
            const parts = [name.first, name.middle, name.last].filter(part => part && part.trim());
            return parts.join(' ');
        }
        
        return '';
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Formatters = Formatters;
}
