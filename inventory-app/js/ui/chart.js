/**
 * Chart UI Component
 * Chart.js integration with dynamic chart types and data visualization
 */

class ChartComponent {
    constructor() {
        this.chart = null;
        this.chartCanvas = null;
        this.currentType = 'line';
        this.isInitialized = false;
    }

    /**
     * Initialize chart component
     */
    init() {
        if (this.isInitialized) return;
        
        this.chartCanvas = document.getElementById('main-chart');
        if (!this.chartCanvas) {
            CONFIG.log('error', 'Chart canvas not found');
            return;
        }
        
        this.attachEventListeners();
        this.loadChartType();
        
        this.isInitialized = true;
        CONFIG.log('info', 'Chart component initialized');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Chart type toggle buttons
        const chartTypeButtons = document.querySelectorAll('.chart-type-btn');
        chartTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeChartType(btn.dataset.type);
            });
        });

        // Subscribe to state changes
        stateManager.subscribe('data.filtered', () => {
            this.updateChart();
        });

        stateManager.subscribe('ui.selectedChartType', (chartType) => {
            this.currentType = chartType;
            this.updateChartTypeButtons();
            this.updateChart();
        });
    }

    /**
     * Change chart type
     * @param {string} type - Chart type (line, bar, pie)
     */
    changeChartType(type) {
        if (type === this.currentType) return;
        
        CONFIG.log('debug', 'Changing chart type', { from: this.currentType, to: type });
        
        // Update state
        stateManager.set('ui.selectedChartType', type);
    }

    /**
     * Update chart type buttons
     */
    updateChartTypeButtons() {
        const buttons = document.querySelectorAll('.chart-type-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === this.currentType);
        });
    }

    /**
     * Load saved chart type
     */
    loadChartType() {
        this.currentType = stateManager.get('ui.selectedChartType') || 'line';
        this.updateChartTypeButtons();
    }

    /**
     * Update chart with current data
     */
    updateChart() {
        const data = stateManager.get('data.filtered') || [];
        
        if (data.length === 0) {
            this.showEmptyChart();
            return;
        }
        
        try {
            const chartData = this.prepareChartData(data);
            this.renderChart(chartData);
        } catch (error) {
            CONFIG.log('error', 'Failed to update chart', error);
            this.showErrorChart();
        }
    }

    /**
     * Prepare data for chart based on current type
     * @param {Array} data - Raw data
     * @returns {Object} Chart data object
     */
    prepareChartData(data) {
        switch (this.currentType) {
            case 'line':
            case 'bar':
                return this.prepareTimeSeriesData(data);
            case 'pie':
                return this.prepareStatusData(data);
            default:
                return this.prepareTimeSeriesData(data);
        }
    }

    /**
     * Prepare time series data for line/bar charts
     * @param {Array} data - Raw data
     * @returns {Object} Chart data
     */
    prepareTimeSeriesData(data) {
        // Group data by date
        const groupedData = this.groupDataByDate(data);
        
        // Sort dates
        const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
        
        // Prepare datasets
        const labels = sortedDates.map(date => Helpers.formatDate(date, CONFIG.DATE_FORMATS.CHART));
        
        const quantityData = sortedDates.map(date => {
            return groupedData[date].reduce((sum, item) => sum + (item.quantity || 0), 0);
        });
        
        const valueData = sortedDates.map(date => {
            return groupedData[date].reduce((sum, item) => sum + (item.total_value || 0), 0);
        });
        
        return {
            labels,
            datasets: [
                {
                    label: 'Quantity',
                    data: quantityData,
                    borderColor: CONFIG.UI.CHART_COLORS.primary,
                    backgroundColor: this.currentType === 'bar' 
                        ? CONFIG.UI.CHART_COLORS.primary + '80'
                        : CONFIG.UI.CHART_COLORS.primary + '20',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Value ($)',
                    data: valueData,
                    borderColor: CONFIG.UI.CHART_COLORS.success,
                    backgroundColor: this.currentType === 'bar'
                        ? CONFIG.UI.CHART_COLORS.success + '80'
                        : CONFIG.UI.CHART_COLORS.success + '20',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    /**
     * Prepare status distribution data for pie chart
     * @param {Array} data - Raw data
     * @returns {Object} Chart data
     */
    prepareStatusData(data) {
        // Group by status
        const statusCounts = {};
        const statusValues = {};
        
        data.forEach(item => {
            const status = item.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
            statusValues[status] = (statusValues[status] || 0) + (item.total_value || 0);
        });
        
        const labels = Object.keys(statusCounts);
        const counts = Object.values(statusCounts);
        const values = Object.values(statusValues);
        
        // Use values for pie chart (more meaningful than counts)
        return {
            labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
            datasets: [{
                label: 'Order Value by Status',
                data: values,
                backgroundColor: [
                    CONFIG.UI.CHART_COLORS.success,
                    CONFIG.UI.CHART_COLORS.warning,
                    CONFIG.UI.CHART_COLORS.error,
                    CONFIG.UI.CHART_COLORS.info,
                    CONFIG.UI.CHART_COLORS.secondary
                ].slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }

    /**
     * Group data by date
     * @param {Array} data - Raw data
     * @returns {Object} Grouped data
     */
    groupDataByDate(data) {
        const grouped = {};
        
        data.forEach(item => {
            const date = item.date ? item.date.split('T')[0] : 'unknown';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(item);
        });
        
        return grouped;
    }

    /**
     * Render chart with data
     * @param {Object} chartData - Chart data object
     */
    renderChart(chartData) {
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Get chart configuration
        const config = this.getChartConfig(chartData);
        
        // Create new chart
        this.chart = new Chart(this.chartCanvas, config);
        
        CONFIG.log('debug', 'Chart rendered', { type: this.currentType, dataPoints: chartData.labels?.length || 0 });
    }

    /**
     * Get chart configuration
     * @param {Object} chartData - Chart data
     * @returns {Object} Chart configuration
     */
    getChartConfig(chartData) {
        const baseConfig = {
            type: this.currentType,
            data: chartData,
            options: {
                ...CONFIG.CHART_CONFIG,
                plugins: {
                    ...CONFIG.CHART_CONFIG.plugins,
                    title: {
                        display: true,
                        text: this.getChartTitle(),
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                }
            }
        };
        
        // Add specific configurations based on chart type
        switch (this.currentType) {
            case 'line':
                return this.configureLineChart(baseConfig);
            case 'bar':
                return this.configureBarChart(baseConfig);
            case 'pie':
                return this.configurePieChart(baseConfig);
            default:
                return baseConfig;
        }
    }

    /**
     * Configure line chart
     * @param {Object} config - Base configuration
     * @returns {Object} Line chart configuration
     */
    configureLineChart(config) {
        config.options.scales = {
            ...CONFIG.CHART_CONFIG.scales,
            y: {
                ...CONFIG.CHART_CONFIG.scales.y,
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Quantity'
                }
            },
            y1: {
                ...CONFIG.CHART_CONFIG.scales.y,
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Value ($)'
                },
                grid: {
                    drawOnChartArea: false,
                }
            }
        };
        
        return config;
    }

    /**
     * Configure bar chart
     * @param {Object} config - Base configuration
     * @returns {Object} Bar chart configuration
     */
    configureBarChart(config) {
        config.options.scales = {
            ...CONFIG.CHART_CONFIG.scales,
            y: {
                ...CONFIG.CHART_CONFIG.scales.y,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantity'
                }
            },
            y1: {
                ...CONFIG.CHART_CONFIG.scales.y,
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value ($)'
                },
                grid: {
                    drawOnChartArea: false,
                }
            }
        };
        
        return config;
    }

    /**
     * Configure pie chart
     * @param {Object} config - Base configuration
     * @returns {Object} Pie chart configuration
     */
    configurePieChart(config) {
        // Remove scales for pie chart
        delete config.options.scales;
        
        // Add pie-specific options
        config.options.plugins.tooltip = {
            ...config.options.plugins.tooltip,
            callbacks: {
                label: (context) => {
                    const label = context.label || '';
                    const value = Helpers.formatCurrency(context.parsed);
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                    
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        };
        
        return config;
    }

    /**
     * Get chart title based on current type
     * @returns {string} Chart title
     */
    getChartTitle() {
        const titles = {
            line: 'Order Trends Over Time',
            bar: 'Order Volume by Date',
            pie: 'Order Value Distribution by Status'
        };
        
        return titles[this.currentType] || 'Order Analytics';
    }

    /**
     * Show empty chart state
     */
    showEmptyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        const container = this.chartCanvas.parentElement;
        container.innerHTML = `
            <div class="empty-chart-state">
                <i class="fas fa-chart-line"></i>
                <h3>No Data Available</h3>
                <p>No data to display in the chart. Try adjusting your filters.</p>
            </div>
        `;
    }

    /**
     * Show error chart state
     */
    showErrorChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        const container = this.chartCanvas.parentElement;
        container.innerHTML = `
            <div class="error-chart-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Chart Error</h3>
                <p>Unable to display chart. Please try refreshing the data.</p>
                <button class="btn btn-primary" onclick="chart.updateChart()">
                    <i class="fas fa-redo"></i>
                    Retry
                </button>
            </div>
        `;
    }

    /**
     * Export chart as image
     * @param {string} format - Image format (png, jpeg)
     */
    exportChart(format = 'png') {
        if (!this.chart) {
            CONFIG.log('warn', 'No chart to export');
            return;
        }
        
        try {
            const url = this.chart.toBase64Image(format, 1.0);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `chart_${Date.now()}.${format}`;
            link.href = url;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            CONFIG.log('info', 'Chart exported', { format });
            
        } catch (error) {
            CONFIG.log('error', 'Chart export failed', error);
        }
    }

    /**
     * Resize chart
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }

    /**
     * Destroy chart component
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        this.isInitialized = false;
    }
}

// Create singleton instance
const chart = new ChartComponent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = chart;
}
