# Financial Dashboard

Full-stack financial dashboard application for tracking and visualizing business metrics.

## Project Structure

```
financial-dashboard/
├── backend/         # Django REST API
├── frontend/        # React TypeScript App
└── README.md        # This file
```

## Features

### Backend (Django REST API)
- JWT-based authentication
- Flexible report system with JSON data storage
- CSV import functionality
- Sample data generation for testing
- Admin interface for data management
- RESTful API with comprehensive documentation

### Frontend (React TypeScript)
- Modern responsive UI with Material-UI
- JWT authentication with auto-refresh
- Multi-year and multi-month report viewing
- Cards and Table view modes
- CSV import interface
- Real-time data visualization

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser (creates admin/admin123 automatically)
python manage.py create_default_superuser

# (Optional) Setup report types and generate sample data
python manage.py seed_report_types
python manage.py populate_data

# Start backend
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Default Login Credentials

If you used `create_default_superuser` command:

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

## Tech Stack

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **CSV Processing**: Pandas

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Documentation

- [Backend Documentation](./backend/README.md) - API endpoints, models, management commands
- [Frontend Documentation](./frontend/README.md) - Components, services, deployment

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user

### Reports
- `GET /api/reports/` - List all reports
- `GET /api/reports/?report_type=delivery&year=2024` - Filter reports
- `GET /api/report-types/` - List report types
- `POST /api/reports/bulk-create/` - Import CSV data

### Admin
- `GET /admin/` - Django admin interface

## Development

### Running Tests

**Backend:**
```bash
cd backend
python manage.py test
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Database Management

**Generate sample data:**
```bash
cd backend
python manage.py seed_report_types
python manage.py populate_data
```

**Reset database:**
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py create_default_superuser
python manage.py seed_report_types
python manage.py populate_data
```

### Building for Production

**Backend:**
```bash
cd backend
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy 'dist' folder to static hosting
```

## Deployment

### Backend Deployment Options
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Google Cloud Run

### Frontend Deployment Options
- Vercel (recommended)
- Netlify
- AWS Amplify
- GitHub Pages

### Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DEBUG=False
DJANGO_ENVIRONMENT=production
ALLOWED_HOSTS=your-domain.com
DB_ENGINE=postgresql
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-api.com
```

## Features Overview

### Report Management
- Create custom report types
- Import data from CSV files
- View reports by year, month, quarter, or full year
- Export data (future feature)

### Data Visualization
- Table view with sortable columns
- Card view for individual month details
- Charts and graphs (future feature)

### User Management
- JWT-based authentication
- User registration and login
- Password reset (future feature)
- Role-based permissions (future feature)

## Security

- Environment variables for sensitive data
- JWT tokens with automatic refresh
- CORS protection
- SQL injection prevention (Django ORM)
- XSS protection (React)
- CSRF protection (Django)

**Important:**
- Never commit `.env` files
- Never commit `db.sqlite3` database
- Change `SECRET_KEY` in production
- Use HTTPS in production

## Troubleshooting

### Backend not starting
- Check if port 8000 is available
- Ensure virtual environment is activated
- Verify database migrations: `python manage.py migrate`

### Frontend not connecting to API
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check CORS settings in backend `.env`

### No data showing
- Run: `python manage.py seed_report_types`
- Then: `python manage.py populate_data`
- Login with your credentials

## Project Status

This is an active development project. Current version includes:

✅ User authentication
✅ Report management
✅ CSV import
✅ Responsive design
✅ Sample data generation

🚧 Upcoming features:
- Data visualization charts
- Export to Excel/PDF
- Advanced filtering
- Dark mode
- Custom report builder

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Internal use only.

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team

## Acknowledgments

- Django REST Framework for the robust API
- Material-UI for the beautiful components
- React team for the amazing frontend framework
