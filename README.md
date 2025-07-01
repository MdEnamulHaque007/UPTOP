# Shoe Manufacturing Inventory Management Web App

A modern, scalable web application for managing shoe manufacturing inventory with Google Sheets integration.

## 🚀 Features

- **Inventory Management**: Purchase Orders, Production, Finished Goods, Issues, B-Grade Sales
- **Dashboard**: Interactive charts and real-time analytics
- **Google Sheets Integration**: Fetch data via OpenSheet or Sheets API
- **Role-based Access**: Admin, Accounts, Production, Export roles
- **Responsive Design**: Mobile and desktop optimized
- **Authentication**: Firebase or local storage options

## 📁 Project Structure

```
project-root/
│
├── index.html                     # Main HTML entry point
├── dashboard.html                 # Dashboard view
│
├── /assets/
│   ├── /css/
│   │   ├── main.css               # Global styles
│   │   ├── dashboard.css          # Dashboard-specific styling
│   │   └── components.css         # Shared UI components
│   └── /images/                   # Logos, icons, etc.
│
├── /js/
│   ├── app.js                     # Entry point: initializes the app
│   ├── config.js                  # Configuration & constants
│   ├── router.js                  # Handle routing/view switching
│   │
│   ├── /services/
│   │   ├── spreadsheetService.js  # Google Sheet data fetching
│   │   ├── authService.js         # Authentication logic
│   │   └── dataCache.js           # Caching & fallback logic
│   │
│   ├── /state/
│   │   ├── state.js               # Central state store
│   │   └── events.js              # Event emitter (pub-sub)
│   │
│   ├── /components/
│   │   ├── Header.js              # Navigation component
│   │   ├── SummaryCards.js        # Dashboard summary cards
│   │   ├── InventoryTable.js      # Reusable table component
│   │   ├── ChartSection.js        # Chart.js wrapper
│   │   └── Modal.js               # Modal component
│   │
│   └── /pages/
│       ├── dashboardPage.js       # Dashboard view logic
│       ├── productionPage.js      # Production management
│       ├── inventoryPage.js       # Inventory overview
│       └── exportPage.js          # Export & B-Grade sales
│
└── /utils/
    ├── formatters.js             # Data formatting utilities
    ├── validators.js             # Form validation
    └── helpers.js                # Generic helper functions
```

## 🛠️ Setup Instructions

1. Clone or download the project
2. Configure Google Sheets API in `js/config.js`
3. Set up authentication method (Firebase/local)
4. Open `index.html` in a modern browser
5. Login with appropriate role credentials

## 🔧 Configuration

Edit `js/config.js` to customize:
- Google Sheets URL/API settings
- Role permissions
- Chart configurations
- Cache settings

## 📊 Supported Data Types

- Purchase Orders
- Production Records
- Finished Goods Inventory
- Issue Tracking
- B-Grade Sales

## 🎯 Role Permissions

- **Admin**: Full access to all modules
- **Accounts**: Financial data and reports
- **Production**: Manufacturing and inventory
- **Export**: Finished goods and sales

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Mobile Support

Fully responsive design optimized for tablets and smartphones.

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Google Sheets with your inventory data
- Basic understanding of JavaScript (for customization)

### Installation

1. **Download or Clone the Project**
   ```bash
   git clone <repository-url>
   cd shoe-manufacturing-inventory
   ```

2. **Configure Google Sheets Integration**

   Edit `js/config.js` and update the following:
   ```javascript
   GOOGLE_SHEETS: {
       SHEET_ID: 'your-google-sheet-id-here',
       // For OpenSheet (no API key required)
       OPENSHEET_URL: 'https://opensheet.elk.sh',

       // OR for Google Sheets API (requires API key)
       API_KEY: 'your-google-sheets-api-key',
   }
   ```

3. **Set Up Your Google Sheet**

   Create a Google Sheet with the following tabs:
   - `Purchase Orders` - Columns: po_number, supplier, date, total_amount, status
   - `Production` - Columns: batch_number, product_code, quantity, date, value, status
   - `Finished Goods` - Columns: product_code, quantity, unit_price, total_value, date, status
   - `Issues` - Columns: issue_type, description, date, reported_by, status
   - `B-Grade Sales` - Columns: product_code, quantity, sale_price, sale_amount, date, customer

