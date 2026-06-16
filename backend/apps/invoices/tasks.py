from config.celery import app


@app.task(name='invoices.reconcile_invoice', bind=True, max_retries=3)
def reconcile_invoice(self, invoice_id: int):
    try:
        from .services import InvoiceReconciliationService
        from .repositories import InvoiceRepository, InvoiceLineItemRepository
        from apps.anomalies.repositories import AnomalyFlagRepository
        from apps.suppliers.repositories import ContractRateRepository

        svc = InvoiceReconciliationService(
            invoice_repo=InvoiceRepository(),
            anomaly_repo=AnomalyFlagRepository(),
            contract_rate_repo=ContractRateRepository(),
        )
        svc.reconcile(invoice_id)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
