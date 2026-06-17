import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from tests.factories import (
    AnomalyFlagFactory,
    ContractRateFactory,
    InvoiceFactory,
    InvoiceLineItemFactory,
    MembershipFactory,
    OrganizationFactory,
    SupplierFactory,
    UserFactory,
    VehicleFactory,
)


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def org():
    return OrganizationFactory()


@pytest.fixture
def user(org):
    u = UserFactory()
    MembershipFactory(user=u, organization=org, role='admin')
    return u


@pytest.fixture
def auth_client(client, user):
    client.force_authenticate(user=user)
    return client


# ── Auth ──────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestAuth:
    def test_protected_endpoint_requires_auth(self, client):
        res = client.get('/api/v1/invoices/')
        assert res.status_code == status.HTTP_401_UNAUTHORIZED


# ── Invoices ──────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestInvoices:
    def _results(self, res):
        return res.data['results'] if 'results' in res.data else res.data

    def test_list_invoices_scoped_to_org(self, auth_client, org, user):
        vehicle = VehicleFactory(organization=org)
        supplier = SupplierFactory()
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier)
        other_org = OrganizationFactory()
        other_vehicle = VehicleFactory(organization=other_org)
        InvoiceFactory(organization=other_org, vehicle=other_vehicle, supplier=supplier)

        res = auth_client.get('/api/v1/invoices/')
        assert res.status_code == status.HTTP_200_OK
        assert len(self._results(res)) == 1

    def test_filter_by_status(self, auth_client, org):
        vehicle = VehicleFactory(organization=org)
        supplier = SupplierFactory()
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='flagged')
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='pending')

        res = auth_client.get('/api/v1/invoices/?status=flagged')
        assert res.status_code == status.HTTP_200_OK
        results = self._results(res)
        assert len(results) == 1
        assert results[0]['status'] == 'flagged'

    def test_approve_invoice(self, auth_client, org):
        vehicle = VehicleFactory(organization=org)
        supplier = SupplierFactory()
        invoice = InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='flagged')

        res = auth_client.post(f'/api/v1/invoices/{invoice.id}/approve/')
        assert res.status_code == status.HTTP_200_OK
        invoice.refresh_from_db()
        assert invoice.status == 'approved'

    def test_flag_invoice(self, auth_client, org):
        vehicle = VehicleFactory(organization=org)
        supplier = SupplierFactory()
        invoice = InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='pending')

        res = auth_client.post(f'/api/v1/invoices/{invoice.id}/flag/')
        assert res.status_code == status.HTTP_200_OK
        invoice.refresh_from_db()
        assert invoice.status == 'flagged'

    def test_cannot_access_other_org_invoice(self, auth_client):
        other_org = OrganizationFactory()
        other_vehicle = VehicleFactory(organization=other_org)
        other_invoice = InvoiceFactory(organization=other_org, vehicle=other_vehicle, supplier=SupplierFactory())

        res = auth_client.post(f'/api/v1/invoices/{other_invoice.id}/approve/')
        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_list_returns_supplier_name_and_vin(self, auth_client, org):
        vehicle = VehicleFactory(organization=org, vin='TESTVIN12345678')
        supplier = SupplierFactory(name='TestSupplier')
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier)

        res = auth_client.get('/api/v1/invoices/')
        assert res.status_code == status.HTTP_200_OK
        item = self._results(res)[0]
        assert item['supplier_name'] == 'TestSupplier'
        assert item['vehicle_vin'] == 'TESTVIN12345678'


# ── Vehicles ──────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestVehicles:
    def _results(self, res):
        return res.data['results'] if 'results' in res.data else res.data

    def test_list_vehicles_scoped_to_org(self, auth_client, org):
        VehicleFactory(organization=org)
        VehicleFactory(organization=org)
        VehicleFactory(organization=OrganizationFactory())

        res = auth_client.get('/api/v1/vehicles/')
        assert res.status_code == status.HTTP_200_OK
        assert len(self._results(res)) == 2

    def test_vehicle_fields(self, auth_client, org):
        VehicleFactory(organization=org, make='Honda', model='CR-V', status='idle')
        res = auth_client.get('/api/v1/vehicles/')
        v = self._results(res)[0]
        assert v['make'] == 'Honda'
        assert v['model'] == 'CR-V'
        assert v['status'] == 'idle'


# ── Suppliers ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSuppliers:
    def _results(self, res):
        return res.data['results'] if 'results' in res.data else res.data

    def test_list_suppliers(self, auth_client):
        SupplierFactory(name='Alpha')
        SupplierFactory(name='Beta')
        res = auth_client.get('/api/v1/suppliers/')
        assert res.status_code == status.HTTP_200_OK
        assert len(self._results(res)) == 2

    def test_scorecard_endpoint(self, auth_client, org):
        supplier = SupplierFactory()
        vehicle = VehicleFactory(organization=org)
        InvoiceFactory(organization=org, supplier=supplier, vehicle=vehicle, status='approved')
        InvoiceFactory(organization=org, supplier=supplier, vehicle=vehicle, status='flagged')

        res = auth_client.get(f'/api/v1/suppliers/{supplier.id}/scorecard/')
        assert res.status_code == status.HTTP_200_OK
        assert 'score' in res.data
        assert 'invoice_count' in res.data or 'total_invoices' in res.data
        assert 'flagged_count' in res.data or 'flagged_invoices' in res.data


# ── Dashboard ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestDashboard:
    def test_summary_returns_expected_keys(self, auth_client):
        res = auth_client.get('/api/v1/dashboard/summary/')
        assert res.status_code == status.HTTP_200_OK
        assert 'overcharges_caught' in res.data
        assert 'idle_cost_saved' in res.data
        assert 'flagged_invoice_count' in res.data
        assert 'avg_supplier_score' in res.data

    def test_flagged_count_reflects_org_invoices(self, auth_client, org):
        vehicle = VehicleFactory(organization=org)
        supplier = SupplierFactory()
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='flagged')
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='flagged')
        InvoiceFactory(organization=org, vehicle=vehicle, supplier=supplier, status='approved')

        res = auth_client.get('/api/v1/dashboard/summary/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['flagged_invoice_count'] == 2
