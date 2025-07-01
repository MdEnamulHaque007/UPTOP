# 🚀 GitHub Setup & Deployment Commands

Follow these steps to push your Dynamic Inventory Dashboard to GitHub and deploy it.

## 📋 Prerequisites

1. **GitHub Account**: Create account at [github.com](https://github.com)
2. **Git Installed**: Download from [git-scm.com](https://git-scm.com)
3. **Command Line Access**: Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows)

## 🔧 Step 1: Initialize Git Repository

Open terminal/command prompt in your `inventory-app` folder and run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: initial commit - dynamic inventory dashboard"

# Check status
git status
```

## 🌐 Step 2: Create GitHub Repository

### Option A: Via GitHub Website
1. Go to [github.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `dynamic-inventory-dashboard`
4. Description: `A dynamic inventory management dashboard with Google Sheets integration`
5. Set to **Public** (for free GitHub Pages)
6. **Don't** initialize with README (we already have files)
7. Click "Create repository"

### Option B: Via GitHub CLI (if installed)
```bash
# Install GitHub CLI first: https://cli.github.com
gh repo create dynamic-inventory-dashboard --public --description "Dynamic inventory management dashboard with Google Sheets integration"
```

## 🔗 Step 3: Connect Local Repository to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/dynamic-inventory-dashboard.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🚀 Step 4: Enable GitHub Pages

### Via GitHub Website:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Select branch: **main**
6. Select folder: **/ (root)**
7. Click **Save**

### Your dashboard will be available at:
```
https://YOUR_USERNAME.github.io/dynamic-inventory-dashboard/dashboard.html
```

## 📊 Step 5: Update Repository Settings

### Edit package.json:
```bash
# Update repository URLs in package.json
sed -i 's/yourusername/YOUR_USERNAME/g' package.json
```

### Or manually edit:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/dynamic-inventory-dashboard.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/dynamic-inventory-dashboard/issues"
  },
  "homepage": "https://YOUR_USERNAME.github.io/dynamic-inventory-dashboard"
}
```

## 🔄 Step 6: Push Updates

```bash
# Add updated files
git add .

# Commit changes
git commit -m "docs: update repository URLs and configuration"

# Push to GitHub
git push origin main
```

## ✅ Step 7: Verify Deployment

### Check GitHub Pages Status:
1. Go to repository **Settings** > **Pages**
2. Look for green checkmark and deployment URL
3. Click the URL to test your dashboard

### Test Your Live Dashboard:
```
https://YOUR_USERNAME.github.io/dynamic-inventory-dashboard/dashboard.html
```

## 🔧 Common Git Commands for Future Updates

### Daily Workflow:
```bash
# Check current status
git status

# Add specific files
git add filename.html
# Or add all changes
git add .

# Commit with descriptive message
git commit -m "feat: add new chart type"
git commit -m "fix: resolve mobile layout issue"
git commit -m "docs: update README with new features"

# Push to GitHub
git push origin main
```

### Branch Management:
```bash
# Create new feature branch
git checkout -b feature/new-dashboard-widget

# Switch between branches
git checkout main
git checkout feature/new-dashboard-widget

# Merge feature branch
git checkout main
git merge feature/new-dashboard-widget

# Delete feature branch
git branch -d feature/new-dashboard-widget
```

### Viewing History:
```bash
# View commit history
git log --oneline

# View changes in last commit
git show

# View differences
git diff
```

## 🛠️ Troubleshooting

### Authentication Issues:
```bash
# If you get authentication errors, set up SSH keys or use personal access token
# For HTTPS with token:
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/dynamic-inventory-dashboard.git
```

### Large File Issues:
```bash
# If you have large files, add them to .gitignore
echo "large-file.zip" >> .gitignore
git add .gitignore
git commit -m "chore: ignore large files"
```

### Reset to Previous Commit:
```bash
# Soft reset (keeps changes)
git reset --soft HEAD~1

# Hard reset (discards changes)
git reset --hard HEAD~1
```

## 📈 Advanced GitHub Features

### Enable Issues and Discussions:
1. Go to repository **Settings**
2. Scroll to **Features** section
3. Check **Issues** and **Discussions**

### Add Repository Topics:
1. Go to repository main page
2. Click gear icon next to "About"
3. Add topics: `dashboard`, `inventory`, `google-sheets`, `javascript`, `charts`

### Create Release:
```bash
# Tag a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Then create release on GitHub website with release notes.

## 🔒 Security Best Practices

### Protect Main Branch:
1. Go to **Settings** > **Branches**
2. Add rule for `main` branch
3. Enable "Require pull request reviews"
4. Enable "Require status checks"

### Add Security Policy:
```bash
# Create security policy
mkdir .github
echo "# Security Policy

## Reporting Security Vulnerabilities

Please report security vulnerabilities to: security@yourdomain.com

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x.x   | ✅        |

" > .github/SECURITY.md

git add .github/SECURITY.md
git commit -m "docs: add security policy"
git push origin main
```

## 📊 Monitoring Your Repository

### GitHub Insights:
- **Traffic**: View visitor statistics
- **Commits**: Track development activity
- **Contributors**: See who's contributing
- **Dependency graph**: Monitor dependencies

### Useful GitHub Apps:
- **Lighthouse CI**: Automated performance testing
- **CodeQL**: Security analysis
- **Dependabot**: Dependency updates

## 🎯 Next Steps After Deployment

1. **Test Live Dashboard**: Verify all features work
2. **Share URL**: Send dashboard link to stakeholders
3. **Monitor Usage**: Check GitHub traffic insights
4. **Collect Feedback**: Create issues for improvements
5. **Plan Updates**: Use project boards for feature planning

## 📞 Getting Help

### GitHub Resources:
- [GitHub Docs](https://docs.github.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)

### Community Support:
- [GitHub Community](https://github.community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github)

---

## 🎉 Congratulations!

Your Dynamic Inventory Dashboard is now:
- ✅ **Version controlled** with Git
- ✅ **Hosted on GitHub** with full source code
- ✅ **Deployed live** via GitHub Pages
- ✅ **Publicly accessible** at your GitHub Pages URL
- ✅ **Ready for collaboration** with issues and pull requests

**Your live dashboard URL:**
```
https://YOUR_USERNAME.github.io/dynamic-inventory-dashboard/dashboard.html
```

**Repository URL:**
```
https://github.com/YOUR_USERNAME/dynamic-inventory-dashboard
```
