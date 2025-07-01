/**
 * Modal Component
 * Reusable modal dialog component
 */

const Modal = {
    // Active modals
    activeModals: new Map(),
    
    /**
     * Show modal
     * @param {Object} options - Modal options
     * @returns {string} - Modal ID
     */
    show(options = {}) {
        const defaults = {
            title: 'Modal',
            content: '',
            size: 'medium', // small, medium, large
            closable: true,
            backdrop: true,
            keyboard: true,
            buttons: []
        };
        
        const config = { ...defaults, ...options };
        const modalId = Helpers.generateId('modal');
        
        // Create modal HTML
        const modalHtml = this.createModalHtml(modalId, config);
        
        // Add to DOM
        const container = document.getElementById('modal-container') || document.body;
        container.insertAdjacentHTML('beforeend', modalHtml);
        
        // Store modal config
        this.activeModals.set(modalId, config);
        
        // Show modal
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            const backdrop = modal.querySelector('.modal-backdrop');
            
            backdrop.classList.add('show');
            modal.querySelector('.modal').classList.add('show');
        }, 10);
        
        // Attach event listeners
        this.attachEventListeners(modalId, config);
        
        return modalId;
    },
    
    /**
     * Hide modal
     * @param {string} modalId - Modal ID
     */
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const backdrop = modal.querySelector('.modal-backdrop');
        const modalElement = modal.querySelector('.modal');
        
        backdrop.classList.remove('show');
        modalElement.classList.remove('show');
        
        setTimeout(() => {
            modal.remove();
            this.activeModals.delete(modalId);
        }, 300);
    },
    
    /**
     * Create modal HTML
     * @param {string} modalId - Modal ID
     * @param {Object} config - Modal configuration
     * @returns {string} - Modal HTML
     */
    createModalHtml(modalId, config) {
        const sizeClass = `modal-${config.size}`;
        
        const buttonsHtml = config.buttons.map(button => {
            const btnClass = button.class || 'btn-secondary';
            const btnId = button.id || Helpers.generateId('btn');
            return `<button id="${btnId}" class="btn ${btnClass}" data-action="${button.action || 'close'}">${button.text}</button>`;
        }).join('');
        
        return `
            <div id="${modalId}" class="modal-container">
                <div class="modal-backdrop"></div>
                <div class="modal ${sizeClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${config.title}</h3>
                        ${config.closable ? '<button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${config.content}
                    </div>
                    ${config.buttons.length > 0 ? `<div class="modal-footer">${buttonsHtml}</div>` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * Attach event listeners to modal
     * @param {string} modalId - Modal ID
     * @param {Object} config - Modal configuration
     */
    attachEventListeners(modalId, config) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Close button
        const closeBtn = modal.querySelector('[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(modalId));
        }
        
        // Backdrop click
        if (config.backdrop) {
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop.addEventListener('click', () => this.hide(modalId));
        }
        
        // Keyboard events
        if (config.keyboard) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hide(modalId);
                }
            });
        }
        
        // Custom button actions
        config.buttons.forEach(button => {
            if (button.id && button.handler) {
                const btnElement = modal.querySelector(`#${button.id}`);
                if (btnElement) {
                    btnElement.addEventListener('click', () => {
                        button.handler(modalId);
                    });
                }
            }
        });
    }
};

// Toast notification system
const Toast = {
    container: null,
    toasts: [],
    
    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    show(message, type = 'info', duration = CONFIG.TOAST.DURATION) {
        if (!this.container) {
            this.createContainer();
        }
        
        const toastId = Helpers.generateId('toast');
        const toastHtml = this.createToastHtml(toastId, message, type);
        
        this.container.insertAdjacentHTML('beforeend', toastHtml);
        
        // Show toast
        setTimeout(() => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.classList.add('show');
            }
        }, 10);
        
        // Auto hide
        setTimeout(() => {
            this.hide(toastId);
        }, duration);
        
        // Attach close handler
        const toast = document.getElementById(toastId);
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(toastId));
        }
        
        return toastId;
    },
    
    /**
     * Hide toast
     * @param {string} toastId - Toast ID
     */
    hide(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;
        
        toast.classList.remove('show');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    },
    
    /**
     * Create toast container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    /**
     * Create toast HTML
     * @param {string} toastId - Toast ID
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {string} - Toast HTML
     */
    createToastHtml(toastId, message, type) {
        const icons = {
            success: 'fa-check',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation',
            info: 'fa-info'
        };
        
        const icon = icons[type] || icons.info;
        
        return `
            <div id="${toastId}" class="toast">
                <div class="toast-icon ${type}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
};

// Export for global use
if (typeof window !== 'undefined') {
    window.Modal = Modal;
    window.Toast = Toast;
}
