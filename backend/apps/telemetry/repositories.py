from django.utils import timezone
from datetime import timedelta
from apps.core.repositories import BaseRepository
from .models import TelemetryEvent


class TelemetryEventRepository(BaseRepository[TelemetryEvent]):
    model = TelemetryEvent

    def get_latest_for_vehicle(self, vehicle_id: int):
        return self.model.objects.filter(vehicle_id=vehicle_id).order_by('-timestamp').first()

    def get_idle_since(self, hours: int = 24):
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.model.objects.filter(
            ignition_status=False,
            timestamp__lte=cutoff,
        ).select_related('vehicle')
