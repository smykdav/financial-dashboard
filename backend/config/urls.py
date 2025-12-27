"""
URL configuration for Financial Dashboard Backend.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.core.urls')),
    path('api/import/', include('apps.imports.urls')),
    path('api/', include('apps.reports.urls')),
]
