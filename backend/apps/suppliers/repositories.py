from apps.core.repositories import BaseRepository

from .models import ContractRate, Supplier


class SupplierRepository(BaseRepository[Supplier]):
    model = Supplier


class ContractRateRepository(BaseRepository[ContractRate]):
    model = ContractRate

    def get_for_invoice(self, org_id: int, service_type: str):
        return self.model.objects.filter(
            organization_id=org_id,
            service_type=service_type,
        ).first()
