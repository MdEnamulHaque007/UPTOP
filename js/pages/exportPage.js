/**
 * Export Page Component
 * Export and B-Grade sales management page
 */

const ExportPage = {
    // Page state
    isInitialized: false,
    data: null,
    
    /**
     * Render the export page
     * @param {HTMLElement} container - Container element
     */
    async render(container) {
        try {
            // Check permissions
            if (!AuthService.hasPageAccess('export')) {
                container.innerHTML = this.getAccessDeniedHtml();
                return;
            }
            
            // Show loading state
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading export data...</p></div>';
            
            // Fetch export data
            await this.loadData();
            
            // Render page content
            container.innerHTML = this.getPageHtml();
            
            // Initialize components
            this.initializeComponents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to render export page:', error);
            container.innerHTML = this.getErrorHtml(error.message);
        }
    },
    
    /**
     * Load export data
     */
    async loadData() {
        const [finishedGoods, bgradeSales] = await Promise.all([
            SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.FINISHED_GOODS),
            SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.BGRADE_SALES)
        ]);
        
        this.data = {
            finishedGoods,
            bgradeSales
        };
    },
    
    /**
     * Get page HTML
     * @returns {string} - Page HTML
     */
    getPageHtml() {
        return `
            <!-- Page Header -->
            <div class="page-header">
                <h1>Export & Sales Management</h1>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="ExportPage.exportData()">
                        <i class="fas fa-download"></i>
                        Export Report
                    </button>
                    <button class="btn btn-primary" onclick="ExportPage.addSale()">
                        <i class="fas fa-plus"></i>
                        New Sale
                    </button>
                </div>
            </div>
            
            <!-- Export Summary -->
            <div class="summary-section">
                <div class="summary-grid" id="export-summary">
                    <!-- Summary cards will be rendered here -->
                </div>
            </div>
            
            <!-- Tabs -->
            <div class="tabs-container">
                <div class="tabs-nav">
                    <button class="tab-btn active" data-tab="finished-goods">
                        <i class="fas fa-boxes"></i>
                        Finished Goods
                    </button>
                    <button class="tab-btn" data-tab="bgrade-sales">
                        <i class="fas fa-tags"></i>
                        B-Grade Sales
                    </button>
                </div>
                
                <div class="tabs-content">
                    <!-- Finished Goods Tab -->
                    <div id="finished-goods-tab" class="tab-pane active">
                        <div class="table-section">
                            <div class="table-header">
                                <h3>Finished Goods Inventory</h3>
                                <div class="table-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="ExportPage.refreshFinishedGoods()">
                                        <i class="fas fa-sync-alt"></i>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            
                            <div id="finished-goods-table-container">
                                <!-- Table will be rendered here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- B-Grade Sales Tab -->
                    <div id="bgrade-sales-tab" class="tab-pane">
                        <div class="table-section">
                            <div class="table-header">
                                <h3>B-Grade Sales Records</h3>
                                <div class="table-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="ExportPage.refreshBgradeSales()">
                                        <i class="fas fa-sync-alt"></i>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            
                            <div id="bgrade-sales-table-container">
                                <!-- Table will be rendered here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Get access denied HTML
     * @returns {string} - Access denied HTML
     */
    getAccessDeniedHtml() {
        return `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <h3>Access Denied</h3>
                <p>You don't have permission to access the export page.</p>
                <button class="btn btn-primary" onclick="Router.navigate('dashboard')">
                    <i class="fas fa-home"></i>
                    Go to Dashboard
                </button>
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
                <h3>Failed to Load Export Data</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="ExportPage.render(document.getElementById('page-content'))">
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
        this.renderTables();
        this.attachEventListeners();
        this.addTabStyles();
    },
    
    /**
     * Render export summary
     */
    renderSummary() {
        const container = document.getElementById('export-summary');
        if (!container || !this.data) return;
        
        const summary = this.calculateSummary();
        
        const cards = [
            {
                title: 'Available for Export',
                value: summary.availableForExport,
                icon: 'fa-shipping-fast',
                color: 'primary'
            },
            {
                title: 'Total Export Value',
                value: Formatters.currency(summary.totalExportValue),
                icon: 'fa-dollar-sign',
                color: 'success'
            },
            {
                title: 'B-Grade Sales',
                value: summary.bgradeSales,
                icon: 'fa-tags',
                color: 'warning'
            },
            {
                title: 'B-Grade Revenue',
                value: Formatters.currency(summary.bgradeRevenue),
                icon: 'fa-chart-line',
                color: 'info'
            }
        ];
        
        SummaryCards.render(container, cards);
    },
    
    /**
     * Calculate export summary
     * @returns {Object} - Summary data
     */
    calculateSummary() {
        const totalExportValue = Helpers.sum(this.data.finishedGoods, 'total_value');
        const bgradeRevenue = Helpers.sum(this.data.bgradeSales, 'sale_amount');
        
        return {
            availableForExport: this.data.finishedGoods.length,
            totalExportValue,
            bgradeSales: this.data.bgradeSales.length,
            bgradeRevenue
        };
    },
    
    /**
     * Render tables
     */
    renderTables() {
        this.renderFinishedGoodsTable();
        this.renderBgradeSalesTable();
    },
    
    /**
     * Render finished goods table
     */
    renderFinishedGoodsTable() {
        const container = document.getElementById('finished-goods-table-container');
        if (!container || !this.data) return;
        
        const columns = [
            { field: 'product_code', title: 'Product Code', type: 'text' },
            { field: 'description', title: 'Description', type: 'text' },
            { field: 'quantity', title: 'Quantity', type: 'number' },
            { field: 'unit_price', title: 'Unit Price', type: 'currency' },
            { field: 'total_value', title: 'Total Value', type: 'currency' },
            { field: 'date', title: 'Date', type: 'date' },
            { field: 'status', title: 'Status', type: 'status' }
        ];
        
        InventoryTable.render(container, {
            data: this.data.finishedGoods,
            columns,
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 20
        });
    },
    
    /**
     * Render B-grade sales table
     */
    renderBgradeSalesTable() {
        const container = document.getElementById('bgrade-sales-table-container');
        if (!container || !this.data) return;
        
        const columns = [
            { field: 'product_code', title: 'Product Code', type: 'text' },
            { field: 'quantity', title: 'Quantity', type: 'number' },
            { field: 'original_price', title: 'Original Price', type: 'currency' },
            { field: 'sale_price', title: 'Sale Price', type: 'currency' },
            { field: 'sale_amount', title: 'Sale Amount', type: 'currency' },
            { field: 'date', title: 'Sale Date', type: 'date' },
            { field: 'customer', title: 'Customer', type: 'text' }
        ];
        
        InventoryTable.render(container, {
            data: this.data.bgradeSales,
            columns,
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 20
        });
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Listen for data updates
        EventEmitter.on('data:updated', () => {
            this.refreshData();
        });
    },
    
    /**
     * Switch tab
     * @param {string} tabId - Tab ID to switch to
     */
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    },
    
    /**
     * Add tab styles
     */
    addTabStyles() {
        if (document.getElementById('export-tab-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'export-tab-styles';
        styles.textContent = `
            .tabs-container {
                margin-top: var(--spacing-6);
            }
            
            .tabs-nav {
                display: flex;
                border-bottom: 1px solid var(--gray-200);
                margin-bottom: var(--spacing-6);
            }
            
            .tab-btn {
                padding: var(--spacing-3) var(--spacing-6);
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-size: var(--font-size-sm);
                font-weight: 500;
                color: var(--gray-600);
                transition: all var(--transition-fast);
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
            }
            
            .tab-btn:hover {
                color: var(--primary-color);
                background-color: var(--gray-50);
            }
            
            .tab-btn.active {
                color: var(--primary-color);
                border-bottom-color: var(--primary-color);
            }
            
            .tab-pane {
                display: none;
            }
            
            .tab-pane.active {
                display: block;
            }
        `;
        
        document.head.appendChild(styles);
    },
    
    /**
     * Export data
     */
    exportData() {
        // TODO: Implement data export
        Toast.show('Export feature coming soon', 'info');
    },
    
    /**
     * Add new sale
     */
    addSale() {
        // TODO: Implement add sale modal
        Toast.show('Add sale feature coming soon', 'info');
    },
    
    /**
     * Refresh finished goods data
     */
    async refreshFinishedGoods() {
        try {
            this.data.finishedGoods = await SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.FINISHED_GOODS, false);
            this.renderFinishedGoodsTable();
            this.renderSummary();
            Toast.show('Finished goods data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh finished goods data:', error);
            Toast.show('Failed to refresh data', 'error');
        }
    },
    
    /**
     * Refresh B-grade sales data
     */
    async refreshBgradeSales() {
        try {
            this.data.bgradeSales = await SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.BGRADE_SALES, false);
            this.renderBgradeSalesTable();
            this.renderSummary();
            Toast.show('B-grade sales data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh B-grade sales data:', error);
            Toast.show('Failed to refresh data', 'error');
        }
    },
    
    /**
     * Refresh all export data
     */
    async refreshData() {
        try {
            await this.loadData();
            this.renderSummary();
            this.renderTables();
            Toast.show('Export data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh export data:', error);
            Toast.show('Failed to refresh data', 'error');
        }
    }
};
