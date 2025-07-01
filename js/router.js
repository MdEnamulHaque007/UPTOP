/**
 * Client-side Router
 * Handles navigation and page routing for the SPA
 */

const Router = {
    // Current route information
    currentRoute: null,
    routes: new Map(),
    
    /**
     * Initialize the router
     */
    init() {
        // Define available routes
        this.defineRoutes();
        
        // Handle initial route
        this.handleInitialRoute();
        
        console.log('Router initialized');
    },
    
    /**
     * Define application routes
     */
    defineRoutes() {
        // Dashboard route
        this.routes.set('dashboard', {
            path: '/dashboard',
            title: 'Dashboard',
            component: 'DashboardPage',
            requiresAuth: true,
            roles: ['admin', 'accounts', 'production', 'export']
        });
        
        // Inventory route
        this.routes.set('inventory', {
            path: '/inventory',
            title: 'Inventory',
            component: 'InventoryPage',
            requiresAuth: true,
            roles: ['admin', 'accounts', 'production', 'export']
        });
        
        // Production route
        this.routes.set('production', {
            path: '/production',
            title: 'Production',
            component: 'ProductionPage',
            requiresAuth: true,
            roles: ['admin', 'production']
        });
        
        // Export route
        this.routes.set('export', {
            path: '/export',
            title: 'Export & Sales',
            component: 'ExportPage',
            requiresAuth: true,
            roles: ['admin', 'accounts', 'export']
        });
        
        // Settings route (admin only)
        this.routes.set('settings', {
            path: '/settings',
            title: 'Settings',
            component: 'SettingsPage',
            requiresAuth: true,
            roles: ['admin']
        });

        // Home route (external navigation)
        this.routes.set('home', {
            path: '/home',
            title: 'Home',
            external: true,
            url: 'index.html',
            requiresAuth: false,
            roles: []
        });

        // Demo routes (external navigation)
        this.routes.set('demo', {
            path: '/demo',
            title: 'Demo Dashboard',
            external: true,
            url: 'inventory-app/demo.html',
            requiresAuth: false,
            roles: []
        });

        this.routes.set('test', {
            path: '/test',
            title: 'Test Connection',
            external: true,
            url: 'inventory-app/test-simple.html',
            requiresAuth: false,
            roles: []
        });

        this.routes.set('legacy-dashboard', {
            path: '/legacy-dashboard',
            title: 'Legacy Dashboard',
            external: true,
            url: 'inventory-app/dashboard.html',
            requiresAuth: false,
            roles: []
        });
    },
    
    /**
     * Handle initial route on page load
     */
    handleInitialRoute() {
        // Get route from URL hash or default to dashboard
        const hash = window.location.hash.slice(1);
        const route = hash || 'dashboard';
        
        // Navigate to the route
        this.navigate(route, false);
    },
    
    /**
     * Navigate to a specific route
     * @param {string} routeName - Name of the route to navigate to
     * @param {boolean} pushState - Whether to push state to browser history
     */
    navigate(routeName, pushState = true) {
        try {
            // Get route configuration
            const route = this.routes.get(routeName);
            
            if (!route) {
                console.error(`Route '${routeName}' not found`);
                this.navigate('dashboard', pushState);
                return;
            }
            
            // Check authentication
            if (route.requiresAuth && !AuthService.isAuthenticated()) {
                console.warn('Authentication required for route:', routeName);
                // Auto-redirect disabled to prevent page reloading
                // window.location.href = 'index.html';
                console.log('Please login first');
                return;
            }
            
            // Check role permissions
            if (route.roles && route.roles.length > 0 && !this.hasPermission(route.roles)) {
                console.warn('Insufficient permissions for route:', routeName);
                this.showAccessDenied();
                return;
            }

            // Handle external routes
            if (route.external && route.url) {
                window.location.href = route.url;
                return;
            }

            // Update browser history
            if (pushState) {
                const url = `#${routeName}`;
                window.history.pushState({ page: routeName }, route.title, url);
            }

            // Update current route
            this.currentRoute = {
                name: routeName,
                ...route
            };

            // Load the page component
            this.loadPage(route);

            // Update active navigation
            this.updateActiveNavigation(routeName);

            // Emit navigation event
            EventEmitter.emit('navigation:change', routeName);

            console.log(`Navigated to: ${routeName}`);
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showError('Navigation failed');
        }
    },
    
    /**
     * Check if current user has permission for route
     * @param {Array} requiredRoles - Array of roles that can access the route
     * @returns {boolean} - Whether user has permission
     */
    hasPermission(requiredRoles) {
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser || !currentUser.role) {
            return false;
        }
        
        return requiredRoles.includes(currentUser.role);
    },
    
    /**
     * Load page component
     * @param {Object} route - Route configuration
     */
    async loadPage(route) {
        try {
            // Show loading state
            this.showLoading(true);
            
            // Get page content container
            const contentContainer = document.getElementById('page-content');
            if (!contentContainer) {
                throw new Error('Page content container not found');
            }
            
            // Clear existing content
            contentContainer.innerHTML = '';
            
            // Load page component based on route
            switch (route.component) {
                case 'DashboardPage':
                    if (typeof DashboardPage !== 'undefined') {
                        await DashboardPage.render(contentContainer);
                    }
                    break;
                    
                case 'InventoryPage':
                    if (typeof InventoryPage !== 'undefined') {
                        await InventoryPage.render(contentContainer);
                    }
                    break;
                    
                case 'ProductionPage':
                    if (typeof ProductionPage !== 'undefined') {
                        await ProductionPage.render(contentContainer);
                    }
                    break;
                    
                case 'ExportPage':
                    if (typeof ExportPage !== 'undefined') {
                        await ExportPage.render(contentContainer);
                    }
                    break;
                    
                case 'SettingsPage':
                    if (typeof SettingsPage !== 'undefined') {
                        await SettingsPage.render(contentContainer);
                    }
                    break;
                    
                default:
                    throw new Error(`Unknown component: ${route.component}`);
            }
            
            // Update page title
            document.title = `${route.title} | ${CONFIG.APP_NAME}`;
            
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showPageError(error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    /**
     * Show loading state
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show = true) {
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    },
    
    /**
     * Show page error
     * @param {string} message - Error message
     */
    showPageError(message) {
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Page Load Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="Router.navigate('dashboard')">
                    <i class="fas fa-home"></i>
                    Go to Dashboard
                </button>
            </div>
        `;
    },
    
    /**
     * Show access denied message
     */
    showAccessDenied() {
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <h3>Access Denied</h3>
                <p>You don't have permission to access this page.</p>
                <button class="btn btn-primary" onclick="Router.navigate('dashboard')">
                    <i class="fas fa-home"></i>
                    Go to Dashboard
                </button>
            </div>
        `;
    },
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, 'error');
        } else {
            console.error(message);
        }
    },
    
    /**
     * Get current route information
     * @returns {Object} - Current route object
     */
    getCurrentRoute() {
        return this.currentRoute;
    },
    
    /**
     * Check if a route exists
     * @param {string} routeName - Name of the route
     * @returns {boolean} - Whether route exists
     */
    routeExists(routeName) {
        return this.routes.has(routeName);
    },
    
    /**
     * Get all available routes for current user
     * @returns {Array} - Array of available routes
     */
    getAvailableRoutes() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];
        
        const availableRoutes = [];
        
        this.routes.forEach((route, name) => {
            if (!route.requiresAuth || this.hasPermission(route.roles)) {
                availableRoutes.push({
                    name,
                    ...route
                });
            }
        });
        
        return availableRoutes;
    },
    
    /**
     * Go back to previous page
     */
    goBack() {
        window.history.back();
    },
    
    /**
     * Go forward to next page
     */
    goForward() {
        window.history.forward();
    },
    
    /**
     * Refresh current page
     */
    refresh() {
        if (this.currentRoute) {
            this.navigate(this.currentRoute.name, false);
        }
    },

    /**
     * Update active navigation state
     * @param {string} routeName - Current route name
     */
    updateActiveNavigation(routeName) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current nav item
        const activeNavLink = document.querySelector(`.nav-link[data-page="${routeName}"]`);
        if (activeNavLink) {
            const navItem = activeNavLink.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    }
};

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Router.init();
    });
} else {
    Router.init();
}

// Handle browser navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && Router.routeExists(hash)) {
        Router.navigate(hash, false);
    }
});
