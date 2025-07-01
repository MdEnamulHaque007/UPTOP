/**
 * Dashboard Page Component
 * Main dashboard view with summary cards, charts, and recent data
 */

const DashboardPage = {
    // Page state
    isInitialized: false,
    data: null,
    charts: {},
    
    /**
     * Render the dashboard page
     * @param {HTMLElement} container - Container element
     */
    async render(container) {
        try {
            // Show loading state
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading dashboard...</p></div>';
            
            // Fetch dashboard data
            this.data = await SpreadsheetService.getDashboardData();
            
            // Render page content
            container.innerHTML = this.getPageHtml();
            
            // Initialize components
            await this.initializeComponents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to render dashboard:', error);
            container.innerHTML = this.getErrorHtml(error.message);
        }
    },
    
    /**
     * Get page HTML
     * @returns {string} - Page HTML
     */
    getPageHtml() {
        return `
            <!-- Summary Cards -->
            <section class="summary-section">
                <div class="summary-grid" id="summary-cards">
                    <!-- Summary cards will be rendered here -->
                </div>
            </section>
            
            <!-- Charts Section -->
            <section class="charts-section">
                <h2>Analytics Overview</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Monthly Trends</h3>
                            <p class="chart-subtitle">Purchase Orders vs Production</p>
                        </div>
                        <div class="chart-body">
                            <canvas id="monthly-trends-chart" class="chart-canvas"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Inventory Status</h3>
                            <p class="chart-subtitle">Current stock levels</p>
                        </div>
                        <div class="chart-body">
                            <canvas id="inventory-status-chart" class="chart-canvas"></canvas>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Recent Activity -->
            <section class="tables-section">
                <div class="table-header">
                    <h2 class="table-title">Recent Activity</h2>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="DashboardPage.refreshData()">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="table" id="recent-activity-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Recent activity will be rendered here -->
                        </tbody>
                    </table>
                </div>
            </section>
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
                <h3>Failed to Load Dashboard</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="DashboardPage.render(document.getElementById('page-content'))">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
    },
    
    /**
     * Initialize dashboard components
     */
    async initializeComponents() {
        // Render summary cards
        this.renderSummaryCards();
        
        // Render charts
        this.renderCharts();
        
        // Render recent activity
        this.renderRecentActivity();
        
        // Set up event listeners
        this.attachEventListeners();
    },
    
    /**
     * Render summary cards
     */
    renderSummaryCards() {
        const container = document.getElementById('summary-cards');
        if (!container || !this.data) return;
        
        const { summary } = this.data;
        
        const cards = [
            {
                title: 'Total Purchase Orders',
                value: summary.totalPurchaseOrders,
                icon: 'fa-shopping-cart',
                color: 'primary',
                change: '+12%'
            },
            {
                title: 'Production Items',
                value: summary.totalProduction,
                icon: 'fa-industry',
                color: 'success',
                change: '+8%'
            },
            {
                title: 'Finished Goods',
                value: summary.totalFinishedGoods,
                icon: 'fa-boxes',
                color: 'info',
                change: '+5%'
            },
            {
                title: 'Total Value',
                value: Formatters.currency(summary.totalPurchaseValue + summary.totalProductionValue),
                icon: 'fa-dollar-sign',
                color: 'warning',
                change: '+15%'
            }
        ];
        
        container.innerHTML = cards.map(card => `
            <div class="summary-card">
                <div class="summary-card-icon ${card.color}">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div class="summary-card-title">${card.title}</div>
                <div class="summary-card-value">${card.value}</div>
                <div class="summary-card-change positive">
                    <i class="fas fa-arrow-up"></i>
                    ${card.change}
                </div>
            </div>
        `).join('');
    },
    
    /**
     * Render charts
     */
    renderCharts() {
        this.renderMonthlyTrendsChart();
        this.renderInventoryStatusChart();
    },
    
    /**
     * Render monthly trends chart
     */
    renderMonthlyTrendsChart() {
        const canvas = document.getElementById('monthly-trends-chart');
        if (!canvas || !this.data) return;
        
        const ctx = canvas.getContext('2d');
        
        // Sample data - replace with actual data processing
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Purchase Orders',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: CONFIG.CHARTS.COLORS.PRIMARY,
                    backgroundColor: CONFIG.CHARTS.COLORS.PRIMARY + '20',
                    tension: 0.4
                },
                {
                    label: 'Production',
                    data: [2, 3, 20, 5, 1, 4],
                    borderColor: CONFIG.CHARTS.COLORS.SUCCESS,
                    backgroundColor: CONFIG.CHARTS.COLORS.SUCCESS + '20',
                    tension: 0.4
                }
            ]
        };
        
        this.charts.monthlyTrends = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                ...CONFIG.CHARTS.DEFAULT_OPTIONS,
                plugins: {
                    ...CONFIG.CHARTS.DEFAULT_OPTIONS.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });
    },
    
    /**
     * Render inventory status chart
     */
    renderInventoryStatusChart() {
        const canvas = document.getElementById('inventory-status-chart');
        if (!canvas || !this.data) return;
        
        const ctx = canvas.getContext('2d');
        
        // Sample data - replace with actual data processing
        const data = {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    CONFIG.CHARTS.COLORS.SUCCESS,
                    CONFIG.CHARTS.COLORS.WARNING,
                    CONFIG.CHARTS.COLORS.ERROR
                ]
            }]
        };
        
        this.charts.inventoryStatus = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                ...CONFIG.CHARTS.DEFAULT_OPTIONS,
                plugins: {
                    ...CONFIG.CHARTS.DEFAULT_OPTIONS.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });
    },
    
    /**
     * Render recent activity table
     */
    renderRecentActivity() {
        const tbody = document.querySelector('#recent-activity-table tbody');
        if (!tbody || !this.data) return;
        
        // Combine recent data from all sources
        const recentItems = [
            ...this.data.recent.purchaseOrders.slice(0, 3).map(item => ({
                ...item,
                type: 'Purchase Order',
                description: `PO #${item.po_number || 'N/A'}`,
                amount: item.total_amount || 0
            })),
            ...this.data.recent.production.slice(0, 3).map(item => ({
                ...item,
                type: 'Production',
                description: `Batch #${item.batch_number || 'N/A'}`,
                amount: item.value || 0
            })),
            ...this.data.recent.issues.slice(0, 2).map(item => ({
                ...item,
                type: 'Issue',
                description: item.description || 'N/A',
                amount: 0
            }))
        ];
        
        // Sort by date
        recentItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tbody.innerHTML = recentItems.slice(0, 10).map(item => `
            <tr>
                <td>${Formatters.date(item.date)}</td>
                <td><span class="badge badge-info">${item.type}</span></td>
                <td>${item.description}</td>
                <td>${item.amount > 0 ? Formatters.currency(item.amount) : '—'}</td>
                <td>${Formatters.statusBadge(item.status || 'active')}</td>
            </tr>
        `).join('');
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
     * Refresh dashboard data
     */
    async refreshData() {
        try {
            // Show loading state on charts
            Object.values(this.charts).forEach(chart => {
                if (chart && chart.canvas) {
                    const container = chart.canvas.closest('.chart-body');
                    if (container) {
                        container.innerHTML = '<div class="chart-loading"><div class="spinner"></div></div>';
                    }
                }
            });
            
            // Fetch fresh data
            this.data = await SpreadsheetService.getDashboardData();
            
            // Re-render components
            this.renderSummaryCards();
            this.renderCharts();
            this.renderRecentActivity();
            
            Toast.show('Dashboard refreshed successfully', 'success');
            
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            Toast.show('Failed to refresh dashboard', 'error');
        }
    },
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        this.charts = {};
        this.isInitialized = false;
    }
};
