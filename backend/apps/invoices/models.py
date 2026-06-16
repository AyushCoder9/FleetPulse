from django.db import models


class Invoice(models.Model):
    STATUSES = [('pending', 'Pending'), ('flagged', 'Flagged'), ('approved', 'Approved')]
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='invoices')
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE, related_name='invoices')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='invoices')
    service_type = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUSES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Invoice #{self.pk} - {self.service_type} (${self.total_amount})'


class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.description} - ${self.amount}'
