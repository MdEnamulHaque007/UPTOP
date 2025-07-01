# Contributing to Dynamic Inventory Dashboard

Thank you for your interest in contributing to the Dynamic Inventory Dashboard! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control
- Text editor or IDE

### Development Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dynamic-inventory-dashboard.git
   cd dynamic-inventory-dashboard
   ```

2. **Install development dependencies** (optional)
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   npx live-server --port=8080
   ```

4. **Run tests**
   ```bash
   npm test
   # or open dashboard-test.html in browser
   ```

## 📁 Project Structure

```
inventory-app/
├── dashboard.html              # Main dashboard
├── css/
│   ├── dashboard.css          # Dashboard styles
│   └── style.css              # Simple app styles
├── js/
│   ├── dashboard.js           # Dashboard controller
│   ├── gs-data-service.js     # Google Sheets service
│   ├── app.js                 # Simple app controller
│   └── utils.js               # Utility functions
├── test/                      # Test files
└── docs/                      # Documentation
```

## 🛠️ Development Guidelines

### Code Style
- **JavaScript**: Use ES6+ features, async/await for promises
- **CSS**: Use CSS custom properties, mobile-first approach
- **HTML**: Semantic markup, accessibility attributes
- **Comments**: Document complex logic and API integrations

### Naming Conventions
- **Files**: kebab-case (e.g., `data-service.js`)
- **Classes**: PascalCase (e.g., `DashboardController`)
- **Functions**: camelCase (e.g., `fetchData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Git Workflow
1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new chart type support"
   ```

3. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format
Use conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

## 🧪 Testing

### Running Tests
- **Manual Testing**: Open `dashboard-test.html`
- **Automated Tests**: Run test suite in browser
- **Cross-browser**: Test on multiple browsers
- **Mobile Testing**: Test responsive design

### Test Categories
1. **Connection Tests**: Google Sheets API integration
2. **UI Tests**: User interface components
3. **Data Tests**: Data processing and filtering
4. **Chart Tests**: Visualization rendering
5. **Performance Tests**: Load time and memory usage
6. **Accessibility Tests**: Keyboard navigation and screen readers

### Adding New Tests
```javascript
function testNewFeature() {
    showResults('feature-results');
    const output = document.getElementById('feature-output');
    
    try {
        // Test implementation
        const result = yourNewFeature();
        testResults.newFeature = result.success;
        output.textContent = '✅ New feature working correctly';
    } catch (error) {
        testResults.newFeature = false;
        output.textContent = `❌ Test failed: ${error.message}`;
    }
    
    updateTestSummary();
}
```

## 📊 Adding New Features

### New Chart Types
1. **Add chart initialization**
   ```javascript
   initNewChart() {
       const ctx = document.getElementById('new-chart');
       this.charts.newChart = new Chart(ctx, {
           type: 'newType',
           data: { /* chart data */ },
           options: { /* chart options */ }
       });
   }
   ```

2. **Update chart data**
   ```javascript
   updateNewChart() {
       if (!this.charts.newChart) return;
       // Update chart with filtered data
       this.charts.newChart.data = processedData;
       this.charts.newChart.update();
   }
   ```

### New Filters
1. **Add HTML control**
   ```html
   <select id="new-filter" class="control-select">
       <option value="all">All Items</option>
   </select>
   ```

2. **Add filter logic**
   ```javascript
   applyFilters() {
       let filtered = [...this.data];
       
       const newFilter = document.getElementById('new-filter')?.value;
       if (newFilter && newFilter !== 'all') {
           filtered = filtered.filter(item => item.newField === newFilter);
       }
       
       this.filteredData = filtered;
   }
   ```

### New Data Sources
1. **Extend data service**
   ```javascript
   async fetchFromNewSource() {
       try {
           const response = await fetch('new-api-endpoint');
           const data = await response.json();
           return this.processData(data);
       } catch (error) {
           throw new Error(`Failed to fetch from new source: ${error.message}`);
       }
   }
   ```

## 🐛 Bug Reports

### Before Reporting
1. **Check existing issues**: Search for similar problems
2. **Test in multiple browsers**: Verify browser compatibility
3. **Check console**: Look for JavaScript errors
4. **Test with sample data**: Verify with known good data

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- Browser: [e.g., Chrome 91]
- OS: [e.g., Windows 10]
- Screen size: [e.g., 1920x1080]

**Additional Context**
Console errors, screenshots, etc.
```

## 🚀 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why this feature would be useful.

**Proposed Solution**
How you think it should work.

**Alternatives**
Other solutions you've considered.

**Additional Context**
Mockups, examples, etc.
```

## 📚 Documentation

### Adding Documentation
- **Code Comments**: Document complex functions
- **README Updates**: Keep setup instructions current
- **API Documentation**: Document public methods
- **User Guide**: Update feature descriptions

### Documentation Style
- **Clear and concise**: Easy to understand
- **Code examples**: Show practical usage
- **Screenshots**: Visual guides for UI features
- **Step-by-step**: Detailed instructions

## 🎯 Performance Guidelines

### Optimization Tips
- **Minimize DOM manipulation**: Batch updates
- **Debounce user input**: Prevent excessive API calls
- **Lazy load charts**: Initialize only when needed
- **Optimize data processing**: Use efficient algorithms

### Performance Testing
- **Load time**: < 3 seconds on average connection
- **Memory usage**: < 50MB for typical datasets
- **Chart rendering**: < 500ms for standard charts
- **Filter response**: < 100ms for user interactions

## 🔒 Security Guidelines

### Data Handling
- **Input validation**: Sanitize all user inputs
- **XSS prevention**: Use proper HTML escaping
- **API security**: Validate API responses
- **Error handling**: Don't expose sensitive information

### Best Practices
- **HTTPS only**: Always use secure connections
- **Read-only access**: Dashboard should only read data
- **Rate limiting**: Respect API rate limits
- **Error logging**: Log errors without sensitive data

## 📞 Getting Help

### Resources
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check README and wiki
- **Code Comments**: Read inline documentation
- **Test Suite**: Run tests to understand functionality

### Contact
- **GitHub Issues**: Primary support channel
- **Email**: [your-email@example.com]
- **Discord/Slack**: [Community chat link]

## 🏆 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **CHANGELOG.md**: Feature attribution
- **GitHub**: Contributor graphs and statistics

Thank you for contributing to the Dynamic Inventory Dashboard! 🎉
