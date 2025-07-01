# 📊 Dynamic Inventory Dashboard

A comprehensive, real-time dashboard that fetches data from Google Sheets and displays interactive visualizations for shoe manufacturing inventory management.

## 🚀 Quick Start

### **Option 1: Demo Page**
Open `demo.html` to see an overview and launch the dashboard.

### **Option 2: Direct Access**
Open `dashboard.html` directly to access the full dashboard.

### **Option 3: Test Connection**
Open `test-simple.html` to verify your Google Sheets connection first.

## ✨ Features

### 📈 **Interactive Charts**
- **Trend Analysis**: Line/bar charts showing order trends over time
- **Status Distribution**: Doughnut/pie charts showing order status breakdown
- **Supplier Performance**: Horizontal bar chart of top suppliers
- **Value Distribution**: Line chart showing value trends over time
- **Chart Type Toggle**: Switch between different chart types dynamically

### 🔍 **Advanced Filtering**
- **Date Range Filters**: Today, This Week, This Month, This Quarter, This Year, Custom Range
- **Status Filtering**: Filter by order status (pending, completed, cancelled, etc.)
- **Supplier Filtering**: Filter by specific suppliers
- **Real-time Search**: Search across all table data with debounced input
- **Filter Persistence**: Maintains filter state during session

### 📊 **KPI Dashboard**
- **Total Orders**: Count of all orders in filtered dataset
- **Total Quantity**: Sum of all quantities
- **Total Value**: Sum of all order values with currency formatting
- **Average Order Value**: Calculated average with trend indicators
- **Change Indicators**: Visual arrows showing positive/negative changes

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets for mobile devices
- **Adaptive Layout**: Grid layouts that adjust to screen size
- **Modern UI**: Clean, professional interface with smooth animations

### ⚡ **Real-time Data Management**
- **Live Data Fetching**: Connects to Google Sheets via OpenSheet API
- **Smart Caching**: 5-minute cache with fallback to stale data
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Retry Logic**: Automatic retry on network failures
- **Loading States**: Beautiful loading indicators and skeleton screens

## 🛠️ Technical Architecture

### **Frontend Stack**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ with classes, async/await, and modules
- **Chart.js**: Interactive charts and visualizations
- **Font Awesome**: Professional icons
- **Google Fonts**: Inter font family for modern typography

### **Data Layer**
- **Google Sheets**: Data source via OpenSheet API
- **Caching**: In-memory caching with localStorage fallback
- **Data Processing**: Automatic data cleaning and validation
- **Real-time Updates**: Refresh capability with loading states

### **Modular Structure**
```
js/
├── dashboard.js          # Main dashboard controller
├── gs-data-service.js    # Google Sheets data service
└── utils.js              # Utility functions
```

## 📋 Google Sheets Configuration

### **Current Configuration**
- **Sheet ID**: `1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc`
- **Sheet Name**: `PO`
- **Range**: `A:N` (columns A through N)
- **API URL**: `https://opensheet.elk.sh/1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc/PO`

### **Expected Data Structure**
Your Google Sheet should have these columns:

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | po_number | Text | Purchase Order Number |
| B | date | Date | Order Date (YYYY-MM-DD format) |
| C | supplier | Text | Supplier Name |
| D | quantity | Number | Order Quantity |
| E | unit_price | Number | Price per Unit |
| F | total_value | Number | Total Order Value |
| G | status | Text | Order Status (pending, completed, cancelled) |
| H-N | Additional | Any | Optional additional fields |

### **Sample Data**
```
po_number | date       | supplier    | quantity | unit_price | total_value | status
PO001     | 2024-01-15 | ABC Shoes   | 100      | 25.50      | 2550.00     | completed
PO002     | 2024-01-16 | XYZ Leather | 50       | 45.00      | 2250.00     | pending
PO003     | 2024-01-17 | DEF Soles   | 200      | 12.75      | 2550.00     | completed
```

## 🎮 User Interface Guide

### **Dashboard Layout**
1. **Header**: Logo, title, and action buttons (Refresh, Export, Fullscreen)
2. **Status Bar**: System messages and notifications
3. **Controls**: Date range, status, and supplier filters
4. **KPI Cards**: Key performance indicators with trend arrows
5. **Charts Grid**: Four interactive chart panels
6. **Data Table**: Paginated table with search and sorting

### **Interactive Elements**
- **Chart Type Buttons**: Click to switch between line, bar, pie charts
- **Filter Controls**: Dropdowns and date pickers for data filtering
- **Table Headers**: Click to sort columns (ascending/descending)
- **Pagination**: Navigate through large datasets
- **Search Box**: Real-time search across all data fields

### **Keyboard Shortcuts**
- **Ctrl+R**: Refresh data from Google Sheets
- **Ctrl+E**: Export filtered data to CSV
- **F11**: Toggle fullscreen mode
- **Escape**: Clear search (when search box is focused)

## 🔧 Customization

