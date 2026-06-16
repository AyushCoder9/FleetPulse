from decimal import Decimal
from dataclasses import dataclass
import pytest

from apps.anomalies.detectors import (
    RateCardVarianceDetector,
    DuplicateLineItemDetector,
    DetectorRegistry,
    Flag,
)


@dataclass
class MockInvoice:
    total_amount: Decimal
    organization_id: int = 1
    service_type: str = 'Oil Change'


@dataclass
class MockContractRate:
    max_rate: Decimal


@dataclass
class MockLineItem:
    description: str
    amount: Decimal


class TestRateCardVarianceDetector:
    def setup_method(self):
        self.detector = RateCardVarianceDetector()

    def test_no_flag_within_threshold(self):
        invoice = MockInvoice(total_amount=Decimal('150.00'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        flags = self.detector.detect(invoice, [], rate)
        assert flags == []

    def test_no_flag_just_under_threshold(self):
        invoice = MockInvoice(total_amount=Decimal('164.99'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        flags = self.detector.detect(invoice, [], rate)
        assert flags == []

    def test_flag_medium_severity_at_threshold(self):
        invoice = MockInvoice(total_amount=Decimal('180.00'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        flags = self.detector.detect(invoice, [], rate)
        assert len(flags) == 1
        assert flags[0].detector_name == 'rate_card_variance'
        assert flags[0].severity == 'medium'

    def test_flag_high_severity_over_30_pct(self):
        invoice = MockInvoice(total_amount=Decimal('220.00'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        flags = self.detector.detect(invoice, [], rate)
        assert len(flags) == 1
        assert flags[0].severity == 'high'

    def test_no_flag_without_contract_rate(self):
        invoice = MockInvoice(total_amount=Decimal('9999.00'))
        flags = self.detector.detect(invoice, [], contract_rate=None)
        assert flags == []

    def test_flag_reason_contains_percentage(self):
        invoice = MockInvoice(total_amount=Decimal('195.00'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        flags = self.detector.detect(invoice, [], rate)
        assert '30.0%' in flags[0].reason


class TestDuplicateLineItemDetector:
    def setup_method(self):
        self.detector = DuplicateLineItemDetector()

    def test_no_flag_unique_items(self):
        items = [
            MockLineItem('Labor', Decimal('100.00')),
            MockLineItem('Parts', Decimal('50.00')),
        ]
        invoice = MockInvoice(total_amount=Decimal('150.00'))
        flags = self.detector.detect(invoice, items)
        assert flags == []

    def test_flag_duplicate_item(self):
        items = [
            MockLineItem('Labor', Decimal('100.00')),
            MockLineItem('Parts', Decimal('50.00')),
            MockLineItem('Labor', Decimal('100.00')),
        ]
        invoice = MockInvoice(total_amount=Decimal('250.00'))
        flags = self.detector.detect(invoice, items)
        assert len(flags) == 1
        assert flags[0].detector_name == 'duplicate_line_item'
        assert flags[0].severity == 'medium'

    def test_case_insensitive_description(self):
        items = [
            MockLineItem('labor', Decimal('100.00')),
            MockLineItem('LABOR', Decimal('100.00')),
        ]
        invoice = MockInvoice(total_amount=Decimal('200.00'))
        flags = self.detector.detect(invoice, items)
        assert len(flags) == 1

    def test_same_description_different_amount_no_flag(self):
        items = [
            MockLineItem('Labor', Decimal('100.00')),
            MockLineItem('Labor', Decimal('75.00')),
        ]
        invoice = MockInvoice(total_amount=Decimal('175.00'))
        flags = self.detector.detect(invoice, items)
        assert flags == []

    def test_empty_line_items(self):
        invoice = MockInvoice(total_amount=Decimal('0.00'))
        flags = self.detector.detect(invoice, [])
        assert flags == []


class TestDetectorRegistry:
    def test_registry_runs_all_detectors(self):
        registry = DetectorRegistry()
        registry.register(RateCardVarianceDetector())
        registry.register(DuplicateLineItemDetector())

        invoice = MockInvoice(total_amount=Decimal('220.00'))
        rate = MockContractRate(max_rate=Decimal('150.00'))
        items = [
            MockLineItem('Labor', Decimal('110.00')),
            MockLineItem('Labor', Decimal('110.00')),
        ]
        flags = registry.run_all(invoice, items, rate)
        assert len(flags) == 2
        names = {f.detector_name for f in flags}
        assert 'rate_card_variance' in names
        assert 'duplicate_line_item' in names

    def test_empty_registry(self):
        registry = DetectorRegistry()
        invoice = MockInvoice(total_amount=Decimal('9999.00'))
        flags = registry.run_all(invoice, [])
        assert flags == []
