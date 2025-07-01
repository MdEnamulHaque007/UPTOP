/**
 * Event Emitter System
 * Provides pub-sub pattern for component communication
 */

const EventEmitter = {
    // Event listeners storage
    _listeners: new Map(),
    
    // Event history for debugging
    _eventHistory: [],
    _maxHistorySize: 100,
    
    // Event statistics
    _stats: {
        totalEvents: 0,
        totalListeners: 0,
        eventCounts: new Map()
    },
    
    /**
     * Initialize the event emitter
     */
    init() {
        try {
            // Set up global error handling
            this.setupErrorHandling();
            
            console.log('EventEmitter initialized');
            
        } catch (error) {
            console.error('Failed to initialize EventEmitter:', error);
        }
    },
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} listener - Listener function
     * @param {Object} options - Options (once, priority)
     * @returns {Function} - Unsubscribe function
     */
    on(event, listener, options = {}) {
        try {
            if (typeof listener !== 'function') {
                throw new Error('Listener must be a function');
            }
            
            if (!this._listeners.has(event)) {
                this._listeners.set(event, []);
            }
            
            const listenerObj = {
                fn: listener,
                once: options.once || false,
                priority: options.priority || 0,
                id: this._generateListenerId()
            };
            
            const listeners = this._listeners.get(event);
            listeners.push(listenerObj);
            
            // Sort by priority (higher priority first)
            listeners.sort((a, b) => b.priority - a.priority);
            
            this._stats.totalListeners++;
            
            // Return unsubscribe function
            return () => this.off(event, listener);
            
        } catch (error) {
            console.error(`Failed to add listener for event ${event}:`, error);
            return () => {}; // Return no-op function
        }
    },
    
    /**
     * Add one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Listener function
     * @param {Object} options - Options
     * @returns {Function} - Unsubscribe function
     */
    once(event, listener, options = {}) {
        return this.on(event, listener, { ...options, once: true });
    },
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} listener - Listener function to remove
     */
    off(event, listener) {
        try {
            const listeners = this._listeners.get(event);
            if (!listeners) return;
            
            const index = listeners.findIndex(l => l.fn === listener);
            if (index !== -1) {
                listeners.splice(index, 1);
                this._stats.totalListeners--;
                
                // Remove event key if no listeners left
                if (listeners.length === 0) {
                    this._listeners.delete(event);
                }
            }
            
        } catch (error) {
            console.error(`Failed to remove listener for event ${event}:`, error);
        }
    },
    
    /**
     * Remove all listeners for an event
     * @param {string} event - Event name (optional, removes all if not specified)
     */
    removeAllListeners(event = null) {
        try {
            if (event) {
                const listeners = this._listeners.get(event);
                if (listeners) {
                    this._stats.totalListeners -= listeners.length;
                    this._listeners.delete(event);
                }
            } else {
                this._stats.totalListeners = 0;
                this._listeners.clear();
            }
            
        } catch (error) {
            console.error(`Failed to remove all listeners${event ? ` for event ${event}` : ''}:`, error);
        }
    },
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {boolean} - Whether event had listeners
     */
    emit(event, ...args) {
        try {
            const listeners = this._listeners.get(event);
            if (!listeners || listeners.length === 0) {
                return false;
            }
            
            // Add to event history
            this._addToHistory({
                event,
                args,
                timestamp: Date.now(),
                listenerCount: listeners.length
            });
            
            // Update statistics
            this._stats.totalEvents++;
            const eventCount = this._stats.eventCounts.get(event) || 0;
            this._stats.eventCounts.set(event, eventCount + 1);
            
            // Execute listeners
            const listenersToRemove = [];
            
            for (const listenerObj of listeners) {
                try {
                    listenerObj.fn(...args);
                    
                    // Mark for removal if it's a one-time listener
                    if (listenerObj.once) {
                        listenersToRemove.push(listenerObj);
                    }
                    
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                    
                    // Emit error event
                    this.emit('listener:error', {
                        event,
                        error,
                        listener: listenerObj
                    });
                }
            }
            
            // Remove one-time listeners
            listenersToRemove.forEach(listenerObj => {
                this.off(event, listenerObj.fn);
            });
            
            return true;
            
        } catch (error) {
            console.error(`Failed to emit event ${event}:`, error);
            return false;
        }
    },
    
    /**
     * Emit event asynchronously
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {Promise<boolean>} - Whether event had listeners
     */
    async emitAsync(event, ...args) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.emit(event, ...args);
                resolve(result);
            }, 0);
        });
    },
    
    /**
     * Get list of events with listeners
     * @returns {Array} - Array of event names
     */
    eventNames() {
        return Array.from(this._listeners.keys());
    },
    
    /**
     * Get number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} - Number of listeners
     */
    listenerCount(event) {
        const listeners = this._listeners.get(event);
        return listeners ? listeners.length : 0;
    },
    
    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Array} - Array of listener functions
     */
    listeners(event) {
        const listeners = this._listeners.get(event);
        return listeners ? listeners.map(l => l.fn) : [];
    },
    
    /**
     * Check if event has listeners
     * @param {string} event - Event name
     * @returns {boolean} - Whether event has listeners
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    },
    
    /**
     * Get event statistics
     * @returns {Object} - Event statistics
     */
    getStats() {
        return {
            totalEvents: this._stats.totalEvents,
            totalListeners: this._stats.totalListeners,
            uniqueEvents: this._listeners.size,
            eventCounts: Object.fromEntries(this._stats.eventCounts),
            recentEvents: this._eventHistory.slice(-10)
        };
    },
    
    /**
     * Get event history
     * @param {number} limit - Number of events to return
     * @returns {Array} - Array of event history entries
     */
    getHistory(limit = 20) {
        return this._eventHistory.slice(-limit);
    },
    
    /**
     * Clear event history
     */
    clearHistory() {
        this._eventHistory = [];
    },
    
    /**
     * Create a namespaced event emitter
     * @param {string} namespace - Namespace prefix
     * @returns {Object} - Namespaced event emitter
     */
    namespace(namespace) {
        return {
            on: (event, listener, options) => this.on(`${namespace}:${event}`, listener, options),
            once: (event, listener, options) => this.once(`${namespace}:${event}`, listener, options),
            off: (event, listener) => this.off(`${namespace}:${event}`, listener),
            emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
            emitAsync: (event, ...args) => this.emitAsync(`${namespace}:${event}`, ...args),
            removeAllListeners: (event) => this.removeAllListeners(event ? `${namespace}:${event}` : null)
        };
    },
    
    /**
     * Wait for an event to be emitted
     * @param {string} event - Event name
     * @param {number} timeout - Timeout in milliseconds (optional)
     * @returns {Promise} - Promise that resolves when event is emitted
     */
    waitFor(event, timeout = null) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            const listener = (...args) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(args);
            };
            
            this.once(event, listener);
            
            if (timeout) {
                timeoutId = setTimeout(() => {
                    this.off(event, listener);
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout);
            }
        });
    },
    
    /**
     * Generate unique listener ID
     * @returns {string} - Unique ID
     */
    _generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Add event to history
     * @param {Object} eventData - Event data
     */
    _addToHistory(eventData) {
        this._eventHistory.push(eventData);
        
        // Limit history size
        if (this._eventHistory.length > this._maxHistorySize) {
            this._eventHistory = this._eventHistory.slice(-this._maxHistorySize);
        }
    },
    
    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        // Listen for unhandled errors
        this.on('listener:error', (errorData) => {
            console.error('Event listener error:', errorData);
        });
        
        // Set up debugging in development
        if (CONFIG.DEBUG && CONFIG.DEBUG.ENABLED) {
            this.on('*', (event, ...args) => {
                console.debug(`Event emitted: ${event}`, args);
            });
        }
    }
};

// Create some commonly used namespaced emitters
const AuthEvents = EventEmitter.namespace('auth');
const DataEvents = EventEmitter.namespace('data');
const UIEvents = EventEmitter.namespace('ui');
const NavigationEvents = EventEmitter.namespace('navigation');

// Export namespaced emitters for convenience
if (typeof window !== 'undefined') {
    window.AuthEvents = AuthEvents;
    window.DataEvents = DataEvents;
    window.UIEvents = UIEvents;
    window.NavigationEvents = NavigationEvents;
}
