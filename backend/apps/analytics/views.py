from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


def _get_user_org(user):
    membership = user.memberships.select_related('organization').first()
    return membership.organization if membership else None


class SpendTrendView(APIView):
    """
    GET /api/v1/analytics/spend-trend/
    Returns monthly spend per service_type for the last 6 months.
    Response: [{month: "2026-01", service_type: "Oil Change", total: "4200.00"}, ...]
    """

    def get(self, request: Request) -> Response:
        from apps.invoices.models import Invoice

        org = _get_user_org(request.user)
        if org is None:
            return Response([])

        since = date.today() - timedelta(days=180)

        rows = (
            Invoice.objects
            .filter(organization=org, is_deleted=False, created_at__date__gte=since)
            .annotate(month=TruncMonth('created_at'))
            .values('month', 'service_type')
            .annotate(total=Sum('total_amount'))
            .order_by('month', 'service_type')
        )

        data = [
            {
                'month': r['month'].strftime('%Y-%m'),
                'service_type': r['service_type'],
                'total': str(r['total'] or Decimal('0')),
            }
            for r in rows
        ]
        return Response(data)


class FleetHealthView(APIView):
    """
    GET /api/v1/analytics/fleet-health/
    Returns vehicle status distribution and total estimated idle cost.
    """

    def get(self, request: Request) -> Response:
        from apps.anomalies.models import IdleEvent
        from apps.vehicles.models import Vehicle

        org = _get_user_org(request.user)
        if org is None:
            return Response({'status_counts': {}, 'idle_cost_total': '0'})

        status_counts = (
            Vehicle.objects
            .filter(organization=org)
            .values('status')
            .annotate(count=Count('id'))
        )

        idle_cost = (
            IdleEvent.objects
            .filter(vehicle__organization=org)
            .aggregate(total=Sum('estimated_cost'))['total'] or Decimal('0')
        )

        return Response({
            'status_counts': {row['status']: row['count'] for row in status_counts},
            'idle_cost_total': str(idle_cost),
        })
