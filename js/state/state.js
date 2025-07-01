/**
 * Application State Management
 * Centralized state store for the application using observer pattern
 */

const State = {
    // Internal state storage
    _state: {
        // User state
        user: {
            currentUser: null,
            isAuthenticated: false,
            permissions: [],
            role: null
        },
        
        // Application state
        app: {
            isLoading: false,
            currentPage: null,
            sidebarCollapsed: false,
            theme: 'light'
        },
        
        // Data state
        data: {
            purchaseOrders: [],
            production: [],
            finishedGoods: [],
            issues: [],
            bgradeSales: [],
            lastUpdated: null,
            isRefreshing: false
        },
        
        // UI state
        ui: {
            modals: {},
            toasts: [],
            filters: {
                dateRange: 'month',
                category: 'all',
                searchTerm: ''
            },
            pagination: {
                currentPage: 1,
                pageSize: 25,
                totalItems: 0
            },
            sorting: {
                field: null,
                direction: 'asc'
            }
        },
        
        // Cache state
        cache: {
            enabled: true,
            stats: {
                hitRate: 0,
                totalItems: 0,
                totalSize: 0
            }
        }
    },
    
    // State observers
    _observers: new Map(),
    
    // State history for debugging
    _history: [],
    _maxHistorySize: 50,
    
    /**
     * Initialize the state management system
     */
    init() {
        try {
            // Load persisted state from localStorage
            this.loadPersistedState();
            
            // Set up state persistence
            this.setupStatePersistence();
            
            console.log('State management initialized');
            
        } catch (error) {
            console.error('Failed to initialize state management:', error);
        }
    },
    
    /**
     * Get current state or specific state path
     * @param {string} path - Dot notation path to specific state (optional)
     * @returns {*} - State value
     */
    get(path = null) {
        if (!path) {
            return this._state;
        }
        
        return this._getNestedValue(this._state, path);
    },
    
    /**
     * Set state value at specific path
     * @param {string} path - Dot notation path to state property
     * @param {*} value - New value
     * @param {boolean} notify - Whether to notify observers (default: true)
     */
    set(path, value, notify = true) {
        try {
            const oldValue = this._getNestedValue(this._state, path);
            
            // Set the new value
            this._setNestedValue(this._state, path, value);
            
            // Add to history
            this._addToHistory({
                type: 'SET',
                path,
                oldValue,
                newValue: value,
                timestamp: Date.now()
            });
            
            // Notify observers
            if (notify) {
                this._notifyObservers(path, value, oldValue);
            }
            
            // Persist state if needed
            this._persistState();
            
        } catch (error) {
            console.error(`Failed to set state at path ${path}:`, error);
        }
    },
    
    /**
     * Update state by merging with existing value
     * @param {string} path - Dot notation path to state property
     * @param {Object} updates - Object with updates to merge
     * @param {boolean} notify - Whether to notify observers (default: true)
     */
    update(path, updates, notify = true) {
        try {
            const currentValue = this._getNestedValue(this._state, path);
            
            if (typeof currentValue === 'object' && currentValue !== null) {
                const newValue = { ...currentValue, ...updates };
                this.set(path, newValue, notify);
            } else {
                this.set(path, updates, notify);
            }
            
        } catch (error) {
            console.error(`Failed to update state at path ${path}:`, error);
        }
    },
    
    /**
     * Subscribe to state changes
     * @param {string} path - Dot notation path to watch (use '*' for all changes)
     * @param {Function} callback - Callback function to execute on change
     * @returns {Function} - Unsubscribe function
     */
    subscribe(path, callback) {
        try {
            if (!this._observers.has(path)) {
                this._observers.set(path, new Set());
            }
            
            this._observers.get(path).add(callback);
            
            // Return unsubscribe function
            return () => {
                const observers = this._observers.get(path);
                if (observers) {
                    observers.delete(callback);
                    if (observers.size === 0) {
                        this._observers.delete(path);
                    }
                }
            };
            
        } catch (error) {
            console.error(`Failed to subscribe to state path ${path}:`, error);
            return () => {}; // Return no-op function
        }
    },
    
    /**
     * Unsubscribe from state changes
     * @param {string} path - Dot notation path
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(path, callback) {
        try {
            const observers = this._observers.get(path);
            if (observers) {
                observers.delete(callback);
                if (observers.size === 0) {
                    this._observers.delete(path);
                }
            }
        } catch (error) {
            console.error(`Failed to unsubscribe from state path ${path}:`, error);
        }
    },
    
    /**
     * Reset state to initial values
     * @param {string} path - Specific path to reset (optional)
     */
    reset(path = null) {
        try {
            if (path) {
                // Reset specific path to its initial value
                const initialValue = this._getInitialValue(path);
                this.set(path, initialValue);
            } else {
                // Reset entire state
                this._state = this._getInitialState();
                this._notifyObservers('*', this._state, null);
            }
            
            console.log(`State reset${path ? ` for path: ${path}` : ''}`);
            
        } catch (error) {
            console.error(`Failed to reset state${path ? ` for path ${path}` : ''}:`, error);
        }
    },
    
    /**
     * Get state history for debugging
     * @param {number} limit - Number of history entries to return
     * @returns {Array} - Array of history entries
     */
    getHistory(limit = 10) {
        return this._history.slice(-limit);
    },
    
    /**
     * Clear state history
     */
    clearHistory() {
        this._history = [];
    },
    
    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Object to search
     * @param {string} path - Dot notation path
     * @returns {*} - Value at path
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    },
    
    /**
     * Set nested value in object using dot notation
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    _setNestedValue(obj, path, value) {
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
     * Notify observers of state changes
     * @param {string} path - Path that changed
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    _notifyObservers(path, newValue, oldValue) {
        try {
            // Notify specific path observers
            const pathObservers = this._observers.get(path);
            if (pathObservers) {
                pathObservers.forEach(callback => {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error('Observer callback error:', error);
                    }
                });
            }
            
            // Notify wildcard observers
            const wildcardObservers = this._observers.get('*');
            if (wildcardObservers) {
                wildcardObservers.forEach(callback => {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error('Wildcard observer callback error:', error);
                    }
                });
            }
            
            // Notify parent path observers
            const pathParts = path.split('.');
            for (let i = pathParts.length - 1; i > 0; i--) {
                const parentPath = pathParts.slice(0, i).join('.');
                const parentObservers = this._observers.get(parentPath);
                if (parentObservers) {
                    const parentValue = this._getNestedValue(this._state, parentPath);
                    parentObservers.forEach(callback => {
                        try {
                            callback(parentValue, null, parentPath);
                        } catch (error) {
                            console.error('Parent observer callback error:', error);
                        }
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to notify observers:', error);
        }
    },
    
    /**
     * Add entry to state history
     * @param {Object} entry - History entry
     */
    _addToHistory(entry) {
        this._history.push(entry);
        
        // Limit history size
        if (this._history.length > this._maxHistorySize) {
            this._history = this._history.slice(-this._maxHistorySize);
        }
    },
    
    /**
     * Get initial state structure
     * @returns {Object} - Initial state
     */
    _getInitialState() {
        return {
            user: {
                currentUser: null,
                isAuthenticated: false,
                permissions: [],
                role: null
            },
            app: {
                isLoading: false,
                currentPage: null,
                sidebarCollapsed: false,
                theme: 'light'
            },
            data: {
                purchaseOrders: [],
                production: [],
                finishedGoods: [],
                issues: [],
                bgradeSales: [],
                lastUpdated: null,
                isRefreshing: false
            },
            ui: {
                modals: {},
                toasts: [],
                filters: {
                    dateRange: 'month',
                    category: 'all',
                    searchTerm: ''
                },
                pagination: {
                    currentPage: 1,
                    pageSize: 25,
                    totalItems: 0
                },
                sorting: {
                    field: null,
                    direction: 'asc'
                }
            },
            cache: {
                enabled: true,
                stats: {
                    hitRate: 0,
                    totalItems: 0,
                    totalSize: 0
                }
            }
        };
    },
    
    /**
     * Get initial value for specific path
     * @param {string} path - Dot notation path
     * @returns {*} - Initial value
     */
    _getInitialValue(path) {
        const initialState = this._getInitialState();
        return this._getNestedValue(initialState, path);
    },
    
    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        try {
            const persistedState = localStorage.getItem('appState');
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                
                // Merge with current state (don't overwrite everything)
                this._state = {
                    ...this._state,
                    ui: {
                        ...this._state.ui,
                        ...parsed.ui
                    },
                    app: {
                        ...this._state.app,
                        theme: parsed.app?.theme || 'light',
                        sidebarCollapsed: parsed.app?.sidebarCollapsed || false
                    }
                };
                
                console.log('Persisted state loaded');
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
        }
    },
    
    /**
     * Set up automatic state persistence
     */
    setupStatePersistence() {
        // Persist certain state changes automatically
        this.subscribe('ui.filters', () => this._persistState());
        this.subscribe('ui.pagination', () => this._persistState());
        this.subscribe('app.theme', () => this._persistState());
        this.subscribe('app.sidebarCollapsed', () => this._persistState());
    },
    
    /**
     * Persist state to localStorage
     */
    _persistState() {
        try {
            const stateToPersist = {
                ui: this._state.ui,
                app: {
                    theme: this._state.app.theme,
                    sidebarCollapsed: this._state.app.sidebarCollapsed
                }
            };
            
            localStorage.setItem('appState', JSON.stringify(stateToPersist));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }
};
