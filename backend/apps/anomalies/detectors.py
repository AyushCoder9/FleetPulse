import abc
from dataclasses import dataclass
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
