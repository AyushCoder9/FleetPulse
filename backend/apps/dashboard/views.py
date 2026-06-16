from decimal import Decimal

from django.db.models import Count, Q, Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.anomalies.models import AnomalyFlag, IdleEvent
from apps.invoices.models import Invoice
from apps.suppliers.models import Supplier


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        org_ids = list(
            request.user.memberships.values_list('organization_id', flat=True)
        )

        overcharges = AnomalyFlag.objects.filter(
            invoice__organization_id__in=org_ids,
            detector_name='rate_card_variance',
        ).aggregate(
            total=Sum('invoice__total_amount')
        )['total'] or Decimal('0')

        idle_cost = IdleEvent.objects.filter(
            vehicle__organization_id__in=org_ids,
        ).aggregate(total=Sum('estimated_cost'))['total'] or Decimal('0')

        flagged_count = Invoice.objects.filter(
            organization_id__in=org_ids,
            status='flagged',
            is_deleted=False,
        ).count()

        supplier_scores = []
        for supplier in Supplier.objects.all():
            total = Invoice.objects.filter(supplier=supplier).count()
            flagged = Invoice.objects.filter(supplier=supplier, status='flagged').count()
            score = round((1 - flagged / total) * 100) if total > 0 else 100
            supplier_scores.append(score)
        avg_supplier_score = round(sum(supplier_scores) / len(supplier_scores)) if supplier_scores else 0

        return Response({
            'overcharges_caught': float(overcharges),
            'idle_cost_saved': float(idle_cost),
            'flagged_invoice_count': flagged_count,
            'avg_supplier_score': avg_supplier_score,
        })
