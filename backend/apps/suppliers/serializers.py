from rest_framework import serializers
from apps.anomalies.models import AnomalyFlag
from apps.invoices.models import Invoice
from .models import Supplier, ContractRate


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'region']


class ContractRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractRate
        fields = ['id', 'organization', 'service_type', 'max_rate', 'region']


class SupplierScorecardSerializer(serializers.ModelSerializer):
    invoice_count = serializers.SerializerMethodField()
    flagged_count = serializers.SerializerMethodField()
    total_spend = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'region', 'invoice_count', 'flagged_count', 'total_spend', 'score']

    def get_invoice_count(self, obj):
        return Invoice.objects.filter(supplier=obj).count()

    def get_flagged_count(self, obj):
        return Invoice.objects.filter(supplier=obj, status='flagged').count()

    def get_total_spend(self, obj):
        from django.db.models import Sum
        result = Invoice.objects.filter(supplier=obj).aggregate(total=Sum('total_amount'))
        return result['total'] or 0

    def get_score(self, obj):
        total = self.get_invoice_count(obj)
        flagged = self.get_flagged_count(obj)
        if total == 0:
            return 100
        return round((1 - flagged / total) * 100)
