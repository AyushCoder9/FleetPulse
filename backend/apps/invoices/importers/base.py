import abc
from typing import IO


class InvoiceImporter(abc.ABC):
    """
    Abstract base for all invoice file importers.
    Each subclass reads a file object and returns a list of raw row dicts
    with at least: supplier_name, vehicle_vin, service_type, total_amount.
    Optional: date, line_item_desc, line_item_amount (may repeat).
    """

    @abc.abstractmethod
    def parse(self, file: IO) -> list[dict]:
        """Parse file into a list of row dicts."""
        ...

    @staticmethod
    def _normalize_row(row: dict) -> dict:
        """Strip whitespace from all string values."""
        return {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
