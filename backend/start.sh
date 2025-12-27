#!/bin/bash

# Financial Dashboard Backend - Start Script

echo "🚀 Starting Financial Dashboard Backend..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Run database migrations (if any new ones)
echo "📊 Checking for database migrations..."
python manage.py migrate

echo ""
echo "✅ Backend is ready!"
echo ""
echo "🔗 Server will start at: http://localhost:8000"
echo "🔑 Admin panel: http://localhost:8000/admin/"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📡 API Base URL: http://localhost:8000/api/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Django development server
python manage.py runserver 8000
