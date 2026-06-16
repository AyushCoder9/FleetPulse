from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class ContractRate(models.Model):
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='contract_rates')
    service_type = models.CharField(max_length=100)
    max_rate = models.DecimalField(max_digits=10, decimal_places=2)
    region = models.CharField(max_length=100)

    class Meta:
        unique_together = ('organization', 'service_type', 'region')

    def __str__(self):
        return f'{self.organization} | {self.service_type} | max ${self.max_rate}'
