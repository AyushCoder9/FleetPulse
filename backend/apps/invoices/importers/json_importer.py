import json
from typing import IO

from .base import InvoiceImporter


class JSONImporter(InvoiceImporter):
    """
    Parse JSON invoice files.
    Accepts two shapes:
      - {"invoices": [...]}   — object with invoices key
      - [...]                 — flat array of invoice objects
    """

    def parse(self, file: IO) -> list[dict]:
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8')

        data = json.loads(content)

        if isinstance(data, dict):
            rows = data.get('invoices', data.get('data', []))
        elif isinstance(data, list):
            rows = data
        else:
            raise ValueError('JSON must be an array or an object with an "invoices" key')

        if not isinstance(rows, list):
            raise ValueError('JSON invoices value must be an array')

        return [self._normalize_row(r) for r in rows if isinstance(r, dict)]
