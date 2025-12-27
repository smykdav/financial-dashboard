from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportTypeViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'report-types', ReportTypeViewSet, basename='reporttype')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
