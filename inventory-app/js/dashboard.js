/**
 * Dynamic Dashboard Controller
 * Manages the interactive dashboard with charts, filters, and real-time data
 */

class DynamicDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.charts = {};
        this.currentPage = 1;
        this.itemsPerPage = 25;
        this.isInitialized = false;
        
        // Chart color palette
        this.colors = {
            primary: '#3b82f6',
            secondary: '#64748b',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            purple: '#8b5cf6',
            pink: '#ec4899',
            indigo: '#6366f1',
            teal: '#14b8a6'
        };
        
        this.chartColors = [
            this.colors.primary,
            this.colors.success,
            this.colors.warning,
            this.colors.error,
            this.colors.info,
            this.colors.purple,
            this.colors.pink,
            this.colors.indigo,
            this.colors.teal,
            this.colors.secondary
        ];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            Utils.log('info', 'Initializing Dynamic Dashboard');
            
            // Show loading overlay
            this.showLoading(true);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadData();
            
            // Initialize charts
            this.initializeCharts();
            
            // Set up filters
            this.setupFilters();
            
            // Initial render
            this.applyFilters();
            
            this.isInitialized = true;
            Utils.log('info', 'Dashboard initialized successfully');
            
            // Hide loading overlay
            this.showLoading(false);
            
            // Show success status
            this.showStatus('Dashboard loaded successfully!', 'success');
            
        } catch (error) {
            Utils.log('error', 'Dashboard initialization failed', error);
            this.showLoading(false);
            this.showErrorModal('Failed to load dashboard: ' + error.message);
            this.showStatus('Dashboard initialization failed', 'error');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Date range filter
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => this.handleDateRangeChange(e.target.value));
        }

        // Apply filters button
        const applyFilters = document.getElementById('apply-filters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => this.applyFilters());
        }

        // Chart type buttons
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartName = e.target.dataset.chart;
                const chartType = e.target.dataset.type;
                this.changeChartType(chartName, chartType, e.target);
            });
        });

        // Table search
        const tableSearch = document.getElementById('table-search');
        if (tableSearch) {
            const debouncedSearch = Utils.debounce((value) => {
                this.handleTableSearch(value);
            }, 300);
            
            tableSearch.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }

        // Table limit
        const tableLimit = document.getElementById('table-limit');
        if (tableLimit) {
            tableLimit.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Pagination
        const prevPage = document.getElementById('prev-page');
        const nextPage = document.getElementById('next-page');
        
        if (prevPage) {
            prevPage.addEventListener('click', () => this.previousPage());
        }
        
        if (nextPage) {
            nextPage.addEventListener('click', () => this.nextPage());
        }

        // Status close button
        const statusClose = document.getElementById('status-close');
        if (statusClose) {
            statusClose.addEventListener('click', () => this.hideStatus());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportData();
            }
            
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        Utils.log('info', 'Event listeners set up');
    }

    /**
     * Load data from Google Sheets
     */
    async loadData() {
        try {
            Utils.log('info', 'Loading data from Google Sheets');
            
            // Fetch data using the service
            this.data = await gsDataService.fetchData(true);
            this.filteredData = [...this.data];
            
            Utils.log('info', `Loaded ${this.data.length} records`);
            
        } catch (error) {
            Utils.log('error', 'Failed to load data', error);
            throw error;
        }
    }

    /**
     * Refresh data
     */
    async refreshData() {
        try {
            this.showStatus('Refreshing data...', 'loading');
            
            // Fetch fresh data
            this.data = await gsDataService.fetchData(false);
            
            // Reapply current filters
            this.applyFilters();
            
            this.showStatus('Data refreshed successfully!', 'success');
            
        } catch (error) {
            Utils.log('error', 'Failed to refresh data', error);

            // Show appropriate error message based on error type
            if (error.message.includes('timeout') || error.message.includes('network')) {
                this.showErrorModal('Connection timeout. Please check your internet connection and try again.');
            } else if (error.message.includes('HTTP 403')) {
                this.showErrorModal('Access denied. Please ensure your Google Sheet is publicly accessible.');
            } else if (error.message.includes('HTTP 404')) {
                this.showErrorModal('Google Sheet not found. Please check the sheet ID and name.');
            } else {
                this.showErrorModal('Failed to refresh data: ' + error.message);
            }

            this.showStatus('Data refresh failed', 'error');
        }
    }

    /**
     * Set up filter options
     */
    setupFilters() {
        // Populate status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter && this.data.length > 0) {
            const statuses = [...new Set(this.data.map(item => item.status).filter(Boolean))];
            
            // Clear existing options except "All Status"
            statusFilter.innerHTML = '<option value="all">All Status</option>';
            
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                statusFilter.appendChild(option);
            });
        }

        // Populate supplier filter
        const supplierFilter = document.getElementById('supplier-filter');
        if (supplierFilter && this.data.length > 0) {
            const suppliers = [...new Set(this.data.map(item => item.supplier).filter(Boolean))];
            
            // Clear existing options except "All Suppliers"
            supplierFilter.innerHTML = '<option value="all">All Suppliers</option>';
            
            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier;
                option.textContent = supplier;
                supplierFilter.appendChild(option);
            });
        }
    }

    /**
     * Handle date range change
     */
    handleDateRangeChange(value) {
        const customRanges = document.querySelectorAll('.custom-range');
        
        if (value === 'custom') {
            customRanges.forEach(range => range.classList.remove('hidden'));
        } else {
            customRanges.forEach(range => range.classList.add('hidden'));
        }
    }

    /**
     * Apply filters to data
     */
    applyFilters() {
        let filtered = [...this.data];
        
        // Date filter
        const dateRange = document.getElementById('date-range')?.value;
        if (dateRange && dateRange !== 'all') {
            filtered = this.filterByDateRange(filtered, dateRange);
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter')?.value;
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }
        
        // Supplier filter
        const supplierFilter = document.getElementById('supplier-filter')?.value;
        if (supplierFilter && supplierFilter !== 'all') {
            filtered = filtered.filter(item => item.supplier === supplierFilter);
        }
        
        this.filteredData = filtered;
        this.currentPage = 1;
        
        // Update all components
        this.updateKPIs();
        this.updateCharts();
        this.renderTable();
        
        Utils.log('info', `Filters applied: ${this.filteredData.length} of ${this.data.length} records`);
    }

    /**
     * Filter data by date range
     */
    filterByDateRange(data, range) {
        const now = new Date();
        let startDate, endDate;
        
        switch (range) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                break;
                
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                startDate = startOfWeek;
                endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
                
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
                
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
                break;
                
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear() + 1, 0, 1);
                break;
                
            case 'custom':
                const startInput = document.getElementById('start-date')?.value;
                const endInput = document.getElementById('end-date')?.value;
                
                if (startInput) startDate = new Date(startInput);
                if (endInput) endDate = new Date(endInput + 'T23:59:59');
                break;
                
            default:
                return data;
        }
        
        return data.filter(item => {
            const itemDate = new Date(item.date);
            if (isNaN(itemDate.getTime())) return true;

            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate >= endDate) return false;

            return true;
        });
    }

    /**
     * Update KPI cards
     */
    updateKPIs() {
        const data = this.filteredData;

        // Calculate metrics
        const totalOrders = data.length;
        const totalQuantity = data.reduce((sum, item) => sum + (Utils.parseNumber(item.quantity) || 0), 0);
        const totalValue = data.reduce((sum, item) => sum + (Utils.parseNumber(item.total_value) || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

        // Update DOM elements
        this.updateElement('total-orders', Utils.formatNumber(totalOrders));
        this.updateElement('total-quantity', Utils.formatNumber(totalQuantity));
        this.updateElement('total-value', Utils.formatCurrency(totalValue));
        this.updateElement('avg-order-value', Utils.formatCurrency(avgOrderValue));

        // Calculate changes (mock data for demo - in real app, compare with previous period)
        this.updateKPIChange('orders-change', 12.5, 'positive');
        this.updateKPIChange('quantity-change', 8.3, 'positive');
        this.updateKPIChange('value-change', -2.1, 'negative');
        this.updateKPIChange('avg-change', 0, 'neutral');
    }

    /**
     * Update element text content
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Update KPI change indicator
     */
    updateKPIChange(elementId, change, direction) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.className = `kpi-change ${direction}`;

        const icon = element.querySelector('i');
        const span = element.querySelector('span');

        if (icon && span) {
            if (direction === 'positive') {
                icon.className = 'fas fa-arrow-up';
            } else if (direction === 'negative') {
                icon.className = 'fas fa-arrow-down';
            } else {
                icon.className = 'fas fa-minus';
            }

            span.textContent = `${Math.abs(change)}%`;
        }
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.initTrendChart();
        this.initStatusChart();
        this.initSupplierChart();
        this.initValueChart();
    }

    /**
     * Initialize trend chart
     */
    initTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Orders',
                    data: [],
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize status chart
     */
    initStatusChart() {
        const ctx = document.getElementById('status-chart');
        if (!ctx) return;

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: this.chartColors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize supplier chart
     */
    initSupplierChart() {
        const ctx = document.getElementById('supplier-chart');
        if (!ctx) return;

        this.charts.supplier = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Orders',
                    data: [],
                    backgroundColor: this.colors.primary,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize value chart
     */
    initValueChart() {
        const ctx = document.getElementById('value-chart');
        if (!ctx) return;

        this.charts.value = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Value',
                    data: [],
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Update all charts with current data
     */
    updateCharts() {
        this.updateTrendChart();
        this.updateStatusChart();
        this.updateSupplierChart();
        this.updateValueChart();
    }

    /**
     * Update trend chart
     */
    updateTrendChart() {
        if (!this.charts.trend) return;

        // Group data by date
        const dateGroups = this.groupDataByDate(this.filteredData);
        const sortedDates = Object.keys(dateGroups).sort();

        const labels = sortedDates.map(date => Utils.formatDate(date));
        const data = sortedDates.map(date => dateGroups[date].length);

        this.charts.trend.data.labels = labels;
        this.charts.trend.data.datasets[0].data = data;
        this.charts.trend.update();
    }

    /**
     * Update status chart
     */
    updateStatusChart() {
        if (!this.charts.status) return;

        // Group data by status
        const statusGroups = this.groupDataByField(this.filteredData, 'status');

        const labels = Object.keys(statusGroups);
        const data = Object.values(statusGroups).map(group => group.length);

        this.charts.status.data.labels = labels;
        this.charts.status.data.datasets[0].data = data;
        this.charts.status.update();
    }

    /**
     * Update supplier chart
     */
    updateSupplierChart() {
        if (!this.charts.supplier) return;

        // Group data by supplier and get top 10
        const supplierGroups = this.groupDataByField(this.filteredData, 'supplier');
        const sortedSuppliers = Object.entries(supplierGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10);

        const labels = sortedSuppliers.map(([supplier]) => supplier);
        const data = sortedSuppliers.map(([, group]) => group.length);

        this.charts.supplier.data.labels = labels;
        this.charts.supplier.data.datasets[0].data = data;
        this.charts.supplier.update();
    }

    /**
     * Update value chart
     */
    updateValueChart() {
        if (!this.charts.value) return;

        // Group data by date and sum values
        const dateGroups = this.groupDataByDate(this.filteredData);
        const sortedDates = Object.keys(dateGroups).sort();

        const labels = sortedDates.map(date => Utils.formatDate(date));
        const data = sortedDates.map(date => {
            return dateGroups[date].reduce((sum, item) => {
                return sum + (Utils.parseNumber(item.total_value) || 0);
            }, 0);
        });

        this.charts.value.data.labels = labels;
        this.charts.value.data.datasets[0].data = data;
        this.charts.value.update();
    }

    /**
     * Group data by date
     */
    groupDataByDate(data) {
        const groups = {};

        data.forEach(item => {
            const date = item.date ? item.date.split('T')[0] : 'Unknown';
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
        });

        return groups;
    }

    /**
     * Group data by field
     */
    groupDataByField(data, field) {
        const groups = {};

        data.forEach(item => {
            const value = item[field] || 'Unknown';
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(item);
        });

        return groups;
    }

    /**
     * Change chart type
     */
    changeChartType(chartName, chartType, button) {
        if (!this.charts[chartName]) return;

        // Update button states
        const chartContainer = button.closest('.chart-container');
        const buttons = chartContainer.querySelectorAll('.chart-type-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update chart type
        this.charts[chartName].config.type = chartType;
        this.charts[chartName].update();
    }

    /**
     * Render data table
     */
    renderTable() {
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');

        if (!tableHead || !tableBody || this.filteredData.length === 0) {
            this.renderEmptyTable();
            return;
        }

        // Get headers from first row
        const headers = Object.keys(this.filteredData[0]).filter(key => key !== '_rowIndex');

        // Render headers
        this.renderTableHeaders(tableHead, headers);

        // Get paginated data
        const paginatedData = this.getPaginatedData();

        // Render rows
        this.renderTableRows(tableBody, headers, paginatedData);

        // Update pagination info
        this.updatePaginationInfo();
    }

    /**
     * Render table headers
     */
    renderTableHeaders(tableHead, headers) {
        const headerRow = headers.map(header => {
            const displayName = this.formatHeaderName(header);
            return `<th onclick="dashboard.sortTable('${header}')">${displayName}</th>`;
        }).join('');

        tableHead.innerHTML = `<tr>${headerRow}</tr>`;
    }

    /**
     * Render table rows
     */
    renderTableRows(tableBody, headers, data) {
        const rows = data.map(row => {
            const cells = headers.map(header => {
                const value = row[header];
                const formattedValue = this.formatCellValue(header, value);
                return `<td>${Utils.escapeHtml(formattedValue)}</td>`;
            }).join('');

            return `<tr>${cells}</tr>`;
        }).join('');

        tableBody.innerHTML = rows;
    }

    /**
     * Render empty table
     */
    renderEmptyTable() {
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');

        if (tableHead) {
            tableHead.innerHTML = '<tr><th>No Data</th></tr>';
        }

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td style="text-align: center; padding: 3rem; color: #64748b;">
                        <div>
                            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                            <div style="font-weight: 500; margin-bottom: 0.5rem;">No data available</div>
                            <div style="font-size: 0.9rem;">Try adjusting your filters</div>
                        </div>
                    </td>
                </tr>
            `;
        }

        this.updatePaginationInfo();
    }

    /**
     * Format header name for display
     */
    formatHeaderName(header) {
        return header
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Format cell value for display
     */
    formatCellValue(header, value) {
        if (value === null || value === undefined) return '';

        const headerLower = header.toLowerCase();

        // Format currency fields
        if (headerLower.includes('price') || headerLower.includes('value') ||
            headerLower.includes('cost') || headerLower.includes('amount')) {
            return Utils.formatCurrency(value);
        }

        // Format date fields
        if (headerLower.includes('date') || headerLower.includes('time')) {
            return Utils.formatDate(value);
        }

        // Format quantity fields
        if (headerLower.includes('quantity') || headerLower.includes('qty') ||
            headerLower.includes('count')) {
            return Utils.formatNumber(value);
        }

        return String(value);
    }

    /**
     * Get paginated data
     */
    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredData.slice(startIndex, endIndex);
    }

    /**
     * Update pagination info
     */
    updatePaginationInfo() {
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update table info
        const tableInfo = document.getElementById('table-info');
        if (tableInfo) {
            tableInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} entries`;
        }

        // Update page info
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        // Update pagination buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }
    }

    /**
     * Handle table search
     */
    handleTableSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.applyFilters();
            return;
        }

        this.filteredData = Utils.filterBySearch(this.filteredData, searchTerm);
        this.currentPage = 1;
        this.renderTable();
    }

    /**
     * Go to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    }

    /**
     * Export data to CSV
     */
    exportData() {
        if (this.filteredData.length === 0) {
            this.showStatus('No data to export', 'error');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `inventory_dashboard_${timestamp}.csv`;

        Utils.exportToCSV(this.filteredData, filename);
        this.showStatus('Data exported successfully!', 'success');
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Could not enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        // Use toast notifications for better UX
        this.showToast(message, type);

        // Also update status bar for persistent messages
        const statusBar = document.getElementById('status-bar');
        const statusText = document.getElementById('status-text');

        if (statusBar && statusText) {
            statusText.textContent = message;
            statusBar.className = `status-bar status-${type}`;
            statusBar.classList.remove('hidden');

            // Auto-hide success and error messages
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    this.hideStatus();
                }, 5000);
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type, duration);
        } else {
            // Fallback to console if toast system not available
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Hide status message
     */
    hideStatus() {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.classList.add('hidden');
        }
    }

    /**
     * Sort table by column
     */
    sortTable(column) {
        // Simple sorting implementation
        this.filteredData.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];

            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        });

        this.renderTable();
    }

    /**
     * Show error modal
     */
    showErrorModal(message) {
        if (typeof window.showErrorModal === 'function') {
            window.showErrorModal(message);
        } else {
            // Fallback to alert if modal system not available
            alert('Error: ' + message);
        }
    }

    /**
     * Update data information
     */
    updateDataInfo() {
        if (typeof window.updateDataInfo === 'function') {
            window.updateDataInfo();
        }
    }

    /**
     * Enhanced export with progress indication
     */
    exportData() {
        if (this.filteredData.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        try {
            this.showToast('Preparing export...', 'info', 2000);

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `inventory_dashboard_${timestamp}.csv`;

            // Add export metadata
            const exportData = this.filteredData.map(item => ({
                ...item,
                exported_at: new Date().toISOString(),
                filter_applied: this.getActiveFilters()
            }));

            Utils.exportToCSV(exportData, filename);
            this.showToast(`Exported ${this.filteredData.length} records successfully!`, 'success');

            // Update data info
            this.updateDataInfo();

        } catch (error) {
            Utils.log('error', 'Export failed', error);
            this.showToast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Get active filters summary
     */
    getActiveFilters() {
        const filters = [];

        const dateRange = document.getElementById('date-range')?.value;
        if (dateRange && dateRange !== 'all') {
            filters.push(`Date: ${dateRange}`);
        }

        const statusFilter = document.getElementById('status-filter')?.value;
        if (statusFilter && statusFilter !== 'all') {
            filters.push(`Status: ${statusFilter}`);
        }

        const supplierFilter = document.getElementById('supplier-filter')?.value;
        if (supplierFilter && supplierFilter !== 'all') {
            filters.push(`Supplier: ${supplierFilter}`);
        }

        const searchTerm = document.getElementById('table-search')?.value;
        if (searchTerm) {
            filters.push(`Search: ${searchTerm}`);
        }

        return filters.length > 0 ? filters.join(', ') : 'None';
    }

    /**
     * Enhanced refresh with progress indication
     */
    async refreshData() {
        try {
            this.showToast('Refreshing data from Google Sheets...', 'info', 3000);

            // Show loading state on refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            const originalText = refreshBtn?.innerHTML;
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
                refreshBtn.disabled = true;
            }

            // Fetch fresh data
            this.data = await gsDataService.fetchData(false);

            // Reapply current filters
            this.applyFilters();

            // Update data info
            this.updateDataInfo();

            this.showToast(`Data refreshed successfully! ${this.data.length} records loaded.`, 'success');

            // Restore refresh button
            if (refreshBtn && originalText) {
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
            }

        } catch (error) {
            Utils.log('error', 'Failed to refresh data', error);

            // Restore refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                refreshBtn.disabled = false;
            }

            // Show appropriate error message based on error type
            if (error.message.includes('timeout') || error.message.includes('network')) {
                this.showErrorModal('Connection timeout. Please check your internet connection and try again.');
            } else if (error.message.includes('HTTP 403')) {
                this.showErrorModal('Access denied. Please ensure your Google Sheet is publicly accessible.');
            } else if (error.message.includes('HTTP 404')) {
                this.showErrorModal('Google Sheet not found. Please check the sheet ID and name.');
            } else {
                this.showErrorModal('Failed to refresh data: ' + error.message);
            }

            this.showToast('Data refresh failed', 'error');
        }
    }

    /**
     * Get dashboard status for debugging
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            dataCount: this.data.length,
            filteredCount: this.filteredData.length,
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            chartsInitialized: Object.keys(this.charts).length,
            activeFilters: this.getActiveFilters(),
            serviceStatus: gsDataService.getStatus(),
            lastRefresh: new Date().toISOString()
        };
    }

    /**
     * Reset dashboard to initial state
     */
    reset() {
        // Reset filters
        const dateRange = document.getElementById('date-range');
        const statusFilter = document.getElementById('status-filter');
        const supplierFilter = document.getElementById('supplier-filter');
        const tableSearch = document.getElementById('table-search');

        if (dateRange) dateRange.value = 'month';
        if (statusFilter) statusFilter.value = 'all';
        if (supplierFilter) supplierFilter.value = 'all';
        if (tableSearch) tableSearch.value = '';

        // Reset pagination
        this.currentPage = 1;

        // Reapply filters
        this.applyFilters();

        this.showToast('Dashboard reset to default state', 'info');
    }
}

// Initialize the dashboard
const dashboard = new DynamicDashboard();

// Make dashboard available globally for debugging
window.dashboard = dashboard;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicDashboard;
}
