from django.db import models


class AnomalyFlag(models.Model):
    SEVERITIES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    invoice = models.ForeignKey('invoices.Invoice', on_delete=models.CASCADE, related_name='anomaly_flags')
    detector_name = models.CharField(max_length=100)
    reason = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITIES)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.detector_name} on invoice {self.invoice_id}'


class IdleEvent(models.Model):
    ROOT_CAUSES = [
        ('awaiting_parts', 'Awaiting Parts'),
        ('awaiting_paperwork', 'Awaiting Paperwork'),
        ('no_driver', 'No Driver Assigned'),
        ('unknown', 'Unknown'),
    ]
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='idle_events')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    root_cause = models.CharField(max_length=50, choices=ROOT_CAUSES, default='unknown')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f'{self.vehicle} idle from {self.start_time}'
