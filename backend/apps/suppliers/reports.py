import csv
import io
from typing import Any


class CSVReport:
    def generate(self, supplier: Any) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Name', 'Region'])
        writer.writerow([supplier.id, supplier.name, supplier.region])
        return output.getvalue()


class PDFReport:
    def generate(self, supplier: Any) -> bytes:
        # Placeholder — real impl would use reportlab or weasyprint
        content = f'Supplier Scorecard\nName: {supplier.name}\nRegion: {supplier.region}\n'
        return content.encode('utf-8')


class ReportFactory:
    @staticmethod
    def create(format: str) -> 'CSVReport | PDFReport':
        if format == 'csv':
            return CSVReport()
        if format == 'pdf':
            return PDFReport()
        raise ValueError(f'Unknown report format: {format}')
