# Quick Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/financial-dashboard.git
cd financial-dashboard
```

## 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
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

Backend running at: http://localhost:8000

## 3. Frontend Setup

Open a new terminal:

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

Frontend running at: http://localhost:5173

## 4. Access Application

Open browser: http://localhost:5173

Login with default credentials:
- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

## Troubleshooting

**Backend won't start:**
- Make sure virtual environment is activated
- Check port 8000 is free: `lsof -ti:8000 | xargs kill`
- Verify database migrations: `python manage.py migrate`

**Frontend won't connect:**
- Verify backend is running at http://localhost:8000
- Check `VITE_API_URL` in `.env`
- Check CORS settings in backend `.env`

**No data showing:**
```bash
cd backend
python manage.py seed_report_types
python manage.py populate_data
```

## Next Steps

- Explore the dashboard
- Import CSV data from `sample_data/` folder
- Check the API at http://localhost:8000/admin
- Read full documentation in README.md
