/**
 * State Manager
 * Central state management with reactive update pattern
 * Manages application state and notifies subscribers of changes
 */

class StateManager {
    constructor() {
        this.state = {
            // Data state
            data: {
                raw: [],
                filtered: [],
                summary: {
                    totalOrders: 0,
                    totalQuantity: 0,
                    totalValue: 0,
                    avgOrderValue: 0
                },
                lastUpdated: null,
                isLoading: false,
                error: null
            },
            
            // UI state
            ui: {
                currentPage: 1,
                itemsPerPage: CONFIG.UI.ITEMS_PER_PAGE,
                sortField: 'date',
                sortDirection: 'desc',
                searchTerm: '',
                selectedChartType: 'line',
                theme: 'light'
            },
            
            // Filter state
            filters: {
                dateRange: 'month',
                startDate: null,
                endDate: null,
                status: 'all',
                supplier: 'all'
            }
        };
        
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        
        // Load persisted state
        this.loadPersistedState();
    }

    /**
     * Subscribe to state changes
     * @param {string} path - State path to watch (e.g., 'data.raw', 'ui.currentPage')
     * @param {Function} callback - Callback function to execute on change
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        this.subscribers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const pathSubscribers = this.subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }

    /**
     * Get state value by path
     * @param {string} path - State path (e.g., 'data.raw', 'ui.currentPage')
     * @returns {*} State value
     */
    get(path) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, this.state);
    }

    /**
     * Set state value by path
     * @param {string} path - State path
     * @param {*} value - New value
     * @param {boolean} notify - Whether to notify subscribers (default: true)
     */
    set(path, value, notify = true) {
        const oldValue = this.get(path);
        
        // Set the value
        this.setNestedValue(this.state, path, value);
        
        // Add to history
        this.addToHistory({
            type: 'SET',
            path,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        
        // Notify subscribers
        if (notify) {
            this.notifySubscribers(path, value, oldValue);
        }
        
        // Persist certain state changes
        this.persistState();
    }

    /**
     * Update state by merging with existing value
     * @param {string} path - State path
     * @param {Object} updates - Updates to merge
     * @param {boolean} notify - Whether to notify subscribers
     */
    update(path, updates, notify = true) {
        const currentValue = this.get(path);
        
        if (typeof currentValue === 'object' && currentValue !== null) {
            const newValue = { ...currentValue, ...updates };
            this.set(path, newValue, notify);
        } else {
            this.set(path, updates, notify);
        }
    }

    /**
     * Set nested value in object
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    /**
     * Notify subscribers of state changes
     * @param {string} path - Changed path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    notifySubscribers(path, newValue, oldValue) {
        // Notify exact path subscribers
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    CONFIG.log('error', 'Subscriber callback error', error);
                }
            });
        }
        
        // Notify parent path subscribers
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentSubscribers = this.subscribers.get(parentPath);
            
            if (parentSubscribers) {
                const parentValue = this.get(parentPath);
                parentSubscribers.forEach(callback => {
                    try {
                        callback(parentValue, null, parentPath);
                    } catch (error) {
                        CONFIG.log('error', 'Parent subscriber callback error', error);
                    }
                });
            }
        }
        
        // Notify wildcard subscribers
        const wildcardSubscribers = this.subscribers.get('*');
        if (wildcardSubscribers) {
            wildcardSubscribers.forEach(callback => {
                try {
                    callback(this.state, null, '*');
                } catch (error) {
                    CONFIG.log('error', 'Wildcard subscriber callback error', error);
                }
            });
        }
    }

    /**
     * Add entry to state history
     * @param {Object} entry - History entry
     */
    addToHistory(entry) {
        this.history.push(entry);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Get state history
     * @param {number} limit - Number of entries to return
     * @returns {Array} History entries
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * Reset state to initial values
     * @param {string} path - Specific path to reset (optional)
     */
    reset(path = null) {
        if (path) {
            const initialValue = this.getInitialValue(path);
            this.set(path, initialValue);
        } else {
            this.state = this.getInitialState();
            this.notifySubscribers('*', this.state, null);
        }
    }

    /**
     * Get initial state structure
     * @returns {Object} Initial state
     */
    getInitialState() {
        return {
            data: {
                raw: [],
                filtered: [],
                summary: {
                    totalOrders: 0,
                    totalQuantity: 0,
                    totalValue: 0,
                    avgOrderValue: 0
                },
                lastUpdated: null,
                isLoading: false,
                error: null
            },
            ui: {
                currentPage: 1,
                itemsPerPage: CONFIG.UI.ITEMS_PER_PAGE,
                sortField: 'date',
                sortDirection: 'desc',
                searchTerm: '',
                selectedChartType: 'line',
                theme: 'light'
            },
            filters: {
                dateRange: 'month',
                startDate: null,
                endDate: null,
                status: 'all',
                supplier: 'all'
            }
        };
    }

    /**
     * Get initial value for specific path
     * @param {string} path - State path
     * @returns {*} Initial value
     */
    getInitialValue(path) {
        const initialState = this.getInitialState();
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, initialState);
    }

    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        try {
            const persistedState = localStorage.getItem(CONFIG.STORAGE_KEYS.FILTERS);
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                
                // Only restore certain state properties
                if (parsed.filters) {
                    this.state.filters = { ...this.state.filters, ...parsed.filters };
                }
                
                if (parsed.ui) {
                    this.state.ui = {
                        ...this.state.ui,
                        theme: parsed.ui.theme || 'light',
                        itemsPerPage: parsed.ui.itemsPerPage || CONFIG.UI.ITEMS_PER_PAGE,
                        selectedChartType: parsed.ui.selectedChartType || 'line'
                    };
                }
                
                CONFIG.log('info', 'Persisted state loaded');
            }
        } catch (error) {
            CONFIG.log('warn', 'Failed to load persisted state', error);
        }
    }

    /**
     * Persist state to localStorage
     */
    persistState() {
        try {
            const stateToPersist = {
                filters: this.state.filters,
                ui: {
                    theme: this.state.ui.theme,
                    itemsPerPage: this.state.ui.itemsPerPage,
                    selectedChartType: this.state.ui.selectedChartType
                }
            };
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.FILTERS, JSON.stringify(stateToPersist));
        } catch (error) {
            CONFIG.log('warn', 'Failed to persist state', error);
        }
    }

    /**
     * Calculate and update summary data
     * @param {Array} data - Data to calculate summary from
     */
    updateSummary(data = null) {
        const dataToUse = data || this.get('data.filtered') || [];
        
        const summary = {
            totalOrders: dataToUse.length,
            totalQuantity: dataToUse.reduce((sum, item) => sum + (item.quantity || 0), 0),
            totalValue: dataToUse.reduce((sum, item) => sum + (item.total_value || 0), 0),
            avgOrderValue: 0
        };
        
        if (summary.totalOrders > 0) {
            summary.avgOrderValue = summary.totalValue / summary.totalOrders;
        }
        
        this.set('data.summary', summary);
    }

    /**
     * Apply filters to raw data
     */
    applyFilters() {
        const rawData = this.get('data.raw') || [];
        const filters = this.get('filters');
        const ui = this.get('ui');
        
        let filteredData = [...rawData];
        
        // Apply date filter
        if (filters.dateRange !== 'all') {
            const dateRange = Helpers.getDateRange(filters.dateRange);
            filteredData = filteredData.filter(item => {
                const itemDate = Helpers.parseDate(item.date);
                return Helpers.isDateInRange(itemDate, dateRange.startDate, dateRange.endDate);
            });
        }
        
        // Apply custom date range
        if (filters.startDate || filters.endDate) {
            filteredData = filteredData.filter(item => {
                const itemDate = Helpers.parseDate(item.date);
                return Helpers.isDateInRange(
                    itemDate,
                    filters.startDate ? new Date(filters.startDate) : null,
                    filters.endDate ? new Date(filters.endDate) : null
                );
            });
        }
        
        // Apply status filter
        if (filters.status !== 'all') {
            filteredData = filteredData.filter(item => 
                item.status && item.status.toLowerCase() === filters.status.toLowerCase()
            );
        }
        
        // Apply supplier filter
        if (filters.supplier !== 'all') {
            filteredData = filteredData.filter(item => 
                item.supplier && item.supplier.toLowerCase() === filters.supplier.toLowerCase()
            );
        }
        
        // Apply search filter
        if (ui.searchTerm) {
            filteredData = Helpers.filterBySearch(filteredData, ui.searchTerm);
        }
        
        // Apply sorting
        if (ui.sortField) {
            filteredData = Helpers.sortArray(filteredData, ui.sortField, ui.sortDirection);
        }
        
        this.set('data.filtered', filteredData, false);
        this.updateSummary(filteredData);
        
        // Reset to first page when filters change
        this.set('ui.currentPage', 1);
    }

    /**
     * Get paginated data for current page
     * @returns {Array} Paginated data
     */
    getPaginatedData() {
        const filteredData = this.get('data.filtered') || [];
        const currentPage = this.get('ui.currentPage');
        const itemsPerPage = this.get('ui.itemsPerPage');
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return filteredData.slice(startIndex, endIndex);
    }

    /**
     * Get total number of pages
     * @returns {number} Total pages
     */
    getTotalPages() {
        const filteredData = this.get('data.filtered') || [];
        const itemsPerPage = this.get('ui.itemsPerPage');
        
        return Math.ceil(filteredData.length / itemsPerPage);
    }

    /**
     * Get unique values for a field (for filter options)
     * @param {string} field - Field name
     * @returns {Array} Unique values
     */
    getUniqueValues(field) {
        const rawData = this.get('data.raw') || [];
        const values = rawData
            .map(item => item[field])
            .filter(value => value && value.toString().trim())
            .map(value => value.toString().trim());
        
        return [...new Set(values)].sort();
    }

    /**
     * Export current state for debugging
     * @returns {Object} Current state
     */
    export() {
        return {
            state: Helpers.deepClone(this.state),
            history: this.history.slice(-10),
            subscribers: Array.from(this.subscribers.keys())
        };
    }
}

// Create singleton instance
const stateManager = new StateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = stateManager;
}
