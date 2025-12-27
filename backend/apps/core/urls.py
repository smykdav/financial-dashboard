from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'years', views.YearViewSet, basename='year')
router.register(r'months', views.MonthViewSet, basename='month')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/<int:year>/<int:month>/', views.dashboard_data, name='dashboard-data'),
]
