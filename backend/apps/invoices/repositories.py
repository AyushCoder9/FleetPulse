from apps.core.repositories import BaseRepository

from .models import Invoice, InvoiceLineItem


class InvoiceRepository(BaseRepository[Invoice]):
    model = Invoice

    def get_by_org(self, org_id: int):
        return self.model.objects.filter(organization_id=org_id)

    def get_with_line_items(self, invoice_id: int):
        return self.model.objects.prefetch_related('line_items').get(pk=invoice_id)


class InvoiceLineItemRepository(BaseRepository[InvoiceLineItem]):
    model = InvoiceLineItem

    def get_for_invoice(self, invoice_id: int):
        return list(self.model.objects.filter(invoice_id=invoice_id))
