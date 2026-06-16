from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Invoice


@receiver(post_save, sender=Invoice)
def invoice_created(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        from .tasks import reconcile_invoice
        reconcile_invoice.delay(instance.id)
