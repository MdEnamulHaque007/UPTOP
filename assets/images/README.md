# Images Directory

This directory contains images and assets for the Shoe Manufacturing Inventory Management System.

## Required Images

### Logo Files
- `logo.png` - Main application logo (recommended size: 64x64px)
- `favicon.ico` - Browser favicon (16x16px, 32x32px, 48x48px)

### Placeholder Images
For development purposes, you can use placeholder images:

1. **Logo**: Create a 64x64px PNG with your company logo
2. **Favicon**: Convert your logo to ICO format for browser favicon

### Image Guidelines

- **Logo**: Should be square format, transparent background preferred
- **File Formats**: PNG for logos, ICO for favicon
- **Optimization**: Compress images for web use
- **Accessibility**: Ensure good contrast for visibility

### Creating Placeholder Images

You can create simple placeholder images using:
- Online tools like Canva, Figma, or Adobe Express
- Free logo generators
- Simple geometric shapes with company initials

### Example CSS for Custom Styling

```css
.header-logo {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-lg);
    object-fit: cover;
}

.login-header .logo {
    width: 64px;
    height: 64px;
    margin: 0 auto var(--spacing-4);
    border-radius: var(--radius-xl);
}
```

## File Structure

```
assets/images/
├── logo.png          # Main application logo
├── favicon.ico       # Browser favicon
└── README.md         # This file
```

## Notes

- Images should be optimized for web use
- Consider providing multiple sizes for different use cases
- Ensure images follow your brand guidelines
- Test images on different backgrounds and screen sizes
