from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ContractRate, Supplier
from .serializers import ContractRateSerializer, SupplierScorecardSerializer, SupplierSerializer


def _get_org_ids(user):
    return list(user.memberships.values_list('organization_id', flat=True))


class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        org_ids = _get_org_ids(self.request.user)
        return Supplier.objects.filter(
            invoices__organization_id__in=org_ids,
            invoices__is_deleted=False,
        ).distinct()

    @action(detail=True, methods=['get'])
    def scorecard(self, request, pk=None):
        supplier = self.get_object()
        org_ids = _get_org_ids(request.user)
        serializer = SupplierScorecardSerializer(supplier, context={'org_ids': org_ids})
        return Response(serializer.data)


class ContractRateViewSet(viewsets.ModelViewSet):
    serializer_class = ContractRateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContractRate.objects.filter(
            organization__memberships__user=self.request.user
        )
