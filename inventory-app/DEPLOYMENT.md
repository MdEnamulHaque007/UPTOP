# 🚀 Deployment Guide

This guide covers various deployment options for the Dynamic Inventory Dashboard.

## 📋 Pre-Deployment Checklist

### ✅ **Essential Checks**
- [ ] Test Google Sheets connection
- [ ] Verify all charts render correctly
- [ ] Test on mobile devices (iOS/Android)
- [ ] Check keyboard navigation
- [ ] Validate data export functionality
- [ ] Test error handling scenarios
- [ ] Verify performance metrics
- [ ] Check browser compatibility
- [ ] Test with real data
- [ ] Validate accessibility features

### 🔧 **Configuration Verification**
- [ ] Google Sheet ID is correct
- [ ] Sheet permissions are set to public
- [ ] API endpoints are accessible
- [ ] CDN resources load properly
- [ ] All file paths are relative
- [ ] No hardcoded localhost URLs

## 🌐 Deployment Options

### 1. **GitHub Pages (Free)**

#### Setup Steps:
```bash
# 1. Push to GitHub
git add .
git commit -m "feat: initial dashboard deployment"
git push origin main

# 2. Enable GitHub Pages
# Go to repository Settings > Pages
# Source: Deploy from a branch
# Branch: main / (root)
```

#### Configuration:
- **URL**: `https://yourusername.github.io/repository-name`
- **Custom Domain**: Optional
- **HTTPS**: Automatically enabled
- **Build Time**: ~1-2 minutes

#### Pros:
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Easy setup
- ✅ Git-based deployment

#### Cons:
- ❌ Public repositories only (for free)
- ❌ Static files only
- ❌ Limited bandwidth

### 2. **Netlify (Free Tier)**

#### Setup Steps:
```bash
# 1. Create netlify.toml
echo '[build]
  publish = "."
  command = "echo No build needed"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"' > netlify.toml

# 2. Deploy via Git or drag & drop
```

#### Configuration:
- **Build Command**: None needed
- **Publish Directory**: `.` (root)
- **Environment Variables**: None required

#### Pros:
- ✅ Free tier available
- ✅ Custom domains
- ✅ Automatic deployments
- ✅ Form handling
- ✅ Analytics

### 3. **Vercel (Free Tier)**

#### Setup Steps:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
```

#### Configuration:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### Pros:
- ✅ Fast global CDN
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics

### 4. **Traditional Web Hosting**

#### File Upload:
```bash
# 1. Create deployment package
zip -r dashboard-deployment.zip . -x "*.git*" "node_modules/*" "*.md"

# 2. Upload via FTP/SFTP
# 3. Extract in web root directory
```

#### Server Requirements:
- **Web Server**: Apache, Nginx, IIS
- **HTTPS**: SSL certificate required
- **MIME Types**: Ensure .js, .css, .json are served correctly

#### Apache .htaccess:
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
</IfModule>
```

### 5. **Docker Deployment**

#### Dockerfile:
```dockerfile
FROM nginx:alpine

# Copy files
COPY . /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index dashboard.html;
        
        location / {
            try_files $uri $uri/ /dashboard.html;
        }
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

#### Deploy Commands:
```bash
# Build image
docker build -t inventory-dashboard .

# Run container
docker run -d -p 8080:80 inventory-dashboard

# Or use docker-compose
docker-compose up -d
```

## 🔧 Environment Configuration

### Production Settings:
```javascript
// js/config.js
const CONFIG = {
    ENVIRONMENT: 'production',
    API_BASE_URL: 'https://opensheet.elk.sh',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000,
    DEBUG: false
};
```

### Development Settings:
```javascript
const CONFIG = {
    ENVIRONMENT: 'development',
    API_BASE_URL: 'https://opensheet.elk.sh',
    CACHE_DURATION: 1 * 60 * 1000, // 1 minute
    RETRY_ATTEMPTS: 1,
    TIMEOUT: 5000,
    DEBUG: true
};
```

## 📊 Performance Optimization

### CDN Configuration:
```html
<!-- Use CDN for external libraries -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

### Compression:
```bash
# Gzip static files
gzip -9 -c dashboard.html > dashboard.html.gz
gzip -9 -c css/dashboard.css > css/dashboard.css.gz
gzip -9 -c js/dashboard.js > js/dashboard.js.gz
```

### Minification:
```bash
# Install minification tools
npm install -g terser clean-css-cli html-minifier

# Minify files
terser js/dashboard.js -o js/dashboard.min.js -c -m
cleancss css/dashboard.css -o css/dashboard.min.css
html-minifier --collapse-whitespace --remove-comments dashboard.html -o dashboard.min.html
```

## 🔒 Security Configuration

### Content Security Policy:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    connect-src 'self' https://opensheet.elk.sh;
    img-src 'self' data:;
">
```

### HTTPS Redirect:
```javascript
// Force HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

## 📈 Monitoring & Analytics

### Google Analytics:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking:
```javascript
// Simple error tracking
window.addEventListener('error', function(e) {
    // Log to your error tracking service
    console.error('Dashboard Error:', e.error);
    
    // Optional: Send to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error.message,
            fatal: false
        });
    }
});
```

### Performance Monitoring:
```javascript
// Monitor load time
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            name: 'dashboard_load',
            value: Math.round(loadTime)
        });
    }
});
```

## 🧪 Testing in Production

### Smoke Tests:
```bash
# Test main endpoints
curl -I https://yourdomain.com/dashboard.html
curl -I https://yourdomain.com/css/dashboard.css
curl -I https://yourdomain.com/js/dashboard.js

# Test API connectivity
curl -I https://opensheet.elk.sh/1TgjxVUu9Bci2ivFxk1hHPGVNVfUsxztXD4QoZEXsYUc/PO
```

### Load Testing:
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test concurrent users
ab -n 100 -c 10 https://yourdomain.com/dashboard.html
```

### Browser Testing:
- **Chrome DevTools**: Performance, Network, Console
- **Firefox Developer Tools**: Performance analysis
- **Safari Web Inspector**: iOS testing
- **Edge DevTools**: Windows compatibility

## 🔄 Continuous Deployment

### GitHub Actions:
```yaml
# .github/workflows/deploy.yml
name: Deploy Dashboard

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### Netlify Deploy:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

## 📞 Post-Deployment Support

### Health Checks:
- **Dashboard loads**: Main page accessible
- **Charts render**: All visualizations working
- **Data loads**: Google Sheets connection active
- **Mobile responsive**: Touch interactions work
- **Error handling**: Graceful failure modes

### Monitoring Checklist:
- [ ] Uptime monitoring
- [ ] Performance metrics
- [ ] Error rate tracking
- [ ] User analytics
- [ ] API response times
- [ ] Mobile usage patterns

### Maintenance Schedule:
- **Daily**: Check error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Full system review

---

**Your dashboard is now ready for production deployment! 🚀**
