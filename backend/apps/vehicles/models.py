from django.db import models


class Vehicle(models.Model):
    STATUSES = [('active', 'Active'), ('idle', 'Idle'), ('maintenance', 'Maintenance')]
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='vehicles')
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUSES, default='active')
    odometer = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.make} {self.model} ({self.vin})'
