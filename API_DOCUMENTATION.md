# 📚 API Documentation

This document provides detailed information about the internal APIs and architecture of the Shoe Manufacturing Inventory Management System.

## 🏗️ Architecture Overview

The application follows a modular, component-based architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business     │    │      Data       │
│     Layer       │    │     Logic       │    │     Layer       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Pages         │    │ • Services      │    │ • Google Sheets │
│ • Components    │    │ • State Mgmt    │    │ • Local Cache   │
│ • Router        │    │ • Event System  │    │ • Local Storage │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Core Services

### AuthService

Handles user authentication and session management.

#### Methods

```javascript
// Initialize authentication service
await AuthService.init()

// User login
const user = await AuthService.login({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    rememberMe: true
})

// Check authentication status
const isAuthenticated = AuthService.isAuthenticated()

// Get current user
const currentUser = AuthService.getCurrentUser()

// Check permissions
const hasPermission = AuthService.hasPermission('write')
const hasPageAccess = AuthService.hasPageAccess('production')

// Logout
await AuthService.logout()
```

#### Events Emitted
- `auth:login` - User successfully logged in
- `auth:logout` - User logged out
- `auth:session-expired` - Session expired

### SpreadsheetService

Manages data fetching from Google Sheets.

#### Methods

```javascript
// Initialize service
SpreadsheetService.init()

// Fetch data from specific sheet
const data = await SpreadsheetService.getSheetData('Purchase Orders')

// Refresh all data
const allData = await SpreadsheetService.refreshData()

// Get dashboard data (aggregated)
const dashboardData = await SpreadsheetService.getDashboardData()

// Get last fetch time
const lastFetch = SpreadsheetService.getLastFetchTime()
```

#### Configuration Options

```javascript
GOOGLE_SHEETS: {
    SHEET_ID: 'your-sheet-id',
    OPENSHEET_URL: 'https://opensheet.elk.sh',
    API_KEY: 'your-api-key', // Optional
    REFRESH_INTERVAL: 300000, // 5 minutes
    CACHE_DURATION: 600000 // 10 minutes
}
```

### DataCache

Provides caching functionality for improved performance.

#### Methods

```javascript
// Initialize cache
DataCache.init()

// Store data
DataCache.set('key', data, ttl)

// Retrieve data
const data = DataCache.get('key')

// Check if key exists
const exists = DataCache.has('key')

// Delete data
DataCache.delete('key')

// Clear all cache
DataCache.clear()

// Get cache statistics
const stats = DataCache.getStats()
```

## 🎯 State Management

### State Structure

```javascript
{
    user: {
        currentUser: Object|null,
        isAuthenticated: boolean,
        permissions: Array,
        role: string|null
    },
    app: {
        isLoading: boolean,
        currentPage: string|null,
        sidebarCollapsed: boolean,
        theme: string
    },
    data: {
        purchaseOrders: Array,
        production: Array,
        finishedGoods: Array,
        issues: Array,
        bgradeSales: Array,
        lastUpdated: Date|null,
        isRefreshing: boolean
    },
    ui: {
        modals: Object,
        toasts: Array,
        filters: Object,
        pagination: Object,
        sorting: Object
    }
}
```

### State Methods

```javascript
// Get state
const currentState = State.get()
const userState = State.get('user')

// Set state
State.set('user.currentUser', userObject)

// Update state (merge)
State.update('ui.filters', { search: 'new term' })

// Subscribe to changes
const unsubscribe = State.subscribe('user', (newValue, oldValue) => {
    console.log('User state changed:', newValue)
})

// Reset state
State.reset('ui.filters')
```

## 📡 Event System

### EventEmitter

Central event system for component communication.

#### Methods

```javascript
// Add event listener
const unsubscribe = EventEmitter.on('data:updated', (data) => {
    console.log('Data updated:', data)
})

// One-time listener
EventEmitter.once('app:ready', () => {
    console.log('App is ready')
})

// Emit event
EventEmitter.emit('custom:event', data)

// Remove listener
EventEmitter.off('data:updated', callback)

// Remove all listeners
EventEmitter.removeAllListeners('data:updated')
```

#### Built-in Events

```javascript
// Authentication Events
'auth:login'           // User logged in
'auth:logout'          // User logged out
'auth:session-expired' // Session expired

// Data Events
'data:updated'         // Data refreshed
'data:error'           // Data fetch error
'data:refresh-start'   // Refresh started
'data:refresh-complete' // Refresh completed

// Navigation Events
'navigation:change'    // Page changed
'sidebar:toggle'       // Sidebar toggled

// UI Events
'search:perform'       // Search executed
'table:sort'           // Table sorted
'table:paginate'       // Table paginated
'modal:show'           // Modal shown
'modal:hide'           // Modal hidden
```

## 🧩 Component APIs

### Modal Component

```javascript
// Show modal
const modalId = Modal.show({
    title: 'Confirm Action',
    content: '<p>Are you sure?</p>',
    size: 'medium', // small, medium, large
    closable: true,
    backdrop: true,
    keyboard: true,
    buttons: [
        {
            text: 'Cancel',
            class: 'btn-secondary',
            action: 'close'
        },
        {
            text: 'Confirm',
            class: 'btn-primary',
            handler: (modalId) => {
                // Custom action
                Modal.hide(modalId)
            }
        }
    ]
})

// Hide modal
Modal.hide(modalId)
```

### Toast Notifications

