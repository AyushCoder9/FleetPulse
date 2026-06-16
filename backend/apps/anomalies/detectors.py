import abc
import math
from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal


@dataclass
class Flag:
    detector_name: str
    reason: str
    severity: str  # low / medium / high


class AnomalyDetector(abc.ABC):
    @abc.abstractmethod
    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        ...


class RateCardVarianceDetector(AnomalyDetector):
    """Flag invoices that exceed the contracted max rate by more than 10%."""

    THRESHOLD = Decimal('0.10')

    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        if contract_rate is None:
            return []
        max_rate = Decimal(str(contract_rate.max_rate))
        total = Decimal(str(invoice.total_amount))
        if total > max_rate * (1 + self.THRESHOLD):
            pct = ((total - max_rate) / max_rate * 100).quantize(Decimal('0.1'))
            severity = 'high' if pct > 30 else 'medium'
            return [Flag(
                detector_name='rate_card_variance',
                reason=f'Invoice {pct}% above contracted max rate of ${max_rate}',
                severity=severity,
            )]
        return []


class DuplicateLineItemDetector(AnomalyDetector):
    """Flag invoices with duplicate (description, amount) line items."""

    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        seen: dict = {}
        flags: list[Flag] = []
        for item in line_items:
            key = (item.description.lower().strip(), Decimal(str(item.amount)))
            if key in seen:
                flags.append(Flag(
                    detector_name='duplicate_line_item',
                    reason=f'Duplicate line item: "{item.description}" (${item.amount})',
                    severity='medium',
                ))
            seen[key] = True
        return flags


class StatisticalOutlierDetector(AnomalyDetector):
    """
    Flag invoices whose total_amount is more than 2 standard deviations above
    the 90-day average for the same (organization, service_type).
    Requires at least 10 historical invoices to activate (avoids false positives
    on new organizations with sparse data).
    """

    MIN_SAMPLES = 10
    SIGMA_THRESHOLD = 2.0

    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        from django.utils import timezone

        from apps.invoices.models import Invoice

        org = getattr(invoice, 'organization', None)
        if org is None:
            return []

        since = timezone.now() - timedelta(days=90)
        peers = list(
            Invoice.objects
            .filter(
                organization=org,
                service_type=invoice.service_type,
                is_deleted=False,
                created_at__gte=since,
            )
            .exclude(pk=invoice.pk)
            .values_list('total_amount', flat=True)
        )

        if len(peers) < self.MIN_SAMPLES:
            return []

        amounts = [float(a) for a in peers]
        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std = math.sqrt(variance) if variance > 0 else 0

        if std == 0:
            return []

        total = float(invoice.total_amount)
        sigma = (total - mean) / std

        if sigma >= self.SIGMA_THRESHOLD:
            rounded_sigma = round(sigma, 1)
            return [Flag(
                detector_name='statistical_outlier',
                reason=(
                    f'Invoice is {rounded_sigma}σ above the 90-day average '
                    f'(${mean:.2f}) for {invoice.service_type}'
                ),
                severity='high' if sigma >= 3.0 else 'medium',
            )]
        return []


class FrequencyAnomalyDetector(AnomalyDetector):
    """
    Flag invoices where the same vehicle received the same service_type
    within the last 7 days (likely duplicate billing).
    """

    WINDOW_DAYS = 7

    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        from django.utils import timezone

        from apps.invoices.models import Invoice

        vehicle = getattr(invoice, 'vehicle', None)
        if vehicle is None:
            return []

        since = timezone.now() - timedelta(days=self.WINDOW_DAYS)
        duplicate = (
            Invoice.objects
            .filter(
                vehicle=vehicle,
                service_type=invoice.service_type,
                is_deleted=False,
                created_at__gte=since,
            )
            .exclude(pk=invoice.pk)
            .exists()
        )

        if duplicate:
            return [Flag(
                detector_name='frequency_anomaly',
                reason=(
                    f'Duplicate service: {invoice.service_type} on vehicle '
                    f'{invoice.vehicle.vin} within {self.WINDOW_DAYS} days'
                ),
                severity='medium',
            )]
        return []


class NewVendorDetector(AnomalyDetector):
    """
    Flag invoices from suppliers with fewer than 3 historical invoices —
    new vendors warrant extra scrutiny.
    """

    MIN_HISTORY = 3

    def detect(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        from apps.invoices.models import Invoice

        supplier = getattr(invoice, 'supplier', None)
        if supplier is None:
            return []

        count = (
            Invoice.objects
            .filter(supplier=supplier, is_deleted=False)
            .exclude(pk=invoice.pk)
            .count()
        )

        if count < self.MIN_HISTORY:
            return [Flag(
                detector_name='new_vendor',
                reason=f'First invoice from new supplier: {invoice.supplier.name}',
                severity='low',
            )]
        return []


class DetectorRegistry:
    def __init__(self) -> None:
        self._detectors: list[AnomalyDetector] = []

    def register(self, detector: AnomalyDetector) -> 'DetectorRegistry':
        self._detectors.append(detector)
        return self

    def run_all(self, invoice: object, line_items: list, contract_rate: object = None) -> list[Flag]:
        flags: list[Flag] = []
        for detector in self._detectors:
            flags.extend(detector.detect(invoice, line_items, contract_rate))
        return flags


registry = DetectorRegistry()
registry.register(RateCardVarianceDetector())
registry.register(DuplicateLineItemDetector())
registry.register(StatisticalOutlierDetector())
registry.register(FrequencyAnomalyDetector())
registry.register(NewVendorDetector())
