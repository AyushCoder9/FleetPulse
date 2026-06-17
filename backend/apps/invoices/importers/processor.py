"""
InvoiceImportProcessor: validates and persists rows from any importer.

Expected row keys (case-insensitive after strip):
  Required: supplier_name, vehicle_vin, service_type, total_amount
  Optional: date, line_item_desc, line_item_amount
            (for multiple line items per invoice: line_item_1_desc, line_item_1_amount, etc.)
"""
from decimal import Decimal, InvalidOperation
from typing import Any

from django.db import transaction

REQUIRED_FIELDS = {'supplier_name', 'vehicle_vin', 'service_type', 'total_amount'}


def _get(row: dict, *keys: str) -> Any:
    for k in keys:
        v = row.get(k) or row.get(k.replace('_', ' '))
        if v:
            return v
    return None


def _extract_line_items(row: dict) -> list[dict]:
    """Extract line items from row. Supports both single and numbered columns."""
    items = []

    # Single-pair format: line_item_desc / line_item_amount
    desc = _get(row, 'line_item_desc')
    amt = _get(row, 'line_item_amount')
    if desc and amt:
        items.append({'description': desc, 'amount': amt})

    # Numbered format: line_item_1_desc / line_item_1_amount, ..., line_item_N_desc / ...
    for i in range(1, 20):
        desc = _get(row, f'line_item_{i}_desc')
        amt = _get(row, f'line_item_{i}_amount')
        if not desc:
            break
        items.append({'description': desc, 'amount': amt or '0'})

    return items


class InvoiceImportProcessor:
    def __init__(self, org) -> None:
        self.org = org

    def process(self, rows: list[dict]) -> dict:
        from apps.invoices.models import Invoice, InvoiceLineItem
        from apps.invoices.tasks import reconcile_invoice
        from apps.suppliers.models import Supplier
        from apps.vehicles.models import Vehicle

        created = 0
        skipped = 0
        errors = []

        for idx, row in enumerate(rows, start=1):
            normalized = {k.lower().strip().replace(' ', '_'): v for k, v in row.items()}

            missing = REQUIRED_FIELDS - set(normalized.keys())
            if missing:
                errors.append({'row': idx, 'reason': f'Missing required fields: {", ".join(sorted(missing))}'})
                skipped += 1
                continue

            supplier_name = normalized.get('supplier_name', '').strip()
            vehicle_vin = normalized.get('vehicle_vin', '').strip()
            service_type = normalized.get('service_type', '').strip()
            total_raw = normalized.get('total_amount', '0')

            try:
                total_amount = Decimal(str(total_raw).replace(',', '').replace('$', ''))
            except InvalidOperation:
                errors.append({'row': idx, 'reason': f'Invalid total_amount: "{total_raw}"'})
                skipped += 1
                continue

            vehicle, _ = Vehicle.objects.get_or_create(
                vin=vehicle_vin,
                organization=self.org,
                defaults={'make': 'Unknown', 'model': 'Unknown', 'status': 'active', 'odometer': 0},
            )

            supplier, _ = Supplier.objects.get_or_create(
                name=supplier_name,
                defaults={'region': 'Unknown'},
            )

            line_items_data = _extract_line_items(normalized)

            try:
                with transaction.atomic():
                    invoice = Invoice.objects.create(
                        organization=self.org,
                        supplier=supplier,
                        vehicle=vehicle,
                        service_type=service_type,
                        total_amount=total_amount,
                        status='pending',
                    )
                    for li in line_items_data:
                        try:
                            li_amount = Decimal(str(li['amount']).replace(',', '').replace('$', ''))
                        except InvalidOperation:
                            li_amount = Decimal('0')
                        InvoiceLineItem.objects.create(
                            invoice=invoice,
                            description=li['description'],
                            amount=li_amount,
                        )

                reconcile_invoice.delay(invoice.pk)
                created += 1

            except Exception as exc:
                errors.append({'row': idx, 'reason': str(exc)})
                skipped += 1

        return {'created': created, 'skipped': skipped, 'errors': errors}
