/**
 * Loader UI Component
 * Reusable loading indicator with various display options
 */

class Loader {
    constructor() {
        this.activeLoaders = new Set();
        this.overlayElement = null;
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message (optional)
     * @param {boolean} blocking - Whether to block user interaction
     */
    show(message = 'Loading...', blocking = true) {
        if (blocking) {
            this.showOverlay(message);
        }
        
        // Add loading class to body
        document.body.classList.add('loading');
        
        // Emit loading event
        this.emitEvent('loading:start', { message, blocking });
    }

    /**
     * Hide loading overlay
     */
    hide() {
        this.hideOverlay();
        
        // Remove loading class from body
        document.body.classList.remove('loading');
        
        // Emit loading complete event
        this.emitEvent('loading:end');
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showOverlay(message) {
        // Create overlay if it doesn't exist
        if (!this.overlayElement) {
            this.createOverlay();
        }
        
        // Update message
        const messageElement = this.overlayElement.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Show overlay
        this.overlayElement.classList.remove('hidden');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide loading overlay
     */
    hideOverlay() {
        if (this.overlayElement) {
            this.overlayElement.classList.add('hidden');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Create loading overlay element
     */
    createOverlay() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'loading-overlay';
        this.overlayElement.className = 'loading-overlay hidden';
        
        this.overlayElement.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p class="loading-message">Loading...</p>
            </div>
        `;
        
        document.body.appendChild(this.overlayElement);
    }

    /**
     * Show loading state for specific element
     * @param {string|Element} element - Element or selector
     * @param {string} message - Loading message
     * @returns {string} Loader ID for removal
     */
    showElement(element, message = 'Loading...') {
        const targetElement = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
            
        if (!targetElement) {
            CONFIG.log('warn', 'Element not found for loading state', element);
            return null;
        }
        
        const loaderId = Helpers.generateId('loader');
        
        // Store original content
        const originalContent = targetElement.innerHTML;
        
        // Create loading content
        const loadingContent = this.createElementLoader(message);
        
        // Replace content
        targetElement.innerHTML = loadingContent;
        targetElement.classList.add('loading-state');
        
        // Store loader info
        this.activeLoaders.add({
            id: loaderId,
            element: targetElement,
            originalContent
        });
        
        return loaderId;
    }

    /**
     * Hide loading state for specific element
     * @param {string} loaderId - Loader ID returned from showElement
     */
    hideElement(loaderId) {
        const loader = Array.from(this.activeLoaders)
            .find(l => l.id === loaderId);
            
        if (!loader) {
            CONFIG.log('warn', 'Loader not found', loaderId);
            return;
        }
        
        // Restore original content
        loader.element.innerHTML = loader.originalContent;
        loader.element.classList.remove('loading-state');
        
        // Remove from active loaders
        this.activeLoaders.delete(loader);
    }

    /**
     * Create loading content for element
     * @param {string} message - Loading message
     * @returns {string} Loading HTML
     */
    createElementLoader(message) {
        return `
            <div class="element-loader">
                <div class="spinner-small"></div>
                <span class="loading-text">${message}</span>
            </div>
        `;
    }

    /**
     * Show loading state for table
     * @param {string|Element} tableElement - Table element or selector
     * @param {number} columns - Number of columns for skeleton rows
     */
    showTable(tableElement, columns = 5) {
        const table = typeof tableElement === 'string' 
            ? document.querySelector(tableElement) 
            : tableElement;
            
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Store original content
        const originalContent = tbody.innerHTML;
        
        // Create skeleton rows
        const skeletonRows = this.createSkeletonRows(columns, 5);
        tbody.innerHTML = skeletonRows;
        
        // Add loading class
        table.classList.add('table-loading');
        
        // Store for restoration
        table.dataset.originalContent = originalContent;
    }

    /**
     * Hide loading state for table
     * @param {string|Element} tableElement - Table element or selector
     */
    hideTable(tableElement) {
        const table = typeof tableElement === 'string' 
            ? document.querySelector(tableElement) 
            : tableElement;
            
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Restore original content
        const originalContent = table.dataset.originalContent;
        if (originalContent) {
            tbody.innerHTML = originalContent;
            delete table.dataset.originalContent;
        }
        
        // Remove loading class
        table.classList.remove('table-loading');
    }

    /**
     * Create skeleton rows for table loading
     * @param {number} columns - Number of columns
     * @param {number} rows - Number of rows
     * @returns {string} Skeleton rows HTML
     */
    createSkeletonRows(columns, rows) {
        const skeletonCell = '<td><div class="skeleton-text"></div></td>';
        const skeletonRow = `<tr class="skeleton-row">${skeletonCell.repeat(columns)}</tr>`;
        
        return skeletonRow.repeat(rows);
    }

    /**
     * Show loading state for chart
     * @param {string|Element} chartContainer - Chart container element or selector
     */
    showChart(chartContainer) {
        const container = typeof chartContainer === 'string' 
            ? document.querySelector(chartContainer) 
            : chartContainer;
            
        if (!container) return;
        
        // Store original content
        const originalContent = container.innerHTML;
        
        // Create chart loading content
        const loadingContent = `
            <div class="chart-loader">
                <div class="chart-skeleton">
                    <div class="skeleton-bars">
                        <div class="skeleton-bar" style="height: 60%"></div>
                        <div class="skeleton-bar" style="height: 80%"></div>
                        <div class="skeleton-bar" style="height: 40%"></div>
                        <div class="skeleton-bar" style="height: 90%"></div>
                        <div class="skeleton-bar" style="height: 70%"></div>
                    </div>
                </div>
                <p class="loading-text">Loading chart data...</p>
            </div>
        `;
        
        container.innerHTML = loadingContent;
        container.classList.add('chart-loading');
        container.dataset.originalContent = originalContent;
    }

    /**
     * Hide loading state for chart
     * @param {string|Element} chartContainer - Chart container element or selector
     */
    hideChart(chartContainer) {
        const container = typeof chartContainer === 'string' 
            ? document.querySelector(chartContainer) 
            : chartContainer;
            
        if (!container) return;
        
        // Restore original content
        const originalContent = container.dataset.originalContent;
        if (originalContent) {
            container.innerHTML = originalContent;
            delete container.dataset.originalContent;
        }
        
        container.classList.remove('chart-loading');
    }

    /**
     * Show button loading state
     * @param {string|Element} button - Button element or selector
     * @param {string} loadingText - Text to show while loading
     * @returns {Function} Function to restore button state
     */
    showButton(button, loadingText = 'Loading...') {
        const btnElement = typeof button === 'string' 
            ? document.querySelector(button) 
            : button;
            
        if (!btnElement) return () => {};
        
        // Store original state
        const originalText = btnElement.innerHTML;
        const originalDisabled = btnElement.disabled;
        
        // Set loading state
        btnElement.innerHTML = `
            <div class="btn-loader">
                <div class="spinner-tiny"></div>
                <span>${loadingText}</span>
            </div>
        `;
        btnElement.disabled = true;
        btnElement.classList.add('btn-loading');
        
        // Return restore function
        return () => {
            btnElement.innerHTML = originalText;
            btnElement.disabled = originalDisabled;
            btnElement.classList.remove('btn-loading');
        };
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
     * Clean up all active loaders
     */
    cleanup() {
        // Hide overlay
        this.hide();
        
        // Clean up element loaders
        this.activeLoaders.forEach(loader => {
            loader.element.innerHTML = loader.originalContent;
            loader.element.classList.remove('loading-state');
        });
        
        this.activeLoaders.clear();
        
        // Clean up table loaders
        document.querySelectorAll('.table-loading').forEach(table => {
            this.hideTable(table);
        });
        
        // Clean up chart loaders
        document.querySelectorAll('.chart-loading').forEach(chart => {
            this.hideChart(chart);
        });
    }
}

// Create singleton instance
const loader = new Loader();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = loader;
}
