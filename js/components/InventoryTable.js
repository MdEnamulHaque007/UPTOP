/**
 * Inventory Table Component
 * Reusable table component for displaying inventory data
 */

const InventoryTable = {
    /**
     * Render table
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Table options
     */
    render(container, options = {}) {
        const {
            data = [],
            columns = [],
            searchable = true,
            sortable = true,
            paginated = true,
            pageSize = 25
        } = options;
        
        if (!container) return;
        
        container.innerHTML = this.createTableHtml(data, columns, options);
        
        if (searchable) this.attachSearchHandler(container);
        if (sortable) this.attachSortHandlers(container);
        if (paginated) this.attachPaginationHandlers(container);
    },
    
    /**
     * Create table HTML
     * @param {Array} data - Table data
     * @param {Array} columns - Column definitions
     * @param {Object} options - Table options
     * @returns {string} - Table HTML
     */
    createTableHtml(data, columns, options) {
        return `
            ${options.searchable ? this.createSearchHtml() : ''}
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            ${columns.map(col => `
                                <th ${options.sortable ? `class="sortable" data-field="${col.field}"` : ''}>
                                    ${col.title}
                                    ${options.sortable ? '<i class="fas fa-sort"></i>' : ''}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.createRowsHtml(data, columns)}
                    </tbody>
                </table>
            </div>
            ${options.paginated ? this.createPaginationHtml(data.length, options.pageSize) : ''}
        `;
    },
    
    /**
     * Create search HTML
     * @returns {string} - Search HTML
     */
    createSearchHtml() {
        return `
            <div class="table-search">
                <input type="text" placeholder="Search..." class="search-input">
                <i class="fas fa-search"></i>
            </div>
        `;
    },
    
    /**
     * Create rows HTML
     * @param {Array} data - Row data
     * @param {Array} columns - Column definitions
     * @returns {string} - Rows HTML
     */
    createRowsHtml(data, columns) {
        return data.map(row => `
            <tr>
                ${columns.map(col => `
                    <td>${this.formatCellValue(row[col.field], col)}</td>
                `).join('')}
            </tr>
        `).join('');
    },
    
    /**
     * Format cell value
     * @param {*} value - Cell value
     * @param {Object} column - Column definition
     * @returns {string} - Formatted value
     */
    formatCellValue(value, column) {
        if (column.formatter) {
            return column.formatter(value);
        }
        
        switch (column.type) {
            case 'currency':
                return Formatters.currency(value);
            case 'date':
                return Formatters.date(value);
            case 'number':
                return Formatters.number(value);
            case 'status':
                return Formatters.statusBadge(value);
            default:
                return value || '';
        }
    },
    
    /**
     * Create pagination HTML
     * @param {number} totalItems - Total number of items
     * @param {number} pageSize - Items per page
     * @returns {string} - Pagination HTML
     */
    createPaginationHtml(totalItems, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize);
        
        return `
            <div class="pagination">
                <button class="pagination-btn" data-page="prev" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="pagination-info">Page 1 of ${totalPages}</span>
                <button class="pagination-btn" data-page="next" ${totalPages <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    },
    
    /**
     * Attach search handler
     * @param {HTMLElement} container - Container element
     */
    attachSearchHandler(container) {
        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce((e) => {
                this.handleSearch(e.target.value, container);
            }, 300));
        }
    },
    
    /**
     * Attach sort handlers
     * @param {HTMLElement} container - Container element
     */
    attachSortHandlers(container) {
        const sortableHeaders = container.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.handleSort(header.dataset.field, container);
            });
        });
    },
    
    /**
     * Attach pagination handlers
     * @param {HTMLElement} container - Container element
     */
    attachPaginationHandlers(container) {
        const paginationBtns = container.querySelectorAll('.pagination-btn');
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handlePagination(btn.dataset.page, container);
            });
        });
    },
    
    /**
     * Handle search
     * @param {string} query - Search query
     * @param {HTMLElement} container - Container element
     */
    handleSearch(query, container) {
        // Emit search event
        EventEmitter.emit('table:search', { query, container });
    },
    
    /**
     * Handle sort
     * @param {string} field - Field to sort by
     * @param {HTMLElement} container - Container element
     */
    handleSort(field, container) {
        // Emit sort event
        EventEmitter.emit('table:sort', { field, container });
    },
    
    /**
     * Handle pagination
     * @param {string} action - Pagination action
     * @param {HTMLElement} container - Container element
     */
    handlePagination(action, container) {
        // Emit pagination event
        EventEmitter.emit('table:paginate', { action, container });
    }
};