```javascript
// Show toast
const toastId = Toast.show('Success message', 'success', 5000)

// Toast types: 'success', 'error', 'warning', 'info'
Toast.show('Error occurred', 'error')
Toast.show('Warning message', 'warning')
Toast.show('Information', 'info')

// Hide toast
Toast.hide(toastId)
```

### InventoryTable Component

```javascript
// Render table
InventoryTable.render(container, {
    data: arrayOfObjects,
    columns: [
        {
            field: 'product_code',
            title: 'Product Code',
            type: 'text'
        },
        {
            field: 'price',
            title: 'Price',
            type: 'currency',
            formatter: (value) => Formatters.currency(value)
        }
    ],
    searchable: true,
    sortable: true,
    paginated: true,
    pageSize: 25
})
```

### ChartSection Component

```javascript
// Create line chart
const chart = ChartSection.createLineChart('canvas-id', {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
        label: 'Sales',
        data: [100, 200, 150],
        borderColor: '#2563eb'
    }]
})

// Update chart
ChartSection.updateChart('canvas-id', newData)

// Destroy chart
ChartSection.destroyChart('canvas-id')
```

## 🛠️ Utility Functions

### Formatters

```javascript
// Currency formatting
Formatters.currency(1234.56) // "$1,234.56"

// Date formatting
Formatters.date(new Date()) // "12/25/2024"
Formatters.datetime(new Date()) // "12/25/2024 3:30 PM"
Formatters.relativeTime(date) // "2 hours ago"

// Number formatting
Formatters.number(1234.567, 2) // "1,234.57"
Formatters.percentage(0.75) // "75%"

// Status badges
Formatters.statusBadge('active') // HTML badge
Formatters.priority('high') // Priority indicator
```

### Validators

```javascript
// Email validation
const result = Validators.email('user@example.com')
// { isValid: true, message: '' }

// Form validation
const validation = Validators.validateForm(formData, {
    email: [
        { type: 'required' },
        { type: 'email' }
    ],
    password: [
        { type: 'required' },
        { type: 'password', params: [{ minLength: 8 }] }
    ]
})
```

### Helpers

```javascript
// Debounce function
const debouncedFn = Helpers.debounce(callback, 300)

// Deep clone object
const cloned = Helpers.deepClone(originalObject)

// Generate unique ID
const id = Helpers.generateId('prefix')

// Array utilities
const sum = Helpers.sum(array, 'field')
const grouped = Helpers.groupBy(array, 'category')
const filtered = Helpers.filterBySearch(array, 'search term')
```

## 🔌 Extension Points

### Adding Custom Pages

1. **Create Page Component**
```javascript
// js/pages/customPage.js
const CustomPage = {
    async render(container) {
        container.innerHTML = '<h1>Custom Page</h1>'
    }
}
```

2. **Register Route**
```javascript
// In js/router.js
this.routes.set('custom', {
    path: '/custom',
    title: 'Custom Page',
    component: 'CustomPage',
    requiresAuth: true,
    roles: ['admin']
})
```

3. **Add Navigation**
```javascript
// Update navigation in dashboard.html
<li class="nav-item">
    <a href="#custom" class="nav-link" data-page="custom">
        <i class="fas fa-custom-icon"></i>
        <span>Custom Page</span>
    </a>
</li>
```

### Custom Data Sources

```javascript
// Extend SpreadsheetService
const CustomDataService = {
    async fetchCustomData() {
        // Custom data fetching logic
        const response = await fetch('/api/custom-data')
        return response.json()
    }
}
```

### Custom Authentication

```javascript
// Extend AuthService
const CustomAuthService = {
    async authenticateCustom(credentials) {
        // Custom authentication logic
        const response = await fetch('/api/auth', {
            method: 'POST',
            body: JSON.stringify(credentials)
        })
        return response.json()
    }
}
```

## 🔍 Debugging

### Debug Mode

Enable debug mode in configuration:
```javascript
DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug',
    SHOW_PERFORMANCE: true
}
```

### Console Commands

```javascript
// Access global objects in browser console
State.get() // Current state
EventEmitter.getStats() // Event statistics
DataCache.getStats() // Cache statistics
AuthService.getCurrentUser() // Current user
```

### Performance Monitoring

```javascript
// Monitor component render times
console.time('ComponentRender')
await Component.render(container)
console.timeEnd('ComponentRender')

// Monitor data fetch times
console.time('DataFetch')
const data = await SpreadsheetService.getSheetData('sheet')
console.timeEnd('DataFetch')
```

## 📝 Best Practices

### Error Handling

```javascript
try {
    const data = await SpreadsheetService.getSheetData('sheet')
    // Process data
} catch (error) {
    console.error('Data fetch failed:', error)
    Toast.show('Failed to load data', 'error')
}
```

### Memory Management

```javascript
// Clean up event listeners
const unsubscribe = EventEmitter.on('event', callback)
// Later...
unsubscribe()

// Destroy charts when not needed
ChartSection.destroyChart('chart-id')

// Clear cache when appropriate
DataCache.clear()
```

### Performance Optimization

```javascript
// Use debouncing for search
const debouncedSearch = Helpers.debounce(searchFunction, 300)

// Cache expensive operations
const cachedData = DataCache.get('expensive-operation')
if (!cachedData) {
    const result = expensiveOperation()
    DataCache.set('expensive-operation', result, 3600000) // 1 hour
}
```
