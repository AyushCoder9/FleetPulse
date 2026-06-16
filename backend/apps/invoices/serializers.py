from rest_framework import serializers

from .models import Invoice, InvoiceLineItem


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'amount']


class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'organization', 'supplier', 'vehicle',
            'service_type', 'total_amount', 'status', 'created_at', 'line_items',
        ]
        read_only_fields = ['status', 'created_at']


class InvoiceListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    vehicle_vin = serializers.CharField(source='vehicle.vin', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'supplier_name', 'vehicle_vin',
            'service_type', 'total_amount', 'status', 'created_at',
        ]
