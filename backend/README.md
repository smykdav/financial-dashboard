# Financial Dashboard - Backend

Django REST API backend for the Financial Dashboard application.

## Features

- Django 4.2+ with Django REST Framework
- JWT-based authentication
- SQLite/PostgreSQL database support
- Flexible report system with JSON data storage
- CSV import functionality for financial data
- Admin interface for data management
- CORS enabled for frontend integration
- Sample data generation scripts

## Technology Stack

- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development) / PostgreSQL (production)
- **CSV Processing**: Pandas

## Project Structure

```
financial-dashboard-backend/
├── apps/
│   ├── authentication/    # User authentication & JWT
│   ├── core/             # Core models (Year, Month, DeliveryReport, FinReport)
│   │   └── management/   # Management commands (populate_data, migrate_to_reports)
│   ├── imports/          # CSV import functionality
│   └── reports/          # New flexible report system
├── config/
│   ├── settings.py       # Django settings
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── requirements.txt
├── .env                  # Environment variables (not in git)
└── .env.example          # Example environment file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd financial-dashboard-backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_ENVIRONMENT=development

# Database (SQLite for local dev)
DB_ENGINE=sqlite
DB_NAME=db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

Or use the script with default credentials (admin/admin123):

```bash
python create_superuser.py
```

### 7. Populate Sample Data (Optional)

Generate realistic financial data for 2024-2026:

```bash
# Generate data in old snapshot models
python manage.py populate_data

# Migrate to new Report system
python manage.py migrate_to_reports
```

This creates:
- 3 years (2024, 2025, 2026)
- 36 months (12 per year)
- 72 reports (36 Delivery + 36 Financial)

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/token/refresh/` - Refresh access token

### Core Data

- `GET /api/years/` - List all years
- `GET /api/months/` - List all months
- `GET /api/dashboard/<year>/<month>/` - Get dashboard data for specific month

### Reports (New System)

- `GET /api/report-types/` - List all report types
- `GET /api/reports/` - List all reports
- `GET /api/reports/?report_type=delivery` - Filter by report type
- `GET /api/reports/?year=2024` - Filter by year
- `GET /api/reports/?year=2024&month=1` - Filter by year and month
- `POST /api/reports/bulk-create/` - Bulk create reports from CSV

### CSV Import

- `POST /api/import/delivery/` - Import delivery report CSV
- `POST /api/import/financial/` - Import financial report CSV
- `POST /api/import/validate/` - Validate CSV before import

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/`

Login with your superuser credentials to manage:
- Users
- Years and Months
- Report Types
- Reports
- Legacy DeliveryReportSnapshot and FinReportSnapshot

## Database Models

### Core Models

**Year**
- Represents a calendar year (2024, 2025, etc.)
- Has many Months

**Month**
- Belongs to a Year
- Month number (1-12)
- Has many Reports

### Report System (New)

**ReportType**
- Template/configuration for report types
- Contains field schema (defines available fields)
- Contains parsing config (for CSV import)
- System types: Delivery Report, Financial Report

**Report**
- Generic report data storage
- All data stored in JSON field
- Belongs to ReportType, Year, and Month
- Flexible schema based on ReportType

### Legacy Models (Still Used)

**DeliveryReportSnapshot**
- Delivery metrics: hours, utilization, billability, FTE, revenue, salary, GP

**FinReportSnapshot**
- Financial metrics: revenue, COGS, gross profit, overhead, net margin, dividends

## Management Commands

### populate_data

Generate realistic sample data for testing:

```bash
python manage.py populate_data
```

Creates delivery and financial snapshots for 2024-2026 with:
- Seasonal variations (lower in summer, higher in Q1/Q4)
- Year-over-year growth
- Realistic metric relationships

### migrate_to_reports

Migrate data from legacy snapshot models to new Report system:

```bash
python manage.py migrate_to_reports
```

Converts all DeliveryReportSnapshot and FinReportSnapshot records into Report records.

## Development

### Running Tests

```bash
python manage.py test
```

### Creating New Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Shell Access

```bash
python manage.py shell
```

### Check Data Status

```bash
python manage.py shell
>>> from apps.reports.models import Report, ReportType
>>> Report.objects.count()
>>> ReportType.objects.all()
```

## Deployment

### Environment Variables for Production

```env
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
DJANGO_ENVIRONMENT=production
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

DB_ENGINE=postgresql
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### Collect Static Files

```bash
python manage.py collectstatic
```

### Run with Gunicorn

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## Security Notes

- `.env` file is in `.gitignore` - never commit it
- `db.sqlite3` is in `.gitignore` - your data stays local
- Change `SECRET_KEY` in production (use Django's `get_random_secret_key()`)
- Set `DEBUG=False` in production
- Use HTTPS in production
- Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` properly

## Troubleshooting

### No reports showing in frontend

1. Check if data exists: `python manage.py shell`
2. Run: `Report.objects.count()`
3. If 0, run: `python manage.py populate_data && python manage.py migrate_to_reports`

### Authentication errors

- Verify JWT tokens in browser DevTools
- Check CORS settings in `.env`
- Ensure frontend is using correct API URL

### Database errors

- Delete `db.sqlite3` and run migrations again
- Check `.env` database configuration
- Ensure `venv` is activated

## API Response Examples

### Get Reports
```json
GET /api/reports/?report_type=delivery&year=2024&month=1

{
  "count": 1,
  "results": [
    {
      "id": 1,
      "report_type": 1,
      "report_type_name": "Delivery Report",
      "year": 1,
      "year_value": 2024,
      "month": 1,
      "month_value": 1,
      "month_display": "January",
      "data": {
        "fte": 46,
        "revenue": 949745.84,
        "billability": 84.09,
        ...
      }
    }
  ]
}
```

## License

Internal use only.
