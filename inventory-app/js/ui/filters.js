/**
 * Filters UI Component
 * Handles date filtering, search, and other filter controls
 */

class Filters {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
    }

    /**
     * Initialize filters component
     */
    init() {
        if (this.isInitialized) return;
        
        this.cacheElements();
        this.attachEventListeners();
        this.loadSavedFilters();
        this.setupCustomDateRange();
        
        this.isInitialized = true;
        CONFIG.log('info', 'Filters component initialized');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            dateFilter: document.getElementById('date-filter'),
            startDate: document.getElementById('start-date'),
            endDate: document.getElementById('end-date'),
            applyFilters: document.getElementById('apply-filters'),
            customDateRanges: document.querySelectorAll('.custom-date-range')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Date range filter change
        if (this.elements.dateFilter) {
            this.elements.dateFilter.addEventListener('change', (e) => {
                this.handleDateRangeChange(e.target.value);
            });
        }

        // Custom date inputs
        if (this.elements.startDate) {
            this.elements.startDate.addEventListener('change', (e) => {
                this.handleCustomDateChange('startDate', e.target.value);
            });
        }

        if (this.elements.endDate) {
            this.elements.endDate.addEventListener('change', (e) => {
                this.handleCustomDateChange('endDate', e.target.value);
            });
        }

        // Apply filters button
        if (this.elements.applyFilters) {
            this.elements.applyFilters.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Subscribe to state changes
        stateManager.subscribe('filters', (filters) => {
            this.updateUI(filters);
        });

        // Listen for Enter key on date inputs
        [this.elements.startDate, this.elements.endDate].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyFilters();
                    }
                });
            }
        });
    }

    /**
     * Handle date range filter change
     * @param {string} value - Selected date range value
     */
    handleDateRangeChange(value) {
        CONFIG.log('debug', 'Date range changed', value);
        
        // Update state
        stateManager.set('filters.dateRange', value);
        
        // Show/hide custom date inputs
        this.toggleCustomDateRange(value === 'custom');
        
        // If not custom, clear custom dates and apply filters
        if (value !== 'custom') {
            stateManager.update('filters', {
                startDate: null,
                endDate: null
            });
            this.applyFilters();
        }
    }

    /**
     * Handle custom date input change
     * @param {string} field - Field name (startDate or endDate)
     * @param {string} value - Date value
     */
    handleCustomDateChange(field, value) {
        CONFIG.log('debug', 'Custom date changed', { field, value });
        
        // Validate date
        if (value && !Helpers.parseDate(value)) {
            this.showError('Invalid date format');
            return;
        }
        
        // Update state
        stateManager.set(`filters.${field}`, value || null);
        
        // Validate date range
        if (this.validateDateRange()) {
            this.clearError();
        }
    }

    /**
     * Toggle custom date range visibility
     * @param {boolean} show - Whether to show custom date range
     */
    toggleCustomDateRange(show) {
        this.elements.customDateRanges.forEach(element => {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }

    /**
     * Validate date range
     * @returns {boolean} True if valid
     */
    validateDateRange() {
        const filters = stateManager.get('filters');
        
        if (!filters.startDate || !filters.endDate) {
            return true; // Allow partial ranges
        }
        
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        
        if (startDate > endDate) {
            this.showError('Start date must be before end date');
            return false;
        }
        
        return true;
    }

    /**
     * Apply current filters
     */
    applyFilters() {
        CONFIG.log('info', 'Applying filters');
        
        // Validate filters first
        if (!this.validateDateRange()) {
            return;
        }
        
        // Show loading state
        const restoreButton = loader.showButton(this.elements.applyFilters, 'Applying...');
        
        try {
            // Apply filters through state manager
            stateManager.applyFilters();
            
            // Show success message
            this.showToast(CONFIG.SUCCESS_MESSAGES.FILTERS_APPLIED, 'success');
            
            // Emit filter applied event
            this.emitEvent('filters:applied', stateManager.get('filters'));
            
        } catch (error) {
            CONFIG.log('error', 'Failed to apply filters', error);
            this.showToast(CONFIG.ERROR_MESSAGES.FILTER_ERROR, 'error');
        } finally {
            // Restore button state
            setTimeout(restoreButton, 500);
        }
    }

    /**
     * Reset filters to default values
     */
    resetFilters() {
        CONFIG.log('info', 'Resetting filters');
        
        // Reset state to defaults
        stateManager.set('filters', CONFIG.DEFAULT_FILTERS);
        
        // Update UI
        this.updateUI(CONFIG.DEFAULT_FILTERS);
        
        // Apply filters
        this.applyFilters();
        
        // Show success message
        this.showToast('Filters reset to default', 'info');
    }

    /**
     * Update UI based on current filters
     * @param {Object} filters - Current filter values
     */
    updateUI(filters) {
        // Update date range select
        if (this.elements.dateFilter) {
            this.elements.dateFilter.value = filters.dateRange || 'month';
        }
        
        // Update custom date inputs
        if (this.elements.startDate) {
            this.elements.startDate.value = filters.startDate || '';
        }
        
        if (this.elements.endDate) {
            this.elements.endDate.value = filters.endDate || '';
        }
        
        // Show/hide custom date range
        this.toggleCustomDateRange(filters.dateRange === 'custom');
    }

    /**
     * Load saved filters from state
     */
    loadSavedFilters() {
        const filters = stateManager.get('filters');
        this.updateUI(filters);
    }

    /**
     * Set up custom date range with default values
     */
    setupCustomDateRange() {
        // Set default date range for custom selection
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        if (this.elements.startDate && !this.elements.startDate.value) {
            this.elements.startDate.value = lastMonth.toISOString().split('T')[0];
        }
        
        if (this.elements.endDate && !this.elements.endDate.value) {
            this.elements.endDate.value = today.toISOString().split('T')[0];
        }
    }

    /**
     * Get current filter summary for display
     * @returns {string} Filter summary text
     */
    getFilterSummary() {
        const filters = stateManager.get('filters');
        const parts = [];
        
        // Date range summary
        if (filters.dateRange === 'custom' && (filters.startDate || filters.endDate)) {
            const start = filters.startDate ? Helpers.formatDate(filters.startDate) : 'Beginning';
            const end = filters.endDate ? Helpers.formatDate(filters.endDate) : 'Now';
            parts.push(`${start} - ${end}`);
        } else if (filters.dateRange !== 'all') {
            const rangeNames = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month'
            };
            parts.push(rangeNames[filters.dateRange] || filters.dateRange);
        }
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
            parts.push(`Status: ${filters.status}`);
        }
        
        // Supplier filter
        if (filters.supplier && filters.supplier !== 'all') {
            parts.push(`Supplier: ${filters.supplier}`);
        }
        
        return parts.length > 0 ? parts.join(', ') : 'No filters applied';
    }

    /**
     * Export current filters
     * @returns {Object} Current filter values
     */
    exportFilters() {
        return stateManager.get('filters');
    }

    /**
     * Import filters
     * @param {Object} filters - Filter values to import
     */
    importFilters(filters) {
        stateManager.set('filters', filters);
        this.updateUI(filters);
        this.applyFilters();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Remove existing error
        this.clearError();
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'filter-error';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        // Insert after filters container
        const filtersContainer = document.querySelector('.filters-container');
        if (filtersContainer) {
            filtersContainer.parentNode.insertBefore(errorElement, filtersContainer.nextSibling);
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        const errorElement = document.querySelector('.filter-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add to container
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after delay
            setTimeout(() => {
                toast.remove();
            }, CONFIG.UI.TOAST_DURATION);
        }
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon class
     */
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy filters component
     */
    destroy() {
        // Remove event listeners would go here
        // For now, just mark as not initialized
        this.isInitialized = false;
    }
}

// Create singleton instance
const filters = new Filters();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = filters;
}
