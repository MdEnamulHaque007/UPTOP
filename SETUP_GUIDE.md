# 🚀 Complete Setup Guide

This guide will walk you through setting up the Shoe Manufacturing Inventory Management System from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:
- A modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- A Google account for Google Sheets integration
- Basic understanding of web technologies (HTML, CSS, JavaScript)
- A text editor or IDE for customization

## 🗂️ Step 1: Prepare Your Google Sheets

### 1.1 Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Shoe Manufacturing Inventory"

### 1.2 Set Up Required Tabs

Create the following tabs with these exact column headers:

#### Purchase Orders Tab
| po_number | supplier | date | total_amount | status | description |
|-----------|----------|------|--------------|--------|-------------|
| PO001 | ABC Supplier | 2024-01-15 | 5000 | active | Sample PO |

#### Production Tab
| batch_number | product_code | quantity | date | value | status | start_date | end_date |
|--------------|--------------|----------|------|-------|--------|------------|----------|
| BATCH001 | SHOE001 | 100 | 2024-01-16 | 3000 | active | 2024-01-16 | 2024-01-20 |

#### Finished Goods Tab
| product_code | description | quantity | unit_price | total_value | date | status |
|--------------|-------------|----------|------------|-------------|------|--------|
| SHOE001 | Running Shoe | 50 | 60 | 3000 | 2024-01-20 | active |

#### Issues Tab
| issue_type | description | date | reported_by | status | priority |
|------------|-------------|------|-------------|--------|----------|
| Quality | Defective sole | 2024-01-18 | John Doe | open | high |

#### B-Grade Sales Tab
| product_code | quantity | original_price | sale_price | sale_amount | date | customer |
|--------------|----------|----------------|------------|-------------|------|----------|
| SHOE001 | 5 | 60 | 40 | 200 | 2024-01-19 | Outlet Store |

### 1.3 Make Sheet Publicly Accessible (for OpenSheet)

1. Click "Share" button in top-right corner
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)

## 🔧 Step 2: Configure the Application

### 2.1 Download the Project Files

1. Download all project files to a folder on your computer
2. Ensure the folder structure matches the documentation

### 2.2 Update Configuration

Edit `js/config.js`:

```javascript
// Replace with your Google Sheet ID
SHEET_ID: 'your-google-sheet-id-here',

// Choose authentication method
AUTH: {
    METHOD: 'local', // Start with 'local' for testing
}
```

### 2.3 Add Your Logo (Optional)

1. Add your logo as `assets/images/logo.png` (64x64px recommended)
2. Add favicon as `assets/images/favicon.ico`

## 🌐 Step 3: Run the Application

### Option A: Simple File Opening
1. Double-click `index.html` to open in your browser
2. Note: Some features may not work due to CORS restrictions

### Option B: Local Web Server (Recommended)

#### Using Python:
```bash
cd your-project-folder
python -m http.server 8000
```
Then open: http://localhost:8000

#### Using Node.js:
```bash
cd your-project-folder
npx serve .
```

#### Using PHP:
```bash
cd your-project-folder
php -S localhost:8000
```

## 🔐 Step 4: Test Login

Use these default credentials:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin | admin123 | Full access |
| Accounts | accounts | acc123 | Financial data |
| Production | production | prod123 | Production data |
| Export | export | exp123 | Export/sales data |

## ✅ Step 5: Verify Everything Works

### 5.1 Test Data Loading
1. Login with admin credentials
2. Navigate to Dashboard
3. Verify data appears in summary cards and charts
4. Check that recent activity shows your sample data

### 5.2 Test Navigation
1. Click through all menu items (Dashboard, Inventory, Production, Export)
2. Verify each page loads without errors
3. Test search and filter functionality

### 5.3 Test Responsive Design
1. Resize browser window
2. Test on mobile device or use browser dev tools
3. Verify all elements are accessible and readable

## 🎨 Step 6: Customization

### 6.1 Update Branding
1. Replace logo files in `assets/images/`
2. Update company name in `js/config.js`:
   ```javascript
   APP_NAME: 'Your Company Inventory'
   ```

### 6.2 Customize Colors
Edit CSS variables in `assets/css/main.css`:
```css
:root {
    --primary-color: #your-brand-color;
    --secondary-color: #your-secondary-color;
}
```

### 6.3 Add More Users
Update `js/config.js`:
```javascript
AUTH: {
    DEFAULT_USERS: [
        // Add your users here
        {
            username: 'newuser',
            password: 'password123',
            role: 'accounts',
            name: 'New User',
            email: 'newuser@company.com'
        }
    ]
}
```

## 🔒 Step 7: Security Setup (Production)

### 7.1 Change Default Passwords
- Update all default passwords in configuration
- Use strong, unique passwords

### 7.2 Implement Proper Authentication
- Consider Firebase Auth for production
- Set up proper user management system

### 7.3 Secure API Keys
- Use environment variables for API keys
- Restrict Google Sheets API key to your domain

### 7.4 Enable HTTPS
- Use HTTPS in production
- Configure proper SSL certificates

## 📊 Step 8: Add Real Data

### 8.1 Import Existing Data
1. Export your current inventory data to CSV
2. Import into the appropriate Google Sheets tabs
3. Ensure column headers match exactly

### 8.2 Set Up Data Entry Process
1. Train users on Google Sheets data entry
2. Set up data validation rules in Google Sheets
3. Create templates for consistent data entry

## 🚀 Step 9: Deployment

### 9.1 Web Hosting Options
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Easy deployment with form handling
- **Vercel**: Fast deployment with serverless functions
- **Traditional Web Hosting**: Upload files via FTP

### 9.2 Domain Setup
1. Purchase a domain name
2. Configure DNS settings
3. Set up SSL certificate

## 📈 Step 10: Monitoring and Maintenance

### 10.1 Set Up Analytics
- Add Google Analytics for usage tracking
- Monitor user behavior and popular features

### 10.2 Regular Backups
- Backup Google Sheets data regularly
- Export application configuration

### 10.3 Updates and Maintenance
- Keep dependencies updated
- Monitor for security updates
- Regular testing of all features

## 🆘 Troubleshooting

### Common Issues and Solutions

#### Data Not Loading
- **Check Google Sheets ID**: Ensure it's correct in config
- **Verify Sheet Names**: Must match exactly (case-sensitive)
- **Check Permissions**: Sheet must be publicly accessible for OpenSheet

#### Login Issues
- **Clear Browser Cache**: Clear localStorage and cookies
- **Check Credentials**: Verify username/password/role combination
- **Browser Console**: Check for JavaScript errors

#### Charts Not Displaying
- **Internet Connection**: Chart.js loads from CDN
- **Data Format**: Ensure data has required fields
- **Browser Compatibility**: Use supported browser version

#### Mobile Display Issues
- **Viewport Meta Tag**: Ensure it's present in HTML
- **CSS Loading**: Verify all CSS files load correctly
- **Touch Events**: Test touch interactions on actual devices

### Getting Help

1. **Check Browser Console**: Look for error messages
2. **Review Configuration**: Double-check all settings
3. **Test with Sample Data**: Use provided sample data first
4. **Documentation**: Review README.md for detailed information

## 🎉 Congratulations!

You've successfully set up the Shoe Manufacturing Inventory Management System! 

### Next Steps:
1. Train your team on using the system
2. Gradually migrate your real data
3. Customize features based on your specific needs
4. Set up regular backups and maintenance procedures

### Support:
- Review the main README.md for detailed feature documentation
- Check the troubleshooting section for common issues
- Consider professional support for complex customizations
