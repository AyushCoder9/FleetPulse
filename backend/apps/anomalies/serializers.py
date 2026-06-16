from rest_framework import serializers
from .models import AnomalyFlag, IdleEvent


class AnomalyFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnomalyFlag
        fields = ['id', 'invoice', 'detector_name', 'reason', 'severity', 'resolved', 'created_at']


class IdleEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdleEvent
        fields = ['id', 'vehicle', 'start_time', 'end_time', 'root_cause', 'estimated_cost']
