/**
 * Summary Cards Component
 * Reusable summary cards for displaying key metrics
 */

const SummaryCards = {
    /**
     * Render summary cards
     * @param {HTMLElement} container - Container element
     * @param {Array} cardsData - Array of card data objects
     */
    render(container, cardsData) {
        if (!container || !Array.isArray(cardsData)) return;
        
        container.innerHTML = cardsData.map(card => this.createCardHtml(card)).join('');
    },
    
    /**
     * Create card HTML
     * @param {Object} card - Card data
     * @returns {string} - Card HTML
     */
    createCardHtml(card) {
        const {
            title,
            value,
            icon,
            color = 'primary',
            change,
            changeType = 'positive',
            subtitle
        } = card;
        
        return `
            <div class="summary-card">
                <div class="summary-card-icon ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="summary-card-title">${title}</div>
                <div class="summary-card-value">${value}</div>
                ${subtitle ? `<div class="summary-card-subtitle">${subtitle}</div>` : ''}
                ${change ? `
                    <div class="summary-card-change ${changeType}">
                        <i class="fas ${changeType === 'positive' ? 'fa-arrow-up' : changeType === 'negative' ? 'fa-arrow-down' : 'fa-minus'}"></i>
                        ${change}
                    </div>
                ` : ''}
            </div>
        `;
    }
};
