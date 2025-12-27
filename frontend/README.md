# Financial Dashboard - Frontend

Modern React TypeScript frontend for the Financial Dashboard application.

## Features

- React 18+ with TypeScript
- Material-UI (MUI) component library
- JWT authentication with refresh tokens
- Responsive design (mobile, tablet, desktop)
- Interactive data visualization
- CSV import functionality
- Multi-year and multi-month report viewing
- Cards and Table view modes

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks
- **Charts**: (To be added - Recharts/Chart.js recommended)

## Project Structure

```
financial-dashboard-frontend/
├── public/              # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── ...
│   ├── contexts/       # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/          # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ViewDataPage.tsx
│   │   ├── ReportDetailPage.tsx
│   │   └── ImportDataPage.tsx
│   ├── services/       # API services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── reports.service.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd financial-dashboard-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://your-backend-api.com
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 6. Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features Overview

### Authentication

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Persistent login (tokens stored in localStorage)

### Dashboard

- Year and month selection
- View financial and delivery reports
- Quick overview of key metrics

### View Data

- Browse all reports by year
- Filter by period (Month, Quarter, H1/H2, Full Year)
- Click to view detailed report data

### Report Details

- **Table View**: All fields in a scrollable table
- **Cards View**: Individual month cards with key metrics
- Filtered display based on report type schema
- Support for multiple report types (Delivery, Financial)

### Import Data

- CSV file upload
- Report type selection
- Year specification
- Validation before import
- Bulk data import

## API Integration

The frontend communicates with the backend REST API:

### Authentication Endpoints

- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/token/refresh/` - Refresh access token

### Data Endpoints

- `GET /api/years/` - Get all years
- `GET /api/reports/` - Get reports (with filters)
- `GET /api/report-types/` - Get report types
- `POST /api/reports/bulk-create/` - Import CSV data

### Request Interceptors

- Automatically adds JWT token to requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

## Responsive Design

The application is fully responsive with breakpoints for:

- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

Key responsive features:
- Collapsible sidebar navigation
- Responsive tables with horizontal scroll
- Adaptive card layouts
- Touch-friendly interface

## Development

### Environment Variables

Access environment variables in code:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

### TypeScript

The project uses strict TypeScript configuration. All API responses and component props are typed.

### Code Style

- ESLint for code quality
- Consistent component structure
- Functional components with hooks

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

### Environment Variables for Production

Set these in your deployment platform:

```
VITE_API_URL=https://your-production-api.com
```

## Troubleshooting

### CORS Errors

Ensure your backend has correct CORS settings:
- Backend `.env` should include your frontend URL in `CORS_ALLOWED_ORIGINS`

### Authentication Issues

- Clear localStorage and try logging in again
- Check if backend is running on the correct port
- Verify JWT tokens in browser DevTools → Application → Local Storage

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### API Connection Issues

- Verify `VITE_API_URL` in `.env`
- Check backend is running: `curl http://localhost:8000/api/years/`
- Check browser console for network errors

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome)

## Future Enhancements

- [ ] Data visualization with charts
- [ ] Export reports to Excel/PDF
- [ ] Advanced filtering and search
- [ ] Dark mode
- [ ] Custom report builder
- [ ] Real-time updates with WebSockets

## License

Internal use only.
