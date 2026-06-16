from django.conf import settings
from django.db import models


class Organization(models.Model):
    name = models.CharField(max_length=255)
    plan = models.CharField(max_length=50, default='starter')
    is_demo = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Membership(models.Model):
    ROLES = [('admin', 'Admin'), ('ops', 'Ops'), ('client', 'Client')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLES)

    class Meta:
        unique_together = ('user', 'organization')

    def __str__(self):
        return f'{self.user} @ {self.organization} ({self.role})'
