import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')


class OrganizationFactory(DjangoModelFactory):
    class Meta:
        model = 'organizations.Organization'

    name = factory.Sequence(lambda n: f'Org {n}')
    plan = 'starter'


class MembershipFactory(DjangoModelFactory):
    class Meta:
        model = 'organizations.Membership'

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)
    role = 'admin'


class SupplierFactory(DjangoModelFactory):
    class Meta:
        model = 'suppliers.Supplier'

    name = factory.Sequence(lambda n: f'Supplier {n}')
    region = 'Northeast'


class ContractRateFactory(DjangoModelFactory):
    class Meta:
        model = 'suppliers.ContractRate'

    organization = factory.SubFactory(OrganizationFactory)
    service_type = 'Oil Change'
    max_rate = Decimal('150.00')
    region = 'All'


class VehicleFactory(DjangoModelFactory):
    class Meta:
        model = 'vehicles.Vehicle'

    organization = factory.SubFactory(OrganizationFactory)
    vin = factory.Sequence(lambda n: f'VIN{n:014d}')
    make = 'Toyota'
    model = 'Camry'
    status = 'active'
    odometer = 50000


class InvoiceFactory(DjangoModelFactory):
    class Meta:
        model = 'invoices.Invoice'

    organization = factory.SubFactory(OrganizationFactory)
    supplier = factory.SubFactory(SupplierFactory)
    vehicle = factory.SubFactory(VehicleFactory)
    service_type = 'Oil Change'
    total_amount = Decimal('140.00')
    status = 'pending'


class InvoiceLineItemFactory(DjangoModelFactory):
    class Meta:
        model = 'invoices.InvoiceLineItem'

    invoice = factory.SubFactory(InvoiceFactory)
    description = 'Labor'
    amount = Decimal('140.00')


class AnomalyFlagFactory(DjangoModelFactory):
    class Meta:
        model = 'anomalies.AnomalyFlag'

    invoice = factory.SubFactory(InvoiceFactory)
    detector_name = 'rate_card_variance'
    reason = 'Invoice 25% above contracted rate'
    severity = 'medium'
    resolved = False
