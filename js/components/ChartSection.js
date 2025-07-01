/**
 * Chart Section Component
 * Wrapper component for Chart.js charts
 */

const ChartSection = {
    // Active charts
    charts: new Map(),
    
    /**
     * Create chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} config - Chart configuration
     * @returns {Object} - Chart instance
     */
    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Merge with default options
        const chartConfig = {
            ...config,
            options: {
                ...CONFIG.CHARTS.DEFAULT_OPTIONS,
                ...config.options
            }
        };
        
        // Create chart
        const chart = new Chart(ctx, chartConfig);
        
        // Store chart reference
        this.charts.set(canvasId, chart);
        
        return chart;
    },
    
    /**
     * Update chart data
     * @param {string} canvasId - Canvas element ID
     * @param {Object} newData - New chart data
     */
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;
        
        chart.data = newData;
        chart.update();
    },
    
    /**
     * Destroy chart
     * @param {string} canvasId - Canvas element ID
     */
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    },
    
    /**
     * Create line chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Object} - Chart instance
     */
    createLineChart(canvasId, data, options = {}) {
        return this.createChart(canvasId, {
            type: 'line',
            data,
            options: {
                tension: 0.4,
                ...options
            }
        });
    },
    
    /**
     * Create bar chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Object} - Chart instance
     */
    createBarChart(canvasId, data, options = {}) {
        return this.createChart(canvasId, {
            type: 'bar',
            data,
            options
        });
    },
    
    /**
     * Create pie chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Object} - Chart instance
     */
    createPieChart(canvasId, data, options = {}) {
        return this.createChart(canvasId, {
            type: 'pie',
            data,
            options
        });
    },
    
    /**
     * Create doughnut chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Object} - Chart instance
     */
    createDoughnutChart(canvasId, data, options = {}) {
        return this.createChart(canvasId, {
            type: 'doughnut',
            data,
            options
        });
    },
    
    /**
     * Get chart colors
     * @param {number} count - Number of colors needed
     * @returns {Array} - Array of colors
     */
    getChartColors(count = 1) {
        const colors = [
            CONFIG.CHARTS.COLORS.PRIMARY,
            CONFIG.CHARTS.COLORS.SUCCESS,
            CONFIG.CHARTS.COLORS.WARNING,
            CONFIG.CHARTS.COLORS.ERROR,
            CONFIG.CHARTS.COLORS.INFO,
            CONFIG.CHARTS.COLORS.SECONDARY
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        
        return result;
    },
    
    /**
     * Process data for time series chart
     * @param {Array} data - Raw data
     * @param {string} dateField - Date field name
     * @param {string} valueField - Value field name
     * @returns {Object} - Processed chart data
     */
    processTimeSeriesData(data, dateField, valueField) {
        // Group data by date
        const grouped = Helpers.groupBy(data, dateField);
        
        // Sort dates
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
        
        // Create chart data
        return {
            labels: sortedDates.map(date => Formatters.date(date)),
            datasets: [{
                label: valueField,
                data: sortedDates.map(date => {
                    return Helpers.sum(grouped[date], valueField);
                }),
                borderColor: CONFIG.CHARTS.COLORS.PRIMARY,
                backgroundColor: CONFIG.CHARTS.COLORS.PRIMARY + '20',
                tension: 0.4
            }]
        };
    },
    
    /**
     * Process data for category chart
     * @param {Array} data - Raw data
     * @param {string} categoryField - Category field name
     * @param {string} valueField - Value field name
     * @returns {Object} - Processed chart data
     */
    processCategoryData(data, categoryField, valueField) {
        // Group data by category
        const grouped = Helpers.groupBy(data, categoryField);
        
        // Get categories and values
        const categories = Object.keys(grouped);
        const values = categories.map(category => {
            return Helpers.sum(grouped[category], valueField);
        });
        
        return {
            labels: categories,
            datasets: [{
                label: valueField,
                data: values,
                backgroundColor: this.getChartColors(categories.length)
            }]
        };
    },
    
    /**
     * Show chart loading state
     * @param {string} canvasId - Canvas element ID
     */
    showLoading(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const container = canvas.closest('.chart-body');
        if (container) {
            container.innerHTML = `
                <div class="chart-loading">
                    <div class="spinner"></div>
                    <p>Loading chart...</p>
                </div>
            `;
        }
    },
    
    /**
     * Show chart error
     * @param {string} canvasId - Canvas element ID
     * @param {string} message - Error message
     */
    showError(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const container = canvas.closest('.chart-body');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h4>Chart Error</h4>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }
};
