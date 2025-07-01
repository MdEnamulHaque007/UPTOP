/**
 * Production Page Component
 * Production management and tracking page
 */

const ProductionPage = {
    // Page state
    isInitialized: false,
    data: null,
    
    /**
     * Render the production page
     * @param {HTMLElement} container - Container element
     */
    async render(container) {
        try {
            // Check permissions
            if (!AuthService.hasPageAccess('production')) {
                container.innerHTML = this.getAccessDeniedHtml();
                return;
            }
            
            // Show loading state
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading production data...</p></div>';
            
            // Fetch production data
            this.data = await SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.PRODUCTION);
            
            // Render page content
            container.innerHTML = this.getPageHtml();
            
            // Initialize components
            this.initializeComponents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to render production page:', error);
            container.innerHTML = this.getErrorHtml(error.message);
        }
    },
    
    /**
     * Get page HTML
     * @returns {string} - Page HTML
     */
    getPageHtml() {
        return `
            <!-- Page Header -->
            <div class="page-header">
                <h1>Production Management</h1>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="ProductionPage.exportData()">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                    <button class="btn btn-primary" onclick="ProductionPage.addBatch()">
                        <i class="fas fa-plus"></i>
                        New Batch
                    </button>
                </div>
            </div>
            
            <!-- Production Summary -->
            <div class="summary-section">
                <div class="summary-grid" id="production-summary">
                    <!-- Summary cards will be rendered here -->
                </div>
            </div>
            
            <!-- Production Table -->
            <div class="table-section">
                <div class="table-header">
                    <h2>Production Batches</h2>
                </div>
                
                <div id="production-table-container">
                    <!-- Table will be rendered here -->
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
                <p>You don't have permission to access the production page.</p>
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
                <h3>Failed to Load Production Data</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="ProductionPage.render(document.getElementById('page-content'))">
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
     * Render production summary
     */
    renderSummary() {
        const container = document.getElementById('production-summary');
        if (!container || !this.data) return;
        
        const summary = this.calculateSummary();
        
        const cards = [
            {
                title: 'Total Batches',
                value: summary.totalBatches,
                icon: 'fa-industry',
                color: 'primary'
            },
            {
                title: 'Active Batches',
                value: summary.activeBatches,
                icon: 'fa-play',
                color: 'success'
            },
            {
                title: 'Completed Batches',
                value: summary.completedBatches,
                icon: 'fa-check',
                color: 'info'
            },
            {
                title: 'Total Production Value',
                value: Formatters.currency(summary.totalValue),
                icon: 'fa-dollar-sign',
                color: 'warning'
            }
        ];
        
        SummaryCards.render(container, cards);
    },
    
    /**
     * Calculate production summary
     * @returns {Object} - Summary data
     */
    calculateSummary() {
        const activeBatches = this.data.filter(item => 
            (item.status || 'active').toLowerCase() === 'active'
        );
        
        const completedBatches = this.data.filter(item => 
            (item.status || 'active').toLowerCase() === 'completed'
        );
        
        const totalValue = Helpers.sum(this.data, 'value');
        
        return {
            totalBatches: this.data.length,
            activeBatches: activeBatches.length,
            completedBatches: completedBatches.length,
            totalValue
        };
    },
    
    /**
     * Render production table
     */
    renderTable() {
        const container = document.getElementById('production-table-container');
        if (!container || !this.data) return;
        
        const columns = [
            { field: 'batch_number', title: 'Batch #', type: 'text' },
            { field: 'product_code', title: 'Product Code', type: 'text' },
            { field: 'quantity', title: 'Quantity', type: 'number' },
            { field: 'start_date', title: 'Start Date', type: 'date' },
            { field: 'end_date', title: 'End Date', type: 'date' },
            { field: 'value', title: 'Value', type: 'currency' },
            { field: 'status', title: 'Status', type: 'status' }
        ];
        
        InventoryTable.render(container, {
            data: this.data,
            columns,
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 25
        });
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Listen for data updates
        EventEmitter.on('data:updated', () => {
            this.refreshData();
        });
    },
    
    /**
     * Export production data
     */
    exportData() {
        // TODO: Implement data export
        Toast.show('Export feature coming soon', 'info');
    },
    
    /**
     * Add new production batch
     */
    addBatch() {
        // TODO: Implement add batch modal
        Toast.show('Add batch feature coming soon', 'info');
    },
    
    /**
     * Refresh production data
     */
    async refreshData() {
        try {
            this.data = await SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.PRODUCTION, false);
            this.renderSummary();
            this.renderTable();
            Toast.show('Production data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh production data:', error);
            Toast.show('Failed to refresh data', 'error');
        }
    }
};
