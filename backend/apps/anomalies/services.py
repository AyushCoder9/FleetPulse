from decimal import Decimal
from django.utils import timezone
from datetime import timedelta


class IdleDetectionService:
    def __init__(self, vehicle_repo, telemetry_repo, idle_event_repo):
        self.vehicle_repo = vehicle_repo
        self.telemetry_repo = telemetry_repo
        self.idle_event_repo = idle_event_repo

    def detect_idle_vehicles(self, idle_threshold_hours: int = 24) -> list:
        cutoff = timezone.now() - timedelta(hours=idle_threshold_hours)
        idle_events_created = []

        idle_vehicles = self.vehicle_repo.get_idle()
        for vehicle in idle_vehicles:
            existing = self.idle_event_repo.get_open_for_vehicle(vehicle.id)
            if existing:
                continue
            latest_event = self.telemetry_repo.get_latest_for_vehicle(vehicle.id)
            if latest_event and latest_event.timestamp <= cutoff:
                idle_days = (timezone.now() - latest_event.timestamp).days or 1
                idle_event = self.idle_event_repo.create(
                    vehicle_id=vehicle.id,
                    start_time=latest_event.timestamp,
                    root_cause='unknown',
                    estimated_cost=Decimal(str(idle_days * 150)),
                )
                idle_events_created.append(idle_event)

        return idle_events_created