4. **Configure Authentication**

   Choose your authentication method in `js/config.js`:
   ```javascript
   AUTH: {
       METHOD: 'local', // 'local', 'firebase', or 'sheet'
       // ... other auth settings
   }
   ```

5. **Open the Application**

   Open `index.html` in your web browser or serve it using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

6. **Login**

   Use the default credentials (for local authentication):
   - **Admin**: username: `admin`, password: `admin123`, role: `admin`
   - **Accounts**: username: `accounts`, password: `acc123`, role: `accounts`
   - **Production**: username: `production`, password: `prod123`, role: `production`
   - **Export**: username: `export`, password: `exp123`, role: `export`

## 📊 Features Overview

### Dashboard
- **Summary Cards**: Key metrics at a glance
- **Interactive Charts**: Monthly trends and inventory status
- **Recent Activity**: Latest transactions and updates
- **Real-time Data**: Auto-refresh capabilities

### Inventory Management
- **Multi-category View**: Finished goods, production items, issues
- **Advanced Filtering**: Search, category, and status filters
- **Data Export**: Export inventory data in various formats
- **Responsive Tables**: Sortable and paginated data views

### Production Tracking
- **Batch Management**: Track production batches from start to finish
- **Status Monitoring**: Real-time production status updates
- **Value Tracking**: Monitor production costs and values
- **Performance Metrics**: Production efficiency indicators

### Export & Sales
- **Finished Goods Management**: Ready-to-export inventory
- **B-Grade Sales Tracking**: Discounted item sales management
- **Revenue Analytics**: Sales performance metrics
- **Customer Management**: Track sales by customer

## 🔧 Customization

### Adding New Data Types

1. **Update Google Sheets Configuration**
   ```javascript
   // In js/config.js
   GOOGLE_SHEETS: {
       SHEETS: {
           // Add your new sheet
           NEW_DATA_TYPE: 'Your Sheet Name'
       }
   }
   ```

2. **Add Validation Rules**
   ```javascript
   // In js/config.js
   VALIDATION: {
       REQUIRED_FIELDS: {
           NEW_DATA_TYPE: ['field1', 'field2', 'field3']
       }
   }
   ```

3. **Create Page Component**
   ```javascript
   // Create js/pages/newDataTypePage.js
   const NewDataTypePage = {
       async render(container) {
           // Implementation
       }
   };
   ```

### Customizing Themes

Edit CSS variables in `assets/css/main.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... other variables */
}
```

### Adding New User Roles

1. **Define Role in Configuration**
   ```javascript
   // In js/config.js
   ROLES: {
       new_role: {
           name: 'New Role',
           permissions: ['read', 'write'],
           pages: ['dashboard', 'inventory'],
           color: '#color-code'
       }
   }
   ```

2. **Add Default User**
   ```javascript
   // In js/config.js
   AUTH: {
       DEFAULT_USERS: [
           {
               username: 'newrole',
               password: 'password',
               role: 'new_role',
               name: 'New Role User',
               email: 'newrole@company.com'
           }
       ]
   }
   ```

## 🔒 Security Considerations

- **Authentication**: Implement proper authentication for production use
- **Data Validation**: All user inputs are validated client-side and should be validated server-side
- **HTTPS**: Always use HTTPS in production
- **API Keys**: Keep Google Sheets API keys secure and use environment variables
- **Access Control**: Role-based access control is implemented but should be enforced server-side

## 🐛 Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check Google Sheets ID in configuration
   - Verify sheet names match configuration
   - Ensure sheets are publicly accessible (for OpenSheet) or API key is valid

2. **Authentication Issues**
   - Verify user credentials in configuration
   - Check browser console for error messages
   - Clear browser cache and localStorage

3. **Charts Not Displaying**
   - Ensure Chart.js library is loaded
   - Check browser console for JavaScript errors
   - Verify data format matches chart requirements

4. **Mobile Display Issues**
   - Check viewport meta tag in HTML
   - Verify responsive CSS is loaded
   - Test on different screen sizes

### Debug Mode

Enable debug mode in `js/config.js`:
```javascript
DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug',
    SHOW_PERFORMANCE: true
}
```

## 📈 Performance Optimization

- **Data Caching**: Automatic caching with configurable TTL
- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Optimized search with debouncing
- **Pagination**: Large datasets are paginated for better performance
- **Image Optimization**: Compress images for faster loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@shoemanufacturing.com
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- Font Awesome for icons
- Google Sheets for data storage
- OpenSheet for easy API access
