/**
 * Table UI Component
 * Dynamic table rendering with sorting, pagination, and search
 */

class Table {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
        this.currentSort = { field: 'date', direction: 'desc' };
    }

    /**
     * Initialize table component
     */
    init() {
        if (this.isInitialized) return;
        
        this.cacheElements();
        this.attachEventListeners();
        this.setupPagination();
        
        this.isInitialized = true;
        CONFIG.log('info', 'Table component initialized');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            table: document.getElementById('data-table'),
            tableBody: document.getElementById('table-body'),
            searchInput: document.getElementById('table-search'),
            paginationText: document.getElementById('pagination-text'),
            paginationNumbers: document.getElementById('pagination-numbers'),
            prevPage: document.getElementById('prev-page'),
            nextPage: document.getElementById('next-page')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Table header sorting
        if (this.elements.table) {
            const headers = this.elements.table.querySelectorAll('th[data-sort]');
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    this.handleSort(header.dataset.sort);
                });
            });
        }

        // Search input
        if (this.elements.searchInput) {
            const debouncedSearch = Helpers.debounce((value) => {
                this.handleSearch(value);
            }, CONFIG.UI.DEBOUNCE_DELAY);

            this.elements.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Pagination buttons
        if (this.elements.prevPage) {
            this.elements.prevPage.addEventListener('click', () => {
                this.goToPreviousPage();
            });
        }

        if (this.elements.nextPage) {
            this.elements.nextPage.addEventListener('click', () => {
                this.goToNextPage();
            });
        }

        // Subscribe to state changes
        stateManager.subscribe('data.filtered', () => {
            this.render();
        });

        stateManager.subscribe('ui.currentPage', () => {
            this.updatePagination();
        });

        stateManager.subscribe('ui.sortField', () => {
            this.updateSortIndicators();
        });

        stateManager.subscribe('ui.sortDirection', () => {
            this.updateSortIndicators();
        });
    }

    /**
     * Render table with current data
     */
    render() {
        if (!this.elements.tableBody) return;

        const paginatedData = stateManager.getPaginatedData();
        
        if (paginatedData.length === 0) {
            this.renderEmptyState();
            return;
        }

        const rows = paginatedData.map(item => this.createTableRow(item)).join('');
        this.elements.tableBody.innerHTML = rows;
        
        this.updatePagination();
        this.updateSortIndicators();
        
        CONFIG.log('debug', 'Table rendered', { rows: paginatedData.length });
    }

    /**
     * Create table row HTML
     * @param {Object} item - Data item
     * @returns {string} Table row HTML
     */
    createTableRow(item) {
        const statusClass = Helpers.getStatusClass(item.status);
        
        return `
            <tr data-id="${item.po_number || ''}" class="table-row">
                <td class="po-number">${this.escapeHtml(item.po_number || '')}</td>
                <td class="date">${Helpers.formatDate(item.date)}</td>
                <td class="supplier">${this.escapeHtml(item.supplier || '')}</td>
                <td class="quantity">${Helpers.formatNumber(item.quantity || 0)}</td>
                <td class="unit-price">${Helpers.formatCurrency(item.unit_price || 0)}</td>
                <td class="total-value">${Helpers.formatCurrency(item.total_value || 0)}</td>
                <td class="status">
                    <span class="${statusClass}">${this.escapeHtml(item.status || 'pending')}</span>
                </td>
            </tr>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        const searchTerm = stateManager.get('ui.searchTerm');
        const hasFilters = this.hasActiveFilters();
        
        let message = 'No data available';
        let icon = 'fa-inbox';
        
        if (searchTerm) {
            message = `No results found for "${searchTerm}"`;
            icon = 'fa-search';
        } else if (hasFilters) {
            message = 'No data matches the current filters';
            icon = 'fa-filter';
        }
        
        this.elements.tableBody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="7" class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas ${icon}"></i>
                        <h3>${message}</h3>
                        <p>Try adjusting your search or filters</p>
                        ${hasFilters ? '<button class="btn btn-secondary" onclick="filters.resetFilters()">Clear Filters</button>' : ''}
                    </div>
                </td>
            </tr>
        `;
        
        this.updatePagination();
    }

    /**
     * Handle table sorting
     * @param {string} field - Field to sort by
     */
    handleSort(field) {
        const currentSort = stateManager.get('ui');
        let direction = 'asc';
        
        // Toggle direction if same field
        if (currentSort.sortField === field) {
            direction = currentSort.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        
        // Update state
        stateManager.update('ui', {
            sortField: field,
            sortDirection: direction,
            currentPage: 1 // Reset to first page
        });
        
        // Apply filters to re-sort data
        stateManager.applyFilters();
        
        CONFIG.log('debug', 'Table sorted', { field, direction });
    }

    /**
     * Handle search
     * @param {string} searchTerm - Search term
     */
    handleSearch(searchTerm) {
        // Update state
        stateManager.update('ui', {
            searchTerm: searchTerm.trim(),
            currentPage: 1 // Reset to first page
        });
        
        // Apply filters
        stateManager.applyFilters();
        
        CONFIG.log('debug', 'Table search', { searchTerm });
    }

    /**
     * Set up pagination
     */
    setupPagination() {
        this.updatePagination();
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const currentPage = stateManager.get('ui.currentPage');
        const totalPages = stateManager.getTotalPages();
        const filteredData = stateManager.get('data.filtered') || [];
        const itemsPerPage = stateManager.get('ui.itemsPerPage');
        
        // Update pagination text
        if (this.elements.paginationText) {
            const startItem = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
            const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
            
            this.elements.paginationText.textContent = 
                `Showing ${startItem}-${endItem} of ${filteredData.length} entries`;
        }
        
        // Update pagination buttons
        if (this.elements.prevPage) {
            this.elements.prevPage.disabled = currentPage <= 1;
        }
        
        if (this.elements.nextPage) {
            this.elements.nextPage.disabled = currentPage >= totalPages;
        }
        
        // Update page numbers
        this.updatePageNumbers(currentPage, totalPages);
    }

    /**
     * Update page numbers
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     */
    updatePageNumbers(currentPage, totalPages) {
        if (!this.elements.paginationNumbers) return;
        
        const maxVisiblePages = 5;
        const pages = [];
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show subset of pages
            const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        
        const pageButtons = pages.map(page => {
            const isActive = page === currentPage;
            return `
                <button class="page-number ${isActive ? 'active' : ''}" 
                        data-page="${page}"
                        ${isActive ? 'disabled' : ''}>
                    ${page}
                </button>
            `;
        }).join('');
        
        this.elements.paginationNumbers.innerHTML = pageButtons;
        
        // Attach click handlers to page buttons
        this.elements.paginationNumbers.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            });
        });
    }

    /**
     * Go to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        const totalPages = stateManager.getTotalPages();
        
        if (page < 1 || page > totalPages) return;
        
        stateManager.set('ui.currentPage', page);
        
        // Scroll to top of table
        if (this.elements.table) {
            Helpers.scrollTo(this.elements.table, 100);
        }
    }

    /**
     * Go to previous page
     */
    goToPreviousPage() {
        const currentPage = stateManager.get('ui.currentPage');
        this.goToPage(currentPage - 1);
    }

    /**
     * Go to next page
     */
    goToNextPage() {
        const currentPage = stateManager.get('ui.currentPage');
        this.goToPage(currentPage + 1);
    }

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        if (!this.elements.table) return;
        
        const sortField = stateManager.get('ui.sortField');
        const sortDirection = stateManager.get('ui.sortDirection');
        
        // Remove all sort indicators
        const headers = this.elements.table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.classList.remove('sorted', 'sort-asc', 'sort-desc');
            const icon = header.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sort';
            }
        });
        
        // Add indicator to current sort field
        const currentHeader = this.elements.table.querySelector(`th[data-sort="${sortField}"]`);
        if (currentHeader) {
            currentHeader.classList.add('sorted', `sort-${sortDirection}`);
            const icon = currentHeader.querySelector('i');
            if (icon) {
                icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
            }
        }
    }

    /**
     * Check if there are active filters
     * @returns {boolean} True if filters are active
     */
    hasActiveFilters() {
        const filters = stateManager.get('filters');
        
        return filters.dateRange !== 'all' ||
               filters.startDate ||
               filters.endDate ||
               (filters.status && filters.status !== 'all') ||
               (filters.supplier && filters.supplier !== 'all');
    }

    /**
     * Export table data as CSV
     */
    exportCSV() {
        try {
            const data = stateManager.get('data.filtered') || [];
            
            if (data.length === 0) {
                throw new Error('No data to export');
            }
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `inventory_data_${timestamp}.csv`;
            
            Helpers.exportToCSV(data, filename);
            
            // Show success message
            this.showToast(CONFIG.SUCCESS_MESSAGES.EXPORT_COMPLETE, 'success');
            
        } catch (error) {
            CONFIG.log('error', 'Export failed', error);
            this.showToast(CONFIG.ERROR_MESSAGES.EXPORT_ERROR, 'error');
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        // Use the same toast system as filters
        filters.showToast(message, type);
    }

    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Refresh table data
     */
    async refresh() {
        try {
            loader.showTable(this.elements.table, 7);
            
            // Fetch fresh data
            await spreadsheetService.fetchData(false);
            
            // Re-apply filters
            stateManager.applyFilters();
            
            this.showToast(CONFIG.SUCCESS_MESSAGES.DATA_REFRESHED, 'success');
            
        } catch (error) {
            CONFIG.log('error', 'Table refresh failed', error);
            this.showToast(CONFIG.ERROR_MESSAGES.DATA_FETCH_ERROR, 'error');
        } finally {
            loader.hideTable(this.elements.table);
        }
    }

    /**
     * Destroy table component
     */
    destroy() {
        // Clean up event listeners would go here
        this.isInitialized = false;
    }
}

// Create singleton instance
const table = new Table();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = table;
}