### **Change Google Sheet**
Edit the configuration in `js/gs-data-service.js`:
```javascript
this.config = {
    sheetId: 'your-new-sheet-id',
    sheetName: 'your-sheet-name',
    baseUrl: 'https://opensheet.elk.sh'
};
```

### **Modify Colors**
Update the color palette in `js/dashboard.js`:
```javascript
this.colors = {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    // ... add your colors
};
```

### **Customize Charts**
Modify chart configurations in the `init*Chart()` methods:
```javascript
initTrendChart() {
    // Customize chart options, colors, and behavior
}
```

### **Add New KPIs**
Extend the `updateKPIs()` method:
```javascript
updateKPIs() {
    // Add your custom calculations
    const customMetric = this.calculateCustomMetric(this.filteredData);
    this.updateElement('custom-metric', customMetric);
}
```

## 📊 Performance Optimization

### **Data Caching**
- **5-minute cache**: Reduces API calls and improves performance
- **Stale data fallback**: Shows cached data if fresh fetch fails
- **Smart refresh**: Only fetches new data when explicitly requested

### **Chart Performance**
- **Lazy loading**: Charts initialize only when needed
- **Data aggregation**: Large datasets are grouped and summarized
- **Update optimization**: Only updates changed chart data

### **Responsive Performance**
- **CSS Grid**: Efficient layouts that adapt to screen size
- **Debounced search**: Prevents excessive filtering on rapid input
- **Pagination**: Limits DOM elements for large datasets

## 🔒 Security & Privacy

### **Data Access**
- **Read-only**: Dashboard only reads data, never writes
- **Public sheets**: Requires publicly accessible Google Sheets
- **No authentication**: Uses OpenSheet API without API keys
- **Client-side**: All processing happens in the browser

### **Best Practices**
- **HTTPS only**: Ensure your hosting uses HTTPS
- **Data validation**: All input data is validated and sanitized
- **Error handling**: Graceful handling of network and data errors

## 🚀 Deployment

### **Local Development**
1. Clone/download the files
2. Open `dashboard.html` in a modern browser
3. Ensure your Google Sheet is publicly accessible

### **Web Hosting**
1. Upload all files to your web server
2. Ensure HTTPS is enabled
3. Test the Google Sheets connection
4. Configure any CDN or caching as needed

### **Performance Tips**
- **Use a CDN**: Host static assets on a CDN for faster loading
- **Enable compression**: Use gzip compression on your server
- **Cache headers**: Set appropriate cache headers for static files
- **Monitor usage**: Track API usage to avoid rate limits

## 🐛 Troubleshooting

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Dashboard not loading | Check browser console for errors |
| No data displayed | Verify Google Sheet is public and accessible |
| Charts not rendering | Ensure Chart.js CDN is loading properly |
| Slow performance | Check network connection and data size |
| Mobile layout issues | Test on actual devices, not just browser resize |

### **Debug Mode**
Open browser console and check:
```javascript
// Check dashboard status
console.log(dashboard.getStatus());

// Check data service status
console.log(gsDataService.getStatus());

// Test connection manually
gsDataService.testConnection().then(console.log);
```

## 📞 Support

### **Browser Requirements**
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### **Feature Requests**
The modular architecture makes it easy to add new features:
- Additional chart types
- More filter options
- Custom KPI calculations
- Data export formats
- Integration with other data sources

## 🧪 Testing & Quality Assurance

### **Comprehensive Test Suite**
Use `dashboard-test.html` to verify all functionality:

#### **Test Categories**
1. **Connection Tests**: Google Sheets API, service status, error handling
2. **UI Feature Tests**: Toast notifications, modals, data panels, keyboard shortcuts
3. **Data Processing Tests**: Data fetching, filtering, export, caching
4. **Chart Tests**: Rendering, interactions, type switching, responsiveness
5. **Performance Tests**: Load time, memory usage, large datasets, mobile performance
6. **Accessibility Tests**: Keyboard navigation, screen reader support, color contrast

#### **Running Tests**
```bash
# Open test suite
open dashboard-test.html

# Run individual tests or all tests
# Generate detailed test reports
# Monitor performance metrics
```

### **Quality Metrics**
- **Load Time**: < 3 seconds on average connection
- **Memory Usage**: < 50MB for typical datasets
- **Mobile Performance**: Optimized for touch devices
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## 🚀 Production Deployment

### **Pre-deployment Checklist**
- [ ] Test Google Sheets connection
- [ ] Verify all charts render correctly
- [ ] Test on mobile devices
- [ ] Check keyboard navigation
- [ ] Validate data export functionality
- [ ] Test error handling scenarios
- [ ] Verify performance metrics

### **Deployment Steps**
1. **Upload Files**: Upload all files to your web server
2. **Configure HTTPS**: Ensure SSL certificate is installed
3. **Test Connection**: Verify Google Sheets API access
4. **Monitor Performance**: Set up monitoring for load times
5. **User Training**: Provide user guide and keyboard shortcuts

