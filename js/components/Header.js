/**
 * Header Component
 * Application header with navigation, user info, and controls
 */

const Header = {
    // Component state
    isInitialized: false,
    currentUser: null,
    
    /**
     * Initialize the header component
     */
    init() {
        try {
            this.render();
            this.attachEventListeners();
            this.isInitialized = true;
            
            console.log('Header component initialized');
            
        } catch (error) {
            console.error('Failed to initialize Header component:', error);
        }
    },
    
    /**
     * Render the header component
     */
    render() {
        const headerElement = document.getElementById('app-header');
        if (!headerElement) return;
        
        const user = AuthService.getCurrentUser();
        const roleConfig = user ? CONFIG.ROLES[user.role] : null;
        
        headerElement.innerHTML = `
            <div class="header-container">
                <div class="header-left">
                    <button id="sidebar-toggle" class="btn btn-secondary btn-sm">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <div class="header-brand">
                        <img src="assets/images/logo.png" alt="Logo" class="header-logo">
                        <div class="brand-text">
                            <h1>${CONFIG.APP_NAME}</h1>
                            <span class="brand-subtitle">Inventory Management</span>
                        </div>
                    </div>
                </div>
                
                <div class="header-center">
                    <div class="search-container">
                        <input type="text" id="global-search" placeholder="Search inventory..." class="search-input">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                </div>
                
                <div class="header-right">
                    <div class="header-actions">
                        <button id="refresh-btn" class="btn btn-secondary btn-sm" title="Refresh Data">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        
                        <button id="notifications-btn" class="btn btn-secondary btn-sm" title="Notifications">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge hidden">0</span>
                        </button>
                        
                        <div class="user-menu">
                            <button id="user-menu-btn" class="user-menu-btn">
                                <div class="user-avatar" style="background-color: ${roleConfig?.color || '#64748b'}">
                                    ${user ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div class="user-info">
                                    <span class="user-name">${user ? user.name : 'Guest'}</span>
                                    <span class="user-role">${roleConfig ? roleConfig.name : 'Unknown'}</span>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            
                            <div id="user-dropdown" class="user-dropdown hidden">
                                <div class="dropdown-header">
                                    <div class="user-avatar-large" style="background-color: ${roleConfig?.color || '#64748b'}">
                                        ${user ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div class="user-details">
                                        <div class="user-name">${user ? user.name : 'Guest'}</div>
                                        <div class="user-email">${user ? user.email : ''}</div>
                                        <div class="user-role-badge" style="background-color: ${roleConfig?.color || '#64748b'}">
                                            ${roleConfig ? roleConfig.name : 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="dropdown-menu">
                                    <a href="#" class="dropdown-item" data-action="profile">
                                        <i class="fas fa-user"></i>
                                        Profile
                                    </a>
                                    <a href="#" class="dropdown-item" data-action="settings">
                                        <i class="fas fa-cog"></i>
                                        Settings
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" class="dropdown-item" data-action="help">
                                        <i class="fas fa-question-circle"></i>
                                        Help & Support
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" class="dropdown-item text-error" data-action="logout">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Logout
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add header styles
        this.addStyles();
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
            
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
        
        // User menu
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    this.closeUserMenu();
                }
            });
        }
        
        // Dropdown menu actions
        const dropdownItems = document.querySelectorAll('.dropdown-item[data-action]');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.getAttribute('data-action');
                this.handleUserAction(action);
            });
        });
        
        // Listen for auth events
        EventEmitter.on('auth:login', (user) => {
            this.updateUser(user);
        });
        
        EventEmitter.on('auth:logout', () => {
            this.updateUser(null);
        });
        
        // Listen for data events
        EventEmitter.on('data:updated', () => {
            this.updateRefreshButton(false);
        });
        
        EventEmitter.on('data:refresh-start', () => {
            this.updateRefreshButton(true);
        });
    },
    
    /**
     * Update user information in header
     * @param {Object} user - User object
     */
    updateUser(user) {
        this.currentUser = user;
        if (this.isInitialized) {
            this.render();
            this.attachEventListeners();
        }
    },
    
    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const contentWrapper = document.querySelector('.content-wrapper');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            
            if (contentWrapper) {
                contentWrapper.classList.toggle('sidebar-collapsed');
            }
            
            // Update state
            const isCollapsed = sidebar.classList.contains('collapsed');
            State.set('app.sidebarCollapsed', isCollapsed);
            
            // Emit event
            EventEmitter.emit('sidebar:toggle', isCollapsed);
        }
    },
    
    /**
     * Handle global search input
     * @param {string} query - Search query
     */
    handleGlobalSearch(query) {
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.performSearch(query);
            }
        }, 300);
    },
    
    /**
     * Perform search
     * @param {string} query - Search query
     */
    performSearch(query) {
        // Update state
        State.set('ui.filters.searchTerm', query);
        
        // Emit search event
        EventEmitter.emit('search:perform', query);
        
        console.log('Performing search:', query);
    },
    
    /**
     * Refresh data
     */
    async refreshData() {
        try {
            this.updateRefreshButton(true);
            EventEmitter.emit('data:refresh-start');
            
            await SpreadsheetService.refreshData();
            
            // Show success message
            if (typeof Toast !== 'undefined') {
                Toast.show('Data refreshed successfully', 'success');
            }
            
        } catch (error) {
            console.error('Failed to refresh data:', error);
            
            if (typeof Toast !== 'undefined') {
                Toast.show('Failed to refresh data', 'error');
            }
        } finally {
            this.updateRefreshButton(false);
        }
    },
    
    /**
     * Update refresh button state
     * @param {boolean} isLoading - Whether data is loading
     */
    updateRefreshButton(isLoading) {
        const refreshBtn = document.getElementById('refresh-btn');
        if (!refreshBtn) return;
        
        const icon = refreshBtn.querySelector('i');
        if (icon) {
            if (isLoading) {
                icon.classList.add('fa-spin');
                refreshBtn.disabled = true;
            } else {
                icon.classList.remove('fa-spin');
                refreshBtn.disabled = false;
            }
        }
    },
    
    /**
     * Show notifications
     */
    showNotifications() {
        // TODO: Implement notifications modal
        console.log('Show notifications');
        
        if (typeof Toast !== 'undefined') {
            Toast.show('Notifications feature coming soon', 'info');
        }
    },
    
    /**
     * Toggle user menu dropdown
     */
    toggleUserMenu() {
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    },
    
    /**
     * Close user menu dropdown
     */
    closeUserMenu() {
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
    },
    
    /**
     * Handle user menu actions
     * @param {string} action - Action to perform
     */
    handleUserAction(action) {
        this.closeUserMenu();
        
        switch (action) {
            case 'profile':
                this.showProfile();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'logout':
                this.logout();
                break;
            default:
                console.warn('Unknown user action:', action);
        }
    },
    
    /**
     * Show user profile
     */
    showProfile() {
        // TODO: Implement profile modal
        console.log('Show profile');
        
        if (typeof Toast !== 'undefined') {
            Toast.show('Profile feature coming soon', 'info');
        }
    },
    
    /**
     * Show settings
     */
    showSettings() {
        Router.navigate('settings');
    },
    
    /**
     * Show help
     */
    showHelp() {
        // TODO: Implement help modal
        console.log('Show help');
        
        if (typeof Toast !== 'undefined') {
            Toast.show('Help feature coming soon', 'info');
        }
    },
    
    /**
     * Logout user
     */
    async logout() {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    },
    
    /**
     * Add component styles
     */
    addStyles() {
        if (document.getElementById('header-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'header-styles';
        styles.textContent = `
            .header-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 var(--spacing-6);
                height: 64px;
                background-color: var(--white);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: var(--spacing-4);
            }
            
            .header-brand {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .header-logo {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-lg);
            }
            
            .brand-text h1 {
                font-size: var(--font-size-lg);
                font-weight: 600;
                color: var(--gray-900);
                margin: 0;
            }
            
            .brand-subtitle {
                font-size: var(--font-size-xs);
                color: var(--gray-500);
            }
            
            .header-center {
                flex: 1;
                max-width: 400px;
                margin: 0 var(--spacing-6);
            }
            
            .search-container {
                position: relative;
            }
            
            .search-input {
                width: 100%;
                padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-10);
                border: 1px solid var(--gray-300);
                border-radius: var(--radius-lg);
                font-size: var(--font-size-sm);
            }
            
            .search-icon {
                position: absolute;
                left: var(--spacing-3);
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
            }
            
            .header-right {
                display: flex;
                align-items: center;
            }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .notification-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background-color: var(--error-color);
                color: var(--white);
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
            }
            
            .user-menu {
                position: relative;
            }
            
            .user-menu-btn {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                padding: var(--spacing-2);
                background: none;
                border: none;
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: background-color var(--transition-fast);
            }
            
            .user-menu-btn:hover {
                background-color: var(--gray-100);
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white);
                font-weight: 600;
                font-size: var(--font-size-sm);
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .user-name {
                font-size: var(--font-size-sm);
                font-weight: 500;
                color: var(--gray-900);
            }
            
            .user-role {
                font-size: var(--font-size-xs);
                color: var(--gray-500);
            }
            
            .user-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: var(--spacing-2);
                background-color: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                min-width: 250px;
                z-index: var(--z-dropdown);
            }
            
            .dropdown-header {
                padding: var(--spacing-4);
                border-bottom: 1px solid var(--gray-200);
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .user-avatar-large {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white);
                font-weight: 600;
                font-size: var(--font-size-lg);
            }
            
            .user-details {
                flex: 1;
            }
            
            .user-details .user-name {
                font-size: var(--font-size-base);
                font-weight: 600;
                color: var(--gray-900);
                margin-bottom: var(--spacing-1);
            }
            
            .user-details .user-email {
                font-size: var(--font-size-sm);
                color: var(--gray-600);
                margin-bottom: var(--spacing-2);
            }
            
            .user-role-badge {
                display: inline-block;
                padding: var(--spacing-1) var(--spacing-2);
                font-size: var(--font-size-xs);
                color: var(--white);
                border-radius: var(--radius-sm);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .dropdown-menu {
                padding: var(--spacing-2);
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                padding: var(--spacing-3);
                color: var(--gray-700);
                text-decoration: none;
                border-radius: var(--radius-md);
                transition: background-color var(--transition-fast);
            }
            
            .dropdown-item:hover {
                background-color: var(--gray-100);
                text-decoration: none;
            }
            
            .dropdown-item.text-error {
                color: var(--error-color);
            }
            
            .dropdown-divider {
                height: 1px;
                background-color: var(--gray-200);
                margin: var(--spacing-2) 0;
            }
            
            @media (max-width: 768px) {
                .header-center {
                    display: none;
                }
                
                .brand-text {
                    display: none;
                }
                
                .user-info {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
};
