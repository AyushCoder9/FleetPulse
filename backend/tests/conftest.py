import os

import django
import pytest

os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key-not-for-prod')
os.environ.setdefault('DATABASE_URL', 'sqlite://:memory:')
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')


@pytest.fixture(autouse=True)
def _disconnect_reconcile_signal(settings):
    """Prevent post_save signal from auto-running reconcile during tests.

    Service-level tests call reconcile explicitly; API tests only verify
    status filtering and should not be affected by detector side-effects.
    """
    from django.db.models.signals import post_save

    # Guard: app registry may not be ready before django.setup()
    try:
        from apps.invoices.models import Invoice
        from apps.invoices.signals import invoice_created
        post_save.disconnect(invoice_created, sender=Invoice)
        yield
        post_save.connect(invoice_created, sender=Invoice)
    except Exception:
        yield
