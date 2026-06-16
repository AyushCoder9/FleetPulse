from django.db import models


class TelemetryEvent(models.Model):
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='telemetry_events')
    timestamp = models.DateTimeField(db_index=True)
    ignition_status = models.BooleanField()
    odometer = models.PositiveIntegerField()
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.vehicle} @ {self.timestamp}'
