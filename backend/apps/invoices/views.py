from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invoice
from .serializers import InvoiceListSerializer, InvoiceSerializer


def _get_user_org(user):
    membership = user.memberships.select_related('organization').first()
    return membership.organization if membership else None


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = (
            Invoice.objects
            .filter(
                organization__memberships__user=self.request.user,
                is_deleted=False,
            )
            .select_related('supplier', 'vehicle')
            .prefetch_related('line_items', 'anomaly_flags')
            .order_by('-created_at')
        )
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
        invoice.approved_by = request.user
        invoice.approved_at = timezone.now()
        invoice.save(update_fields=['status', 'approved_by', 'approved_at'])
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'flagged'
        invoice.save(update_fields=['status'])
        return Response({'status': 'flagged'})

    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        invoice = self.get_object()
        invoice.is_deleted = True
        invoice.save(update_fields=['is_deleted'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_soft_delete(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({'error': 'ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

        org = _get_user_org(request.user)
        deleted = (
            Invoice.objects
            .filter(id__in=ids, organization=org, is_deleted=False)
            .update(is_deleted=True)
        )
        return Response({'deleted': deleted})

    @action(detail=False, methods=['post'], url_path='delete-all')
    def delete_all(self, request):
        org = _get_user_org(request.user)
        if org is None:
            return Response({'error': 'No organization found'}, status=status.HTTP_400_BAD_REQUEST)
        deleted = Invoice.objects.filter(organization=org, is_deleted=False).update(is_deleted=True)
        return Response({'deleted': deleted})

    @action(detail=False, methods=['post'], url_path='bulk-approve')
    def bulk_approve(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({'error': 'ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

        org = _get_user_org(request.user)
        updated = (
            Invoice.objects
            .filter(id__in=ids, organization=org, is_deleted=False)
            .update(status='approved', approved_by=request.user, approved_at=timezone.now())
        )
        return Response({'approved': updated})

    @action(
        detail=False,
        methods=['post'],
        url_path='import',
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def import_invoices(self, request):
        org = _get_user_org(request.user)
        if org is None:
            return Response({'error': 'No organization found'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES.get('file')
        if file is None:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        max_size_bytes = 10 * 1024 * 1024  # 10 MB
        if file.size > max_size_bytes:
            return Response({'error': 'File exceeds 10 MB limit'}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name or ''
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

        try:
            from .importers.registry import get_importer
            importer_cls = get_importer(ext)
            if importer_cls is None:
                return Response(
                    {'error': f'Unsupported file type ".{ext}". Supported: csv, xlsx, xls, json'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            importer = importer_cls()
            rows = importer.parse(file)

            from .importers.processor import InvoiceImportProcessor
            result = InvoiceImportProcessor(org).process(rows)
            return Response(result, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
