from apps.core.repositories import BaseRepository

from .models import AnomalyFlag, IdleEvent


class AnomalyFlagRepository(BaseRepository[AnomalyFlag]):
    model = AnomalyFlag

    def create_from_flag(self, invoice_id: int, flag) -> AnomalyFlag:
        return self.model.objects.create(
            invoice_id=invoice_id,
            detector_name=flag.detector_name,
            reason=flag.reason,
            severity=flag.severity,
        )


class IdleEventRepository(BaseRepository[IdleEvent]):
    model = IdleEvent

    def get_open_for_vehicle(self, vehicle_id: int):
        return self.model.objects.filter(vehicle_id=vehicle_id, end_time__isnull=True).first()
