from django.conf import settings
from django.db import models


class Invoice(models.Model):
    STATUSES = [('pending', 'Pending'), ('flagged', 'Flagged'), ('approved', 'Approved')]
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='invoices')
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE, related_name='invoices')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='invoices')
    service_type = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUSES, default='pending')
    is_deleted = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='approved_invoices',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'Invoice #{self.pk} - {self.service_type} (${self.total_amount})'


class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.description} - ${self.amount}'
