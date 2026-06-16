from apps.core.repositories import BaseRepository
from .models import Organization, Membership


class OrganizationRepository(BaseRepository[Organization]):
    model = Organization


class MembershipRepository(BaseRepository[Membership]):
    model = Membership

    def get_by_user_and_org(self, user_id: int, org_id: int):
        return self.model.objects.get(user_id=user_id, organization_id=org_id)
