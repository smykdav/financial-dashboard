from rest_framework import serializers
from .models import Year, Month, DeliveryReportSnapshot, FinReportSnapshot


class YearSerializer(serializers.ModelSerializer):
    months_count = serializers.SerializerMethodField()

    class Meta:
        model = Year
        fields = ['id', 'year', 'created_at', 'months_count']
        read_only_fields = ['created_at']

    def get_months_count(self, obj):
        return obj.months.count()


class DeliveryReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryReportSnapshot
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class FinReportSerializer(serializers.ModelSerializer):
    profit_margin = serializers.ReadOnlyField()

    class Meta:
        model = FinReportSnapshot
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class MonthSerializer(serializers.ModelSerializer):
    year_value = serializers.IntegerField(source='year.year', read_only=True)
    month_display = serializers.CharField(read_only=True)
    has_delivery_report = serializers.SerializerMethodField()
    has_fin_report = serializers.SerializerMethodField()

    class Meta:
        model = Month
        fields = [
            'id',
            'year',
            'year_value',
            'month',
            'month_display',
            'has_delivery_report',
            'has_fin_report',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_has_delivery_report(self, obj):
        return hasattr(obj, 'delivery_report')

    def get_has_fin_report(self, obj):
        return hasattr(obj, 'fin_report')


class MonthDetailSerializer(MonthSerializer):
    delivery_report = DeliveryReportSerializer(read_only=True)
    fin_report = FinReportSerializer(read_only=True)

    class Meta(MonthSerializer.Meta):
        fields = MonthSerializer.Meta.fields + ['delivery_report', 'fin_report']
