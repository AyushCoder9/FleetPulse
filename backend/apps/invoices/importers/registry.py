from typing import Optional, Type

from .base import InvoiceImporter
from .csv_importer import CSVImporter
from .excel_importer import ExcelImporter
from .json_importer import JSONImporter

_REGISTRY: dict[str, Type[InvoiceImporter]] = {
    'csv': CSVImporter,
    'xlsx': ExcelImporter,
    'xls': ExcelImporter,
    'json': JSONImporter,
}


def get_importer(extension: str) -> Optional[Type[InvoiceImporter]]:
    """Return the importer class for a given file extension, or None if unsupported."""
    return _REGISTRY.get(extension.lower().lstrip('.'))


def supported_extensions() -> list[str]:
    return list(_REGISTRY.keys())
