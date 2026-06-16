from rest_framework import serializers

from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'organization', 'vin', 'make', 'model', 'status', 'odometer', 'created_at']
