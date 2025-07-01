/**
 * Main Application Controller
 * Initializes the inventory management app and handles UI interactions
 */

class InventoryApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.isInitialized = false;

        // DOM elements
        this.elements = {};

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            Utils.log('info', 'Initializing Inventory Management App');

            // Cache DOM elements
            this.cacheElements();

            // Set up event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadData();

            this.isInitialized = true;
            Utils.log('info', 'App initialized successfully');

        } catch (error) {
            Utils.log('error', 'App initialization failed', error);
            Utils.showStatus('Failed to initialize application: ' + error.message, 'error');
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Buttons
            refreshBtn: document.getElementById('refresh-btn'),
            exportBtn: document.getElementById('export-btn'),

            // Search
            searchInput: document.getElementById('search-input'),

            // Sections
            summarySection: document.getElementById('summary-section'),
            tableSection: document.getElementById('table-section'),

            // Summary cards
            totalItems: document.getElementById('total-items'),
            totalQuantity: document.getElementById('total-quantity'),
            totalValue: document.getElementById('total-value'),
            lastUpdated: document.getElementById('last-updated'),

            // Table
            tableHead: document.getElementById('table-head'),
            tableBody: document.getElementById('table-body'),
            tableInfo: document.getElementById('table-info')
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Refresh button
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Search input with debouncing
        if (this.elements.searchInput) {
            const debouncedSearch = Utils.debounce((value) => {
                this.handleSearch(value);
            }, 300);

            this.elements.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R: Refresh data
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }

            // Ctrl/Cmd + E: Export data
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportData();
            }
        });

        Utils.log('info', 'Event listeners set up');
    }

    /**
     * Load data from Google Sheets
     * @param {boolean} useCache - Whether to use cached data
     */
    async loadData(useCache = true) {
        try {
            Utils.showStatus('Loading inventory data...', 'loading');
            Utils.toggleLoading(this.elements.refreshBtn, true);

            // Fetch data from Google Sheets
            this.data = await gsDataService.fetchData(useCache);

            // Initialize filtered data
            this.filteredData = [...this.data];

            // Update UI
            this.updateSummary();
            this.renderTable();
            this.showSections();

            Utils.showStatus(`Successfully loaded ${this.data.length} records`, 'success', true);

        } catch (error) {
            Utils.log('error', 'Failed to load data', error);

            let errorMessage = 'Failed to load data';

            if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please check your internet connection.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = 'Google Sheet not found. Please check the sheet ID and name.';
            } else if (error.message.includes('HTTP 403')) {
                errorMessage = 'Access denied. Please make sure the Google Sheet is publicly accessible.';
            }

            Utils.showStatus(errorMessage, 'error');

        } finally {
            Utils.toggleLoading(this.elements.refreshBtn, false);
        }
    }

    /**
     * Refresh data from Google Sheets
     */
    async refreshData() {
        Utils.log('info', 'Refreshing data');
        await this.loadData(false); // Force fresh data
    }

    /**
     * Handle search input
     * @param {string} searchTerm - Search term
     */
    handleSearch(searchTerm) {
        Utils.log('info', 'Searching for:', searchTerm);

        if (!searchTerm.trim()) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = Utils.filterBySearch(this.data, searchTerm);
        }

        this.updateSummary();
        this.renderTable();

        Utils.log('info', `Search results: ${this.filteredData.length} items`);
    }

    /**
     * Update summary cards
     */
    updateSummary() {
        const summary = Utils.calculateSummary(this.filteredData);

        if (this.elements.totalItems) {
            this.elements.totalItems.textContent = Utils.formatNumber(summary.totalItems);
        }

        if (this.elements.totalQuantity) {
            this.elements.totalQuantity.textContent = Utils.formatNumber(summary.totalQuantity);
        }

        if (this.elements.totalValue) {
            this.elements.totalValue.textContent = Utils.formatCurrency(summary.totalValue);
        }

        if (this.elements.lastUpdated) {
            this.elements.lastUpdated.textContent = summary.lastUpdated;
        }
    }

    /**
     * Render data table
     */
    renderTable() {
        if (!this.elements.tableHead || !this.elements.tableBody) return;

        if (this.filteredData.length === 0) {
            this.renderEmptyTable();
            return;
        }

        // Generate table headers from first row
        const headers = Object.keys(this.filteredData[0]).filter(key => key !== '_rowIndex');
        this.renderTableHeaders(headers);

        // Generate table rows
        this.renderTableRows(headers);

        // Update table info
        this.updateTableInfo();
    }

    /**
     * Render table headers
     * @param {Array} headers - Column headers
     */
    renderTableHeaders(headers) {
        const headerRow = headers.map(header => {
            const displayName = this.formatHeaderName(header);
            return `<th>${Utils.escapeHtml(displayName)}</th>`;
        }).join('');

        this.elements.tableHead.innerHTML = `<tr>${headerRow}</tr>`;
    }

    /**
     * Render table rows
     * @param {Array} headers - Column headers
     */
    renderTableRows(headers) {
        const rows = this.filteredData.map(row => {
            const cells = headers.map(header => {
                const value = row[header];
                const formattedValue = this.formatCellValue(header, value);
                return `<td>${Utils.escapeHtml(formattedValue)}</td>`;
            }).join('');

            return `<tr>${cells}</tr>`;
        }).join('');

        this.elements.tableBody.innerHTML = rows;
    }

    /**
     * Render empty table state
     */
    renderEmptyTable() {
        this.elements.tableHead.innerHTML = '<tr><th>No Data</th></tr>';

        const searchTerm = this.elements.searchInput?.value;
        const message = searchTerm
            ? `No results found for "${searchTerm}"`
            : 'No data available';

        this.elements.tableBody.innerHTML = `
            <tr>
                <td style="text-align: center; padding: 2rem; color: #6c757d;">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📭</div>
                        <div style="font-weight: 500; margin-bottom: 0.5rem;">${message}</div>
                        <div style="font-size: 0.9rem;">Try adjusting your search terms</div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Format header names for display
     * @param {string} header - Original header name
     * @returns {string} Formatted header name
     */
    formatHeaderName(header) {
        return header
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Format cell values for display
     * @param {string} header - Column header
     * @param {*} value - Cell value
     * @returns {string} Formatted value
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
     * Update table info
     */
    updateTableInfo() {
        if (!this.elements.tableInfo) return;

        const total = this.data.length;
        const filtered = this.filteredData.length;

        let infoText = `Showing ${filtered} of ${total} entries`;

        if (filtered !== total) {
            infoText += ` (filtered)`;
        }

        this.elements.tableInfo.textContent = infoText;
    }

    /**
     * Show main sections after data is loaded
     */
    showSections() {
        if (this.elements.summarySection) {
            this.elements.summarySection.classList.remove('hidden');
        }

        if (this.elements.tableSection) {
            this.elements.tableSection.classList.remove('hidden');
        }
    }

    /**
     * Export data to CSV
     */
    exportData() {
        if (this.filteredData.length === 0) {
            Utils.showStatus('No data to export', 'error', true);
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `inventory_data_${timestamp}.csv`;

        Utils.exportToCSV(this.filteredData, filename);
    }

    /**
     * Get app status for debugging
     * @returns {Object} App status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            dataCount: this.data.length,
            filteredCount: this.filteredData.length,
            serviceStatus: gsDataService.getStatus()
        };
    }
}

// Initialize the app
const app = new InventoryApp();

// Make app available globally for debugging
window.app = app;
window.gsDataService = gsDataService;
window.Utils = Utils;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryApp;
}
