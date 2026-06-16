from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Invoice
from .serializers import InvoiceListSerializer, InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Invoice.objects.filter(
            organization__memberships__user=self.request.user
        ).select_related('supplier', 'vehicle').prefetch_related('line_items', 'anomaly_flags')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'approved'
        invoice.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'flagged'
        invoice.save()
        return Response({'status': 'flagged'})
