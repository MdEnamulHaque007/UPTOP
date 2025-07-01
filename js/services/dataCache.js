/**
 * Data Cache Service
 * Handles caching of data to improve performance and provide offline capabilities
 */

const DataCache = {
    // Cache storage
    cache: new Map(),
    metadata: new Map(),
    
    // Cache configuration
    defaultTTL: CONFIG.GOOGLE_SHEETS.CACHE_DURATION,
    maxCacheSize: 50, // Maximum number of cached items
    
    /**
     * Initialize the cache service
     */
    init() {
        try {
            // Load existing cache from localStorage if available
            this.loadFromStorage();
            
            // Set up cache cleanup interval
            this.setupCleanupInterval();
            
            console.log('DataCache initialized');
            
        } catch (error) {
            console.error('Failed to initialize DataCache:', error);
        }
    },
    
    /**
     * Store data in cache
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, data, ttl = null) {
        try {
            const expiresAt = Date.now() + (ttl || this.defaultTTL);
            
            // Store data
            this.cache.set(key, data);
            
            // Store metadata
            this.metadata.set(key, {
                createdAt: Date.now(),
                expiresAt: expiresAt,
                size: this.calculateSize(data),
                accessCount: 0,
                lastAccessed: Date.now()
            });
            
            // Enforce cache size limit
            this.enforceSizeLimit();
            
            // Save to localStorage
            this.saveToStorage();
            
            console.log(`Cached data for key: ${key}`);
            
        } catch (error) {
            console.error(`Failed to cache data for key ${key}:`, error);
        }
    },
    
    /**
     * Retrieve data from cache
     * @param {string} key - Cache key
     * @returns {*} - Cached data or null if not found/expired
     */
    get(key) {
        try {
            const metadata = this.metadata.get(key);
            
            if (!metadata) {
                return null; // Not in cache
            }
            
            // Check if expired
            if (Date.now() > metadata.expiresAt) {
                this.delete(key);
                return null;
            }
            
            // Update access metadata
            metadata.accessCount++;
            metadata.lastAccessed = Date.now();
            
            const data = this.cache.get(key);
            
            console.log(`Cache hit for key: ${key}`);
            return data;
            
        } catch (error) {
            console.error(`Failed to retrieve cached data for key ${key}:`, error);
            return null;
        }
    },
    
    /**
     * Check if key exists in cache and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} - Whether key exists and is valid
     */
    has(key) {
        const metadata = this.metadata.get(key);
        
        if (!metadata) {
            return false;
        }
        
        // Check if expired
        if (Date.now() > metadata.expiresAt) {
            this.delete(key);
            return false;
        }
        
        return this.cache.has(key);
    },
    
    /**
     * Delete data from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        try {
            this.cache.delete(key);
            this.metadata.delete(key);
            
            // Update localStorage
            this.saveToStorage();
            
            console.log(`Deleted cached data for key: ${key}`);
            
        } catch (error) {
            console.error(`Failed to delete cached data for key ${key}:`, error);
        }
    },
    
    /**
     * Clear all cached data
     */
    clear() {
        try {
            this.cache.clear();
            this.metadata.clear();
            
            // Clear localStorage
            localStorage.removeItem('dataCache');
            localStorage.removeItem('dataCacheMetadata');
            
            console.log('Cache cleared');
            
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    },
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getStats() {
        const stats = {
            totalItems: this.cache.size,
            totalSize: 0,
            hitRate: 0,
            items: []
        };
        
        let totalAccess = 0;
        let totalHits = 0;
        
        this.metadata.forEach((metadata, key) => {
            const itemStats = {
                key,
                size: metadata.size,
                createdAt: new Date(metadata.createdAt),
                expiresAt: new Date(metadata.expiresAt),
                accessCount: metadata.accessCount,
                lastAccessed: new Date(metadata.lastAccessed),
                isExpired: Date.now() > metadata.expiresAt
            };
            
            stats.items.push(itemStats);
            stats.totalSize += metadata.size;
            totalAccess += metadata.accessCount;
            
            if (!itemStats.isExpired) {
                totalHits += metadata.accessCount;
            }
        });
        
        stats.hitRate = totalAccess > 0 ? (totalHits / totalAccess) * 100 : 0;
        
        return stats;
    },
    
    /**
     * Get cache keys
     * @returns {Array} - Array of cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    },
    
    /**
     * Calculate approximate size of data
     * @param {*} data - Data to measure
     * @returns {number} - Approximate size in bytes
     */
    calculateSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
        } catch {
            return 0;
        }
    },
    
    /**
     * Enforce cache size limit by removing least recently used items
     */
    enforceSizeLimit() {
        if (this.cache.size <= this.maxCacheSize) {
            return;
        }
        
        // Get items sorted by last accessed time (oldest first)
        const items = Array.from(this.metadata.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        // Remove oldest items until under limit
        const itemsToRemove = this.cache.size - this.maxCacheSize;
        for (let i = 0; i < itemsToRemove; i++) {
            const [key] = items[i];
            this.delete(key);
        }
        
        console.log(`Removed ${itemsToRemove} items from cache to enforce size limit`);
    },
    
    /**
     * Clean up expired items
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        
        this.metadata.forEach((metadata, key) => {
            if (now > metadata.expiresAt) {
                expiredKeys.push(key);
            }
        });
        
        expiredKeys.forEach(key => this.delete(key));
        
        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired cache items`);
        }
    },
    
    /**
     * Setup automatic cleanup interval
     */
    setupCleanupInterval() {
        // Clean up expired items every 5 minutes
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    },
    
    /**
     * Save cache to localStorage
     */
    saveToStorage() {
        try {
            if (!CONFIG.FEATURES.ENABLE_OFFLINE_MODE) {
                return;
            }
            
            // Convert Map to Object for JSON serialization
            const cacheData = {};
            const metadataData = {};
            
            this.cache.forEach((value, key) => {
                cacheData[key] = value;
            });
            
            this.metadata.forEach((value, key) => {
                metadataData[key] = value;
            });
            
            localStorage.setItem('dataCache', JSON.stringify(cacheData));
            localStorage.setItem('dataCacheMetadata', JSON.stringify(metadataData));
            
        } catch (error) {
            console.error('Failed to save cache to storage:', error);
        }
    },
    
    /**
     * Load cache from localStorage
     */
    loadFromStorage() {
        try {
            if (!CONFIG.FEATURES.ENABLE_OFFLINE_MODE) {
                return;
            }
            
            const cacheData = localStorage.getItem('dataCache');
            const metadataData = localStorage.getItem('dataCacheMetadata');
            
            if (cacheData && metadataData) {
                const cache = JSON.parse(cacheData);
                const metadata = JSON.parse(metadataData);
                
                // Restore cache
                Object.entries(cache).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
                
                // Restore metadata
                Object.entries(metadata).forEach(([key, value]) => {
                    this.metadata.set(key, value);
                });
                
                // Clean up expired items
                this.cleanup();
                
                console.log(`Loaded ${this.cache.size} items from cache storage`);
            }
            
        } catch (error) {
            console.error('Failed to load cache from storage:', error);
            // Clear corrupted cache
            this.clear();
        }
    },
    
    /**
     * Export cache data for debugging
     * @returns {Object} - Cache data and metadata
     */
    export() {
        return {
            cache: Object.fromEntries(this.cache),
            metadata: Object.fromEntries(this.metadata),
            stats: this.getStats()
        };
    },
    
    /**
     * Import cache data
     * @param {Object} data - Cache data to import
     */
    import(data) {
        try {
            this.clear();
            
            if (data.cache) {
                Object.entries(data.cache).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
            }
            
            if (data.metadata) {
                Object.entries(data.metadata).forEach(([key, value]) => {
                    this.metadata.set(key, value);
                });
            }
            
            console.log('Cache data imported successfully');
            
        } catch (error) {
            console.error('Failed to import cache data:', error);
        }
    }
};
