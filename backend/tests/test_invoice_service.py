from dataclasses import dataclass, field
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from apps.anomalies.detectors import Flag
from apps.invoices.services import InvoiceReconciliationService


@dataclass
class MockLineItem:
    description: str
    amount: Decimal


@dataclass
class MockInvoice:
    id: int
    organization_id: int
    service_type: str
    total_amount: Decimal
    status: str = 'pending'
    _line_items: list = field(default_factory=list)

    @property
    def line_items(self):
        class FakeQS:
            def __init__(self, items):
                self._items = items
            def all(self):
                return self._items
        return FakeQS(self._line_items)


@dataclass
class MockContractRate:
    max_rate: Decimal


class TestInvoiceReconciliationService:
    def _make_repos(self, invoice, contract_rate=None):
        invoice_repo = MagicMock()
        invoice_repo.get_with_line_items.return_value = invoice

        anomaly_repo = MagicMock()
        anomaly_repo.create_from_flag.side_effect = lambda invoice_id, flag: MagicMock(
            detector_name=flag.detector_name,
            severity=flag.severity,
        )

        contract_rate_repo = MagicMock()
        contract_rate_repo.get_for_invoice.return_value = contract_rate

        return invoice_repo, anomaly_repo, contract_rate_repo

    def test_no_anomalies_no_flags_created(self):
        invoice = MockInvoice(
            id=1,
            organization_id=1,
            service_type='Oil Change',
            total_amount=Decimal('140.00'),
            _line_items=[MockLineItem('Labor', Decimal('140.00'))],
        )
        contract_rate = MockContractRate(max_rate=Decimal('150.00'))
        invoice_repo, anomaly_repo, contract_rate_repo = self._make_repos(invoice, contract_rate)

        svc = InvoiceReconciliationService(invoice_repo, anomaly_repo, contract_rate_repo)
        flags = svc.reconcile(1)

        assert flags == []
        anomaly_repo.create_from_flag.assert_not_called()
        invoice_repo.update.assert_not_called()

    def test_rate_variance_creates_flag_and_updates_status(self):
        invoice = MockInvoice(
            id=2,
            organization_id=1,
            service_type='Oil Change',
            total_amount=Decimal('220.00'),
            _line_items=[MockLineItem('Labor', Decimal('220.00'))],
        )
        contract_rate = MockContractRate(max_rate=Decimal('150.00'))
        invoice_repo, anomaly_repo, contract_rate_repo = self._make_repos(invoice, contract_rate)

        svc = InvoiceReconciliationService(invoice_repo, anomaly_repo, contract_rate_repo)
        flags = svc.reconcile(2)

        assert len(flags) == 1
        anomaly_repo.create_from_flag.assert_called_once()
        invoice_repo.update.assert_called_once_with(invoice, status='flagged')

    def test_duplicate_line_items_creates_flag(self):
        items = [
            MockLineItem('Labor', Decimal('100.00')),
            MockLineItem('Labor', Decimal('100.00')),
        ]
        invoice = MockInvoice(
            id=3,
            organization_id=1,
            service_type='Brake Pads',
            total_amount=Decimal('200.00'),
            _line_items=items,
        )
        contract_rate = MockContractRate(max_rate=Decimal('400.00'))
        invoice_repo, anomaly_repo, contract_rate_repo = self._make_repos(invoice, contract_rate)

        svc = InvoiceReconciliationService(invoice_repo, anomaly_repo, contract_rate_repo)
        flags = svc.reconcile(3)

        assert len(flags) == 1
        assert flags[0].detector_name == 'duplicate_line_item'

    def test_multiple_anomalies_all_flags_created(self):
        items = [
            MockLineItem('Labor', Decimal('110.00')),
            MockLineItem('Labor', Decimal('110.00')),
        ]
        invoice = MockInvoice(
            id=4,
            organization_id=1,
            service_type='Oil Change',
            total_amount=Decimal('220.00'),
            _line_items=items,
        )
        contract_rate = MockContractRate(max_rate=Decimal('150.00'))
        invoice_repo, anomaly_repo, contract_rate_repo = self._make_repos(invoice, contract_rate)

        svc = InvoiceReconciliationService(invoice_repo, anomaly_repo, contract_rate_repo)
        flags = svc.reconcile(4)

        assert len(flags) == 2
        assert anomaly_repo.create_from_flag.call_count == 2

    def test_no_contract_rate_skips_rate_check(self):
        invoice = MockInvoice(
            id=5,
            organization_id=1,
            service_type='Unknown Service',
            total_amount=Decimal('9999.00'),
            _line_items=[MockLineItem('Parts', Decimal('9999.00'))],
        )
        invoice_repo, anomaly_repo, contract_rate_repo = self._make_repos(invoice, contract_rate=None)

        svc = InvoiceReconciliationService(invoice_repo, anomaly_repo, contract_rate_repo)
        flags = svc.reconcile(5)

        assert flags == []
