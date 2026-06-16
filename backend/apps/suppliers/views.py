from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ContractRate, Supplier
from .serializers import ContractRateSerializer, SupplierScorecardSerializer, SupplierSerializer


class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def scorecard(self, request, pk=None):
        supplier = self.get_object()
        serializer = SupplierScorecardSerializer(supplier)
        return Response(serializer.data)


class ContractRateViewSet(viewsets.ModelViewSet):
    serializer_class = ContractRateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContractRate.objects.filter(
            organization__memberships__user=self.request.user
        )
