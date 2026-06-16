from apps.core.repositories import BaseRepository
from .models import Vehicle


class VehicleRepository(BaseRepository[Vehicle]):
    model = Vehicle

    def get_by_org(self, org_id: int):
        return self.model.objects.filter(organization_id=org_id)

    def get_idle(self):
        return self.model.objects.filter(status='idle')
