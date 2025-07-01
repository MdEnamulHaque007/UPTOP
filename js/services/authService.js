/**
 * Authentication Service
 * Handles user authentication, session management, and role-based access control
 */

const AuthService = {
    // Current user session
    currentUser: null,
    sessionTimeout: null,
    
    /**
     * Initialize the authentication service
     */
    async init() {
        try {
            // Check for existing session
            await this.checkExistingSession();
            
            // Set up session timeout
            this.setupSessionTimeout();
            
            console.log('AuthService initialized');
            
        } catch (error) {
            console.error('Failed to initialize AuthService:', error);
        }
    },
    
    /**
     * Check for existing user session
     */
    async checkExistingSession() {
        try {
            const userData = localStorage.getItem(CONFIG.AUTH.STORAGE_KEYS.USER);
            const token = localStorage.getItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN);
            
            if (userData && token) {
                const user = JSON.parse(userData);
                const tokenData = JSON.parse(token);
                
                // Check if token is still valid
                if (this.isTokenValid(tokenData)) {
                    this.currentUser = user;
                    console.log('Existing session found for user:', user.username);
                    return true;
                } else {
                    // Token expired, clear session
                    this.clearSession();
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Error checking existing session:', error);
            this.clearSession();
            return false;
        }
    },
    
    /**
     * User login
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} - User object
     */
    async login(credentials) {
        try {
            const { username, password, role, rememberMe } = credentials;
            
            // Validate input
            if (!username || !password || !role) {
                throw new Error('Please fill in all required fields');
            }
            
            // Authenticate user based on configured method
            let user;
            switch (CONFIG.AUTH.METHOD) {
                case 'local':
                    user = await this.authenticateLocal(username, password, role);
                    break;
                case 'firebase':
                    user = await this.authenticateFirebase(username, password, role);
                    break;
                case 'sheet':
                    user = await this.authenticateSheet(username, password, role);
                    break;
                default:
                    throw new Error('Invalid authentication method configured');
            }
            
            // Create session
            await this.createSession(user, rememberMe);
            
            // Emit login event
            EventEmitter.emit('auth:login', user);
            
            console.log('User logged in successfully:', user.username);
            return user;
            
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },
    
    /**
     * Local authentication (using default users)
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} role - User role
     * @returns {Promise<Object>} - User object
     */
    async authenticateLocal(username, password, role) {
        // Find user in default users
        const user = CONFIG.AUTH.DEFAULT_USERS.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );
        
        if (!user) {
            throw new Error('Invalid username, password, or role');
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            loginTime: new Date().toISOString()
        };
    },
    
    /**
     * Firebase authentication
     * @param {string} username - Username/Email
     * @param {string} password - Password
     * @param {string} role - User role
     * @returns {Promise<Object>} - User object
     */
    async authenticateFirebase(username, password, role) {
        // TODO: Implement Firebase authentication
        // This would integrate with Firebase Auth SDK
        throw new Error('Firebase authentication not implemented yet');
    },
    
    /**
     * Google Sheets authentication
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} role - User role
     * @returns {Promise<Object>} - User object
     */
    async authenticateSheet(username, password, role) {
        try {
            // Fetch users from Google Sheets
            const users = await SpreadsheetService.getSheetData(CONFIG.GOOGLE_SHEETS.SHEETS.USERS);
            
            // Find matching user
            const user = users.find(u => 
                u.username === username && 
                u.password === password && 
                u.role === role &&
                u.active === 'true'
            );
            
            if (!user) {
                throw new Error('Invalid credentials or inactive account');
            }
            
            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                loginTime: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Sheet authentication failed:', error);
            throw new Error('Authentication failed. Please try again.');
        }
    },
    
    /**
     * Create user session
     * @param {Object} user - User object
     * @param {boolean} rememberMe - Whether to remember the session
     */
    async createSession(user, rememberMe = false) {
        try {
            // Create token
            const token = {
                value: this.generateToken(),
                expiresAt: new Date(Date.now() + CONFIG.AUTH.SESSION_TIMEOUT).toISOString(),
                rememberMe
            };
            
            // Store session data
            localStorage.setItem(CONFIG.AUTH.STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN, JSON.stringify(token));
            
            if (rememberMe) {
                localStorage.setItem(CONFIG.AUTH.STORAGE_KEYS.REMEMBER_ME, 'true');
            }
            
            // Set current user
            this.currentUser = user;
            
            // Setup session timeout
            this.setupSessionTimeout();
            
        } catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    },
    
    /**
     * User signup (for local authentication)
     * @param {Object} userData - New user data
     * @returns {Promise<Object>} - Created user object
     */
    async signup(userData) {
        try {
            const { username, password, role, name, email } = userData;

            // Validate input
            if (!username || !password || !role || !name || !email) {
                throw new Error('All fields are required for signup');
            }

            // Check if user already exists
            const existingUser = CONFIG.AUTH.DEFAULT_USERS.find(u =>
                u.username === username || u.email === email
            );

            if (existingUser) {
                throw new Error('Username or email already exists');
            }

            // Validate role
            if (!CONFIG.ROLES[role]) {
                throw new Error('Invalid role selected');
            }

            // Create new user object
            const newUser = {
                username,
                password,
                role,
                name,
                email,
                createdAt: new Date().toISOString()
            };

            // In a real application, you would save this to a database
            // For now, we'll just add it to the config (temporary)
            CONFIG.AUTH.DEFAULT_USERS.push(newUser);

            console.log('New user created:', { username, role, name, email });

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;

        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    },

    /**
     * User logout
     */
    async logout() {
        try {
            // Clear session
            this.clearSession();
            
            // Emit logout event
            EventEmitter.emit('auth:logout');
            
            console.log('User logged out successfully');
            
        } catch (error) {
            console.error('Logout failed:', error);
        }
    },
    
    /**
     * Clear user session
     */
    clearSession() {
        // Clear storage
        localStorage.removeItem(CONFIG.AUTH.STORAGE_KEYS.USER);
        localStorage.removeItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.AUTH.STORAGE_KEYS.REMEMBER_ME);
        
        // Clear current user
        this.currentUser = null;
        
        // Clear session timeout
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    },
    
    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        if (!this.currentUser) {
            return false;
        }
        
        const token = localStorage.getItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN);
        if (!token) {
            return false;
        }
        
        try {
            const tokenData = JSON.parse(token);
            return this.isTokenValid(tokenData);
        } catch {
            return false;
        }
    },
    
    /**
     * Get current user
     * @returns {Object|null} - Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    },
    
    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether user has permission
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }
        
        const roleConfig = CONFIG.ROLES[this.currentUser.role];
        if (!roleConfig) {
            return false;
        }
        
        return roleConfig.permissions.includes(permission);
    },
    
    /**
     * Check if user has access to specific page
     * @param {string} page - Page to check
     * @returns {boolean} - Whether user has access
     */
    hasPageAccess(page) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }
        
        const roleConfig = CONFIG.ROLES[this.currentUser.role];
        if (!roleConfig) {
            return false;
        }
        
        return roleConfig.pages.includes(page);
    },
    
    /**
     * Generate authentication token
     * @returns {string} - Generated token
     */
    generateToken() {
        return btoa(Date.now() + Math.random().toString(36).substr(2, 9));
    },
    
    /**
     * Check if token is valid
     * @param {Object} tokenData - Token data object
     * @returns {boolean} - Whether token is valid
     */
    isTokenValid(tokenData) {
        if (!tokenData || !tokenData.expiresAt) {
            return false;
        }
        
        const expirationTime = new Date(tokenData.expiresAt).getTime();
        const currentTime = Date.now();
        
        return currentTime < expirationTime;
    },
    
    /**
     * Setup session timeout
     */
    setupSessionTimeout() {
        // Clear existing timeout
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        // Set new timeout
        this.sessionTimeout = setTimeout(() => {
            console.log('Session expired');
            this.logout();
        }, CONFIG.AUTH.SESSION_TIMEOUT);
    },
    
    /**
     * Refresh session (extend timeout)
     */
    refreshSession() {
        if (this.isAuthenticated()) {
            const token = JSON.parse(localStorage.getItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN));
            token.expiresAt = new Date(Date.now() + CONFIG.AUTH.SESSION_TIMEOUT).toISOString();
            localStorage.setItem(CONFIG.AUTH.STORAGE_KEYS.TOKEN, JSON.stringify(token));
            
            this.setupSessionTimeout();
        }
    },
    
    /**
     * Get user role configuration
     * @returns {Object|null} - Role configuration
     */
    getUserRoleConfig() {
        if (!this.currentUser || !this.currentUser.role) {
            return null;
        }
        
        return CONFIG.ROLES[this.currentUser.role] || null;
    }
};

// Auto-refresh session on user activity
let activityTimer;
document.addEventListener('click', () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (AuthService.isAuthenticated()) {
            AuthService.refreshSession();
        }
    }, 1000);
});

document.addEventListener('keypress', () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (AuthService.isAuthenticated()) {
            AuthService.refreshSession();
        }
    }, 1000);
});
