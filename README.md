# Real Estate Investment Calculator

A comprehensive real estate investment calculator for the German market with detailed financial analysis, supporting multiple languages.

## Features

- 🏠 **Property Details**: Purchase price, area, federal state, energy efficiency
- 🧾 **Purchase Costs**: Automatic calculation of German real estate transfer taxes by state
- 💰 **Rental Parameters**: Cold rent, warm rent, additional expenses
- 💳 **Loan Parameters**: Main loan and KfW loan support
- ⚙️ **Tax Settings**: AfA rates, special amortization, marginal tax rates
- 📈 **Growth Assumptions**: Rent and property value growth projections
- 🎯 **Key Metrics**: Total return, IRR, cash flow analysis
- 📊 **Interactive Charts**: Capital growth, cash flow, and cumulative returns
- 🌍 **Multi-language**: German, English, Russian, Ukrainian, Turkish, Arabic

## Technologies

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **i18next** for internationalization
- **Lucide React** for icons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### GitHub Pages (Automatic)

The project is configured for automatic deployment to GitHub Pages via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at:
   - User/Organization site: `https://username.github.io/`
   - Project site: `https://username.github.io/repository-name/`

### Manual Deployment

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

## Configuration

The project automatically detects the correct base URL:
- Development: `/`
- Production: Automatically determined based on repository name

This is configured in `vite.config.ts`:

```typescript
base: process.env.VITE_BASE_URL || '/'
```

The GitHub Actions workflow automatically sets the correct base URL based on whether it's a user/organization site or a project site.

## License

MIT License
