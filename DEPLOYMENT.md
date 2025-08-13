# Deployment Instructions for GitHub Pages

## Automatic Deployment (Recommended)

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**

### 2. Configure Repository

1. Make sure your repository name matches the base URL in `vite.config.ts`
2. If your repository is named differently, update the base path:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/'
   ```

### 3. Push to Main Branch

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
- Install dependencies
- Build the project
- Deploy to GitHub Pages

### 4. Access Your Site

Your site will be available at: `https://yourusername.github.io/devin/`

## Manual Deployment

If you prefer manual deployment:

```bash
# Install gh-pages if not already installed
npm install --save-dev gh-pages

# Build and deploy
npm run deploy
```

## Troubleshooting

### Common Issues

1. **404 Error**: Check that the base URL in `vite.config.ts` matches your repository name
2. **Assets not loading**: Ensure `.nojekyll` file exists in the `public` folder
3. **Build fails**: Check that all dependencies are installed and TypeScript compiles without errors

### GitHub Actions Permissions

If deployment fails, ensure GitHub Actions has the necessary permissions:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Custom Domain

To use a custom domain:

1. Add your domain to the `CNAME` file
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Environment Variables

The deployment uses these environment variables:

- `NODE_ENV=production` - Set automatically during build
- Base URL is automatically configured based on environment

## Build Configuration

The project is configured with:

- **Output directory**: `dist`
- **Assets directory**: `assets`
- **Source maps**: Disabled for production
- **Base URL**: Dynamic based on environment