### **Monitoring & Maintenance**
- **Data Freshness**: Monitor cache expiration and refresh rates
- **Error Tracking**: Log and monitor API failures
- **Performance Metrics**: Track load times and user interactions
- **User Feedback**: Collect feedback for continuous improvement

## 📊 Advanced Features

### **Custom KPI Calculations**
Add custom metrics by extending the `updateKPIs()` method:
```javascript
updateKPIs() {
    // Standard KPIs
    const totalOrders = this.filteredData.length;

    // Custom KPI example
    const avgDeliveryTime = this.calculateAverageDeliveryTime();
    this.updateElement('avg-delivery-time', avgDeliveryTime);
}
```

### **Additional Chart Types**
Extend chart functionality:
```javascript
initCustomChart() {
    // Add radar charts, scatter plots, etc.
    this.charts.custom = new Chart(ctx, {
        type: 'radar',
        data: { /* custom data */ },
        options: { /* custom options */ }
    });
}
```

### **Real-time Updates**
Implement auto-refresh:
```javascript
// Auto-refresh every 5 minutes
setInterval(() => {
    if (document.visibilityState === 'visible') {
        this.refreshData();
    }
}, 5 * 60 * 1000);
```

### **Data Validation**
Add custom validation rules:
```javascript
validateData(data) {
    return data.filter(item => {
        // Custom validation logic
        return item.total_value > 0 && item.quantity > 0;
    });
}
```

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Charts not loading** | Empty chart containers | Check Chart.js CDN, verify data format |
| **Data not updating** | Stale data displayed | Clear cache, check Google Sheets permissions |
| **Mobile layout broken** | Overlapping elements | Test CSS media queries, check viewport meta tag |
| **Export not working** | CSV download fails | Check browser permissions, verify data format |
| **Slow performance** | Long load times | Optimize data size, check network connection |

### **Debug Commands**
```javascript
// Check dashboard status
console.log(dashboard.getStatus());

// Test data service
console.log(gsDataService.getStatus());

// Force refresh
dashboard.refreshData();

// Reset dashboard
dashboard.reset();

// Export debug info
console.log(dashboard.exportState());
```

### **Browser Console Errors**
- **CORS Errors**: Use proper web server, not file:// protocol
- **Chart.js Errors**: Verify CDN loading, check data format
- **API Errors**: Check Google Sheets permissions and sheet structure

## 📈 Performance Optimization

### **Data Optimization**
- **Pagination**: Limit displayed rows for large datasets
- **Lazy Loading**: Load charts only when visible
- **Data Aggregation**: Pre-calculate summary statistics
- **Efficient Filtering**: Use indexed searches for large datasets

### **UI Optimization**
- **CSS Grid**: Efficient responsive layouts
- **Debounced Inputs**: Prevent excessive API calls
- **Virtual Scrolling**: Handle large tables efficiently
- **Image Optimization**: Compress and optimize assets

### **Network Optimization**
- **CDN Usage**: Use CDN for external libraries
- **Compression**: Enable gzip compression
- **Caching**: Set appropriate cache headers
- **Minification**: Minify CSS and JavaScript

## 🔒 Security Best Practices

### **Data Security**
- **Read-Only Access**: Dashboard only reads data, never writes
- **Public Sheets**: Ensure only necessary data is public
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Use proper HTML escaping

### **API Security**
- **Rate Limiting**: Respect API rate limits
- **Error Handling**: Don't expose sensitive error details
- **HTTPS Only**: Always use secure connections
- **Access Logging**: Monitor API access patterns

## 📞 Support & Resources

### **Documentation**
- **User Guide**: Complete feature documentation
- **API Reference**: Google Sheets API documentation
- **Chart.js Docs**: Chart configuration reference
- **CSS Grid Guide**: Layout system documentation

### **Community Resources**
- **GitHub Issues**: Report bugs and feature requests
- **Stack Overflow**: Community support and solutions
- **Chart.js Community**: Chart-specific help and examples
- **Google Sheets API**: Official API documentation

### **Professional Support**
- **Custom Development**: Additional features and integrations
- **Performance Optimization**: Advanced performance tuning
- **Training**: User training and best practices
- **Maintenance**: Ongoing support and updates

---

## 🎉 **Dashboard Complete!**

Your dynamic inventory dashboard is now fully functional with:

✅ **Real-time Google Sheets integration**
✅ **Interactive Chart.js visualizations**
✅ **Advanced filtering and search**
✅ **Responsive mobile-first design**
✅ **Professional UI with animations**
✅ **Comprehensive error handling**
✅ **Toast notifications and modals**
✅ **Keyboard shortcuts and accessibility**
✅ **CSV export functionality**
✅ **Performance optimization**
✅ **Complete test suite**
✅ **Production-ready deployment**

**Ready to use!** Your dynamic dashboard is configured and ready to display beautiful, interactive visualizations of your Google Sheets inventory data.
