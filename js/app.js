/**
 * Main Application Entry Point
 * Initializes and manages the Shoe Manufacturing Inventory Management System
 */

const App = {
    // Application state
    isInitialized: false,
    currentUser: null,
    currentPage: null,
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Shoe Manufacturing Inventory App...');
            
            // Check if already initialized
            if (this.isInitialized) {
                console.warn('App already initialized');
                return;
            }
            
            // Initialize core services
            await this.initializeServices();
            
            // Check authentication status
            await this.checkAuthentication();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('App initialization complete');
            
            // Emit app ready event
            EventEmitter.emit('app:ready');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    },
    
    /**
     * Initialize core services
     */
    async initializeServices() {
        try {
            // Initialize state management
            if (typeof State !== 'undefined') {
                State.init();
            }
            
            // Initialize event system
            if (typeof EventEmitter !== 'undefined') {
                EventEmitter.init();
            }
            
            // Initialize authentication service
            if (typeof AuthService !== 'undefined') {
                await AuthService.init();
            }
            
            // Initialize data cache
            if (typeof DataCache !== 'undefined') {
                DataCache.init();
            }
            
            // Initialize spreadsheet service
            if (typeof SpreadsheetService !== 'undefined') {
                SpreadsheetService.init();
            }
            
            console.log('Core services initialized');
            
        } catch (error) {
            console.error('Failed to initialize services:', error);
            throw error;
        }
    },
    
    /**
     * Check authentication status and redirect if necessary
     */
    async checkAuthentication() {
        try {
            const isAuthenticated = AuthService.isAuthenticated();
            const currentPath = window.location.pathname;
            
            if (isAuthenticated) {
                // User is authenticated
                this.currentUser = AuthService.getCurrentUser();
                
                // If on login page, redirect to dashboard (DISABLED to prevent auto-reload)
                // if (currentPath.includes('index.html') || currentPath === '/') {
                //     window.location.href = 'dashboard.html';
                //     return;
                // }
                
                // Update UI for authenticated user
                this.updateAuthenticatedUI();
                
            } else {
                // User is not authenticated
                this.currentUser = null;
                
                // If not on login page, redirect to login (DISABLED to prevent auto-reload)
                // if (!currentPath.includes('index.html') && currentPath !== '/') {
                //     window.location.href = 'index.html';
                //     return;
                // }
                
                // Update UI for unauthenticated user
                this.updateUnauthenticatedUI();
            }
            
        } catch (error) {
            console.error('Authentication check failed:', error);
            // On error, redirect to login (DISABLED to prevent auto-reload)
            // window.location.href = 'index.html';
        }
    },
    
    /**
     * Initialize global event listeners
     */
    initializeEventListeners() {
        // Authentication events
        EventEmitter.on('auth:login', (user) => {
            this.currentUser = user;
            this.updateAuthenticatedUI();
            // Auto-redirect disabled to prevent page reloading
            // window.location.href = 'dashboard.html';
            console.log('Login successful! Navigate manually to dashboard.html');
        });
        
        EventEmitter.on('auth:logout', () => {
            this.currentUser = null;
            this.updateUnauthenticatedUI();
            // Auto-redirect disabled to prevent page reloading
            // window.location.href = 'index.html';
            console.log('Logout successful! Navigate manually to index.html');
        });
        
        // Data events
        EventEmitter.on('data:updated', (data) => {
            this.handleDataUpdate(data);
        });
        
        EventEmitter.on('data:error', (error) => {
            this.showError('Failed to load data: ' + error.message);
        });
        
        // Navigation events
        EventEmitter.on('navigation:change', (page) => {
            this.currentPage = page;
            this.updatePageUI(page);
        });
        
        // Error events
        EventEmitter.on('error', (error) => {
            this.showError(error.message || 'An unexpected error occurred');
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                Router.navigate(event.state.page, false);
            }
        });
        
        console.log('Event listeners initialized');
    },
    
    /**
     * Initialize UI components
     */
    initializeComponents() {
        try {
            // Initialize login form if present
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                this.initializeLoginForm();
            }
            
            // Initialize header component if present
            const header = document.getElementById('app-header');
            if (header && typeof Header !== 'undefined') {
                Header.init();
            }
            
            // Initialize sidebar navigation if present
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                this.initializeSidebar();
            }
            
            // Initialize refresh button if present
            const refreshBtn = document.getElementById('refresh-data');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.refreshData();
                });
            }
            
            console.log('UI components initialized');
            
        } catch (error) {
            console.error('Failed to initialize components:', error);
        }
    },
    
    /**
     * Initialize login form
     */
    initializeLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const credentials = {
                username: formData.get('username'),
                password: formData.get('password'),
                role: formData.get('role'),
                rememberMe: formData.get('remember-me') === 'on'
            };
            
            try {
                this.showLoading(true);
                await AuthService.login(credentials);
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.showLoading(false);
            }
        });
    },
    
    /**
     * Initialize sidebar navigation
     */
    initializeSidebar() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                Router.navigate(page);
            });
        });
    },
    
    /**
     * Update UI for authenticated user
     */
    updateAuthenticatedUI() {
        // Hide login container
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            loginContainer.classList.add('hidden');
        }
        
        // Show app container
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
        
        // Update header with user info
        if (typeof Header !== 'undefined') {
            Header.updateUser(this.currentUser);
        }
        
        // Update navigation based on user role
        this.updateNavigationForRole(this.currentUser.role);
    },
    
    /**
     * Update UI for unauthenticated user
     */
    updateUnauthenticatedUI() {
        // Show login container
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            loginContainer.classList.remove('hidden');
        }
        
        // Hide app container
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.add('hidden');
        }
    },
    
    /**
     * Update navigation based on user role
     */
    updateNavigationForRole(role) {
        const roleConfig = CONFIG.ROLES[role];
        if (!roleConfig) return;
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link[data-page]');
            if (link) {
                const page = link.getAttribute('data-page');
                if (roleConfig.pages.includes(page)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    },
    
    /**
     * Update page UI
     */
    updatePageUI(page) {
        // Update active navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link[data-page]');
            if (link && link.getAttribute('data-page') === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update page title
        const pageTitle = this.getPageTitle(page);
        document.title = `${pageTitle} | ${CONFIG.APP_NAME}`;
    },
    
    /**
     * Get page title
     */
    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            inventory: 'Inventory',
            production: 'Production',
            export: 'Export & Sales',
            settings: 'Settings'
        };
        return titles[page] || 'Dashboard';
    },
    
    /**
     * Handle data updates
     */
    handleDataUpdate(data) {
        // Emit event for components to update
        EventEmitter.emit('ui:refresh', data);
    },
    
    /**
     * Refresh data from source
     */
    async refreshData() {
        try {
            this.showLoading(true);
            await SpreadsheetService.refreshData();
            this.showSuccess('Data refreshed successfully');
        } catch (error) {
            this.showError('Failed to refresh data: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    /**
     * Show loading state
     */
    showLoading(show = true) {
        const spinner = document.getElementById('loading-spinner') || 
                      document.getElementById('loading-overlay');
        
        if (spinner) {
            if (show) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    },
    
    /**
     * Show error message
     */
    showError(message) {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, 'error');
        } else {
            // Fallback to alert
            alert('Error: ' + message);
        }
    },
    
    /**
     * Show success message
     */
    showSuccess(message) {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, 'success');
        } else {
            console.log('Success: ' + message);
        }
    },
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Clear any intervals or timeouts
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Clear event listeners
        EventEmitter.removeAllListeners();
        
        console.log('App cleanup complete');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}
