# Quick Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- Git

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
# Edit .env if needed

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Generate sample data (optional)
python manage.py populate_data
python manage.py migrate_to_reports

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
# Ensure VITE_API_URL=http://localhost:8000

# Start frontend
npm run dev
```

Frontend running at: http://localhost:5173

## 4. Access Application

Open browser: http://localhost:5173

Login with your superuser credentials.

## Troubleshooting

**Backend won't start:**
- Make sure virtual environment is activated
- Check port 8000 is free: `lsof -ti:8000 | xargs kill`

**Frontend won't connect:**
- Verify backend is running
- Check .env file has correct API URL

**No data showing:**
```bash
cd backend
python manage.py populate_data
python manage.py migrate_to_reports
```

## Next Steps

- Explore the dashboard
- Import CSV data
- Check the API at http://localhost:8000/admin
- Read full documentation in README.md
