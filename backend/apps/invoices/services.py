class InvoiceReconciliationService:
    def __init__(self, invoice_repo, anomaly_repo, contract_rate_repo):
        self.invoice_repo = invoice_repo
        self.anomaly_repo = anomaly_repo
        self.contract_rate_repo = contract_rate_repo

    def reconcile(self, invoice_id: int) -> list:
        from apps.anomalies.detectors import registry

        invoice = self.invoice_repo.get_with_line_items(invoice_id)
        line_items = list(invoice.line_items.all())
        contract_rate = self.contract_rate_repo.get_for_invoice(
            org_id=invoice.organization_id,
            service_type=invoice.service_type,
        )

        flags = registry.run_all(invoice, line_items, contract_rate)

        created_flags = []
        for flag in flags:
            anomaly = self.anomaly_repo.create_from_flag(invoice.id, flag)
            created_flags.append(anomaly)

        if flags:
            self.invoice_repo.update(invoice, status='flagged')

        return created_flags
