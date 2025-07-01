/**
 * Inventory Page Component
 * Inventory overview and management page
 */

const InventoryPage = {
    // Page state
    isInitialized: false,
    data: null,
    filteredData: null,
    currentFilters: {
        search: '',
        category: 'all',
        status: 'all'
    },
    
    /**
     * Render the inventory page
     * @param {HTMLElement} container - Container element
     */
    async render(container) {
        try {
            // Show loading state
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading inventory...</p></div>';
            
            // Fetch inventory data
            await this.loadData();
            
            // Render page content
            container.innerHTML = this.getPageHtml();
            
            // Initialize components
            this.initializeComponents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to render inventory page:', error);
            container.innerHTML = this.getErrorHtml(error.message);
        }
    },
    
    /**
     * Load inventory data
     */
    async loadData() {
        const [finishedGoods, production, issues] = await Promise.all([
            SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.FINISHED_GOODS),
            SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.PRODUCTION),
            SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.ISSUES)
        ]);
        
        this.data = {
            finishedGoods,
            production,
            issues
        };
        
        this.filteredData = { ...this.data };
    },
    
    /**
     * Get page HTML
     * @returns {string} - Page HTML
     */
    getPageHtml() {
        return `
            <!-- Page Header -->
            <div class="page-header">
                <h1>Inventory Management</h1>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="InventoryPage.exportData()">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                    <button class="btn btn-primary" onclick="InventoryPage.addItem()">
                        <i class="fas fa-plus"></i>
                        Add Item
                    </button>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="filters-container">
                <div class="filter-group">
                    <label for="search-filter">Search:</label>
                    <input type="text" id="search-filter" placeholder="Search items..." class="filter-input">
                </div>
                
                <div class="filter-group">
                    <label for="category-filter">Category:</label>
                    <select id="category-filter" class="filter-select">
                        <option value="all">All Categories</option>
                        <option value="finished">Finished Goods</option>
                        <option value="production">In Production</option>
                        <option value="issues">Issues</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="status-filter">Status:</label>
                    <select id="status-filter" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <button class="btn btn-secondary" onclick="InventoryPage.clearFilters()">
                        <i class="fas fa-times"></i>
                        Clear Filters
                    </button>
                </div>
            </div>
            
            <!-- Inventory Summary -->
            <div class="summary-section">
                <div class="summary-grid" id="inventory-summary">
                    <!-- Summary cards will be rendered here -->
                </div>
            </div>
            
            <!-- Inventory Table -->
            <div class="table-section">
                <div class="table-header">
                    <h2>Inventory Items</h2>
                    <div class="table-controls">
                        <span id="item-count">0 items</span>
                    </div>
                </div>
                
                <div id="inventory-table-container">
                    <!-- Table will be rendered here -->
                </div>
            </div>
        `;
    },
    
    /**
     * Get error HTML
     * @param {string} message - Error message
     * @returns {string} - Error HTML
     */
    getErrorHtml(message) {
        return `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Inventory</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="InventoryPage.render(document.getElementById('page-content'))">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
    },
    
    /**
     * Initialize page components
     */
    initializeComponents() {
        this.renderSummary();
        this.renderTable();
        this.attachEventListeners();
    },
    
    /**
     * Render inventory summary
     */
    renderSummary() {
        const container = document.getElementById('inventory-summary');
        if (!container) return;
        
        const summary = this.calculateSummary();
        
        const cards = [
            {
                title: 'Total Items',
                value: summary.totalItems,
                icon: 'fa-boxes',
                color: 'primary'
            },
            {
                title: 'Finished Goods',
                value: summary.finishedGoods,
                icon: 'fa-check-circle',
                color: 'success'
            },
            {
                title: 'In Production',
                value: summary.inProduction,
                icon: 'fa-cog',
                color: 'warning'
            },
            {
                title: 'Issues',
                value: summary.issues,
                icon: 'fa-exclamation-triangle',
                color: 'error'
            }
        ];
        
        SummaryCards.render(container, cards);
    },
    
    /**
     * Calculate inventory summary
     * @returns {Object} - Summary data
     */
    calculateSummary() {
        return {
            totalItems: this.data.finishedGoods.length + this.data.production.length,
            finishedGoods: this.data.finishedGoods.length,
            inProduction: this.data.production.length,
            issues: this.data.issues.length
        };
    },
    
    /**
     * Render inventory table
     */
    renderTable() {
        const container = document.getElementById('inventory-table-container');
        if (!container) return;
        
        // Combine all inventory data
        const allItems = [
            ...this.filteredData.finishedGoods.map(item => ({
                ...item,
                category: 'Finished Goods',
                type: 'finished'
            })),
            ...this.filteredData.production.map(item => ({
                ...item,
                category: 'Production',
                type: 'production'
            }))
        ];
        
        const columns = [
            { field: 'product_code', title: 'Product Code', type: 'text' },
            { field: 'category', title: 'Category', type: 'text' },
            { field: 'quantity', title: 'Quantity', type: 'number' },
            { field: 'unit_price', title: 'Unit Price', type: 'currency' },
            { field: 'total_value', title: 'Total Value', type: 'currency' },
            { field: 'date', title: 'Date', type: 'date' },
            { field: 'status', title: 'Status', type: 'status' }
        ];
        
        InventoryTable.render(container, {
            data: allItems,
            columns,
            searchable: false, // We handle search separately
            sortable: true,
            paginated: true,
            pageSize: 25
        });
        
        // Update item count
        this.updateItemCount(allItems.length);
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search filter
        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) {
            searchFilter.addEventListener('input', Helpers.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }
        
        // Listen for data updates
        EventEmitter.on('data:updated', () => {
            this.refreshData();
        });
    },
    
    /**
     * Apply filters to data
     */
    applyFilters() {
        this.filteredData = { ...this.data };
        
        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            this.filteredData.finishedGoods = this.filteredData.finishedGoods.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                )
            );
            this.filteredData.production = this.filteredData.production.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                )
            );
        }
        
        // Apply category filter
        if (this.currentFilters.category !== 'all') {
            if (this.currentFilters.category === 'finished') {
                this.filteredData.production = [];
            } else if (this.currentFilters.category === 'production') {
                this.filteredData.finishedGoods = [];
            }
        }
        
        // Apply status filter
        if (this.currentFilters.status !== 'all') {
            this.filteredData.finishedGoods = this.filteredData.finishedGoods.filter(item =>
                (item.status || 'active').toLowerCase() === this.currentFilters.status
            );
            this.filteredData.production = this.filteredData.production.filter(item =>
                (item.status || 'active').toLowerCase() === this.currentFilters.status
            );
        }
        
        // Re-render components
        this.renderSummary();
        this.renderTable();
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            search: '',
            category: 'all',
            status: 'all'
        };
        
        // Reset form values
        document.getElementById('search-filter').value = '';
        document.getElementById('category-filter').value = 'all';
        document.getElementById('status-filter').value = 'all';
        
        // Apply filters
        this.applyFilters();
    },
    
    /**
     * Update item count display
     * @param {number} count - Number of items
     */
    updateItemCount(count) {
        const countElement = document.getElementById('item-count');
        if (countElement) {
            countElement.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        }
    },
    
    /**
     * Export inventory data
     */
    exportData() {
        // TODO: Implement data export
        Toast.show('Export feature coming soon', 'info');
    },
    
    /**
     * Add new inventory item
     */
    addItem() {
        // TODO: Implement add item modal
        Toast.show('Add item feature coming soon', 'info');
    },
    
    /**
     * Refresh inventory data
     */
    async refreshData() {
        try {
            await this.loadData();
            this.applyFilters();
            Toast.show('Inventory data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh inventory data:', error);
            Toast.show('Failed to refresh data', 'error');
        }
    }
};
