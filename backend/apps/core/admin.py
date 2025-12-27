from django.contrib import admin
from .models import Year, Month, DeliveryReportSnapshot, FinReportSnapshot


@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ('year', 'created_at', 'created_by')
    list_filter = ('year',)
    search_fields = ('year',)
    readonly_fields = ('created_at', 'created_by')


@admin.register(Month)
class MonthAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'year', 'month', 'created_at')
    list_filter = ('year', 'month')
    search_fields = ('year__year',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DeliveryReportSnapshot)
class DeliveryReportSnapshotAdmin(admin.ModelAdmin):
    list_display = ('month', 'revenue', 'fte', 'gm_percent', 'updated_at')
    list_filter = ('month__year',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FinReportSnapshot)
class FinReportSnapshotAdmin(admin.ModelAdmin):
    list_display = ('month', 'cash_income', 'gross_profit', 'net_margin_cash', 'updated_at')
    list_filter = ('month__year',)
    readonly_fields = ('created_at', 'updated_at')
