import csv
import io
from typing import IO

from .base import InvoiceImporter


class CSVImporter(InvoiceImporter):
    """Parse CSV files exported from fleet management systems or accounting software."""

    def parse(self, file: IO) -> list[dict]:
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8-sig')  # handle BOM from Excel CSV exports

        reader = csv.DictReader(io.StringIO(content))
        rows = []
        for row in reader:
            rows.append(self._normalize_row(dict(row)))
        return rows
