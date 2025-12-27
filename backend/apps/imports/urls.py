from django.urls import path
from . import views

urlpatterns = [
    path('delivery/', views.import_delivery_report, name='import-delivery'),
    path('financial/', views.import_financial_report, name='import-financial'),
    path('validate/', views.validate_csv, name='validate-csv'),
]
