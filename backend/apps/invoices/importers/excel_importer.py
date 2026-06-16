from typing import IO

from .base import InvoiceImporter


class ExcelImporter(InvoiceImporter):
    """
    Parse Excel files (.xlsx via openpyxl, .xls via xlrd).
    The first row is treated as the header row.
    """

    def parse(self, file: IO) -> list[dict]:
        content = file.read()
        filename = getattr(file, 'name', '')

        if filename.endswith('.xls'):
            return self._parse_xls(content)
        return self._parse_xlsx(content)

    def _parse_xlsx(self, content: bytes) -> list[dict]:
        import io

        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []

        headers = [str(h).strip() if h is not None else '' for h in rows[0]]
        result = []
        for row in rows[1:]:
            if all(v is None for v in row):
                continue
            raw = {headers[i]: (str(v).strip() if v is not None else '') for i, v in enumerate(row)}
            result.append(self._normalize_row(raw))
        return result

    def _parse_xls(self, content: bytes) -> list[dict]:
        import io

        import xlrd

        wb = xlrd.open_workbook(file_contents=content)
        ws = wb.sheet_by_index(0)
        if ws.nrows < 2:
            return []

        headers = [str(ws.cell_value(0, c)).strip() for c in range(ws.ncols)]
        result = []
        for r in range(1, ws.nrows):
            raw = {headers[c]: str(ws.cell_value(r, c)).strip() for c in range(ws.ncols)}
            result.append(self._normalize_row(raw))
        return result
