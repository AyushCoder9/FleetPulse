import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

fake = Faker()
User = get_user_model()

SERVICE_TYPES = [
    'Oil Change',
    'Brake Pads',
    'Tire Rotation',
    'AC Repair',
    'Transmission Service',
    'Battery Replacement',
    'Wiper Blades',
    'Air Filter',
    'Coolant Flush',
    'Suspension Check',
]

MAKES_MODELS = [
    ('Toyota', 'Camry'),
    ('Toyota', 'Corolla'),
    ('Ford', 'Transit'),
    ('Ford', 'F-150'),
    ('Honda', 'CR-V'),
    ('Chevrolet', 'Express'),
    ('Ram', 'ProMaster'),
    ('Mercedes', 'Sprinter'),
    ('Nissan', 'NV Cargo'),
    ('GMC', 'Savana'),
]

ROOT_CAUSES = ['awaiting_parts', 'awaiting_paperwork', 'no_driver', 'unknown']


class Command(BaseCommand):
    help = 'Seed demo data for FleetPulse'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Re-seed even if data exists')

    def handle(self, *args, **options):
        from apps.organizations.models import Organization, Membership
        from apps.vehicles.models import Vehicle
        from apps.telemetry.models import TelemetryEvent
        from apps.suppliers.models import Supplier, ContractRate
        from apps.invoices.models import Invoice, InvoiceLineItem
        from apps.anomalies.models import AnomalyFlag, IdleEvent

        if Organization.objects.count() > 0 and not options['force']:
            self.stdout.write(self.style.WARNING('Data already exists. Use --force to re-seed.'))
            return

        if options['force']:
            self.stdout.write('Clearing existing data...')
            AnomalyFlag.objects.all().delete()
            IdleEvent.objects.all().delete()
            InvoiceLineItem.objects.all().delete()
            Invoice.objects.all().delete()
            TelemetryEvent.objects.all().delete()
            Vehicle.objects.all().delete()
            ContractRate.objects.all().delete()
            Supplier.objects.all().delete()
            Membership.objects.all().delete()
            Organization.objects.all().delete()

        self.stdout.write('Seeding organizations...')
        org_names = ['Acme Fleet Solutions', 'Metro Logistics Co', 'SunBelt Transport']
        orgs = []
        for name in org_names:
            org = Organization.objects.create(name=name, plan=random.choice(['starter', 'pro', 'enterprise']))
            orgs.append(org)

        # Create users + memberships
        for i, org in enumerate(orgs):
            username = f'admin_{i+1}'
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'admin{i+1}@{org.name.lower().replace(" ", "")}.com',
                    password='password123',
                )
                Membership.objects.create(user=user, organization=org, role='admin')

        # Link existing superuser (admin) to first org so API queries return data
        superuser = User.objects.filter(username='admin').first()
        if superuser and not Membership.objects.filter(user=superuser).exists():
            Membership.objects.create(user=superuser, organization=orgs[0], role='admin')

        self.stdout.write('Seeding suppliers...')
        supplier_data = [
            ('AutoCare Pro', 'Southeast'),
            ('QuickFix Garage', 'Northeast'),
            ('FleetServ Inc', 'Midwest'),
            ('MechPro Services', 'Southwest'),
            ('National Auto Group', 'West'),
            ('TireKing', 'Northwest'),
            ('EliteMech', 'Mid-Atlantic'),
            ('Budget Auto Repair', 'Southeast'),
        ]
        suppliers = []
        for name, region in supplier_data:
            s = Supplier.objects.create(name=name, region=region)
            suppliers.append(s)

        self.stdout.write('Seeding contract rates...')
        base_rates = {
            'Oil Change': Decimal('150.00'),
            'Brake Pads': Decimal('400.00'),
            'Tire Rotation': Decimal('80.00'),
            'AC Repair': Decimal('600.00'),
            'Transmission Service': Decimal('1200.00'),
            'Battery Replacement': Decimal('200.00'),
            'Wiper Blades': Decimal('60.00'),
            'Air Filter': Decimal('50.00'),
            'Coolant Flush': Decimal('120.00'),
            'Suspension Check': Decimal('250.00'),
        }
        for org in orgs:
            for service_type, max_rate in base_rates.items():
                ContractRate.objects.create(
                    organization=org,
                    service_type=service_type,
                    max_rate=max_rate,
                    region='All',
                )

        self.stdout.write('Seeding vehicles...')
        vehicles = []
        for i in range(40):
            org = orgs[i % len(orgs)]
            make, model = random.choice(MAKES_MODELS)
            vin = fake.bothify(text='???##??#?##??###').upper()[:17]
            # ensure unique
            while Vehicle.objects.filter(vin=vin).exists():
                vin = fake.bothify(text='???##??#?##??###').upper()[:17]
            status = random.choices(['active', 'idle', 'maintenance'], weights=[70, 20, 10])[0]
            v = Vehicle.objects.create(
                organization=org,
                vin=vin,
                make=make,
                model=model,
                status=status,
                odometer=random.randint(10000, 150000),
            )
            vehicles.append(v)

        self.stdout.write('Seeding telemetry events...')
        now = timezone.now()
        for vehicle in vehicles:
            for weeks_back in range(26):  # 6 months
                event_time = now - timedelta(weeks=weeks_back, hours=random.randint(0, 23))
                TelemetryEvent.objects.create(
                    vehicle=vehicle,
                    timestamp=event_time,
                    ignition_status=random.choice([True, True, True, False]),
                    odometer=vehicle.odometer + (26 - weeks_back) * random.randint(200, 600),
                    lat=Decimal(str(round(fake.latitude(), 6))),
                    lng=Decimal(str(round(fake.longitude(), 6))),
                )

        self.stdout.write('Seeding invoices...')
        invoices_created = []
        for i in range(200):
            org = random.choice(orgs)
            supplier = random.choice(suppliers)
            vehicle = random.choice([v for v in vehicles if v.organization == org] or vehicles)
            service_type = random.choice(SERVICE_TYPES)
            is_anomalous = i < 30  # first 30 (~15%) are anomalous

            contract_rate = ContractRate.objects.filter(
                organization=org, service_type=service_type
            ).first()
            base_rate = contract_rate.max_rate if contract_rate else Decimal('200.00')

            if is_anomalous and i % 2 == 0:
                # rate overcharge anomaly
                multiplier = Decimal(str(round(random.uniform(1.25, 1.60), 2)))
                total_amount = (base_rate * multiplier).quantize(Decimal('0.01'))
                status = 'flagged'
            else:
                total_amount = (base_rate * Decimal(str(round(random.uniform(0.85, 1.00), 2)))).quantize(Decimal('0.01'))
                status = random.choices(['pending', 'approved', 'flagged'], weights=[40, 50, 10])[0]

            created_at = now - timedelta(days=random.randint(0, 180))
            inv = Invoice.objects.create(
                organization=org,
                supplier=supplier,
                vehicle=vehicle,
                service_type=service_type,
                total_amount=total_amount,
                status=status,
            )
            # override created_at via update to bypass auto_now_add
            Invoice.objects.filter(pk=inv.pk).update(created_at=created_at)
            inv.refresh_from_db()
            invoices_created.append((inv, is_anomalous, contract_rate))

            # line items
            num_items = random.randint(1, 4)
            item_amounts = []
            remaining = total_amount
            for j in range(num_items):
                if j == num_items - 1:
                    amt = remaining
                else:
                    amt = (remaining * Decimal(str(round(random.uniform(0.2, 0.6), 2)))).quantize(Decimal('0.01'))
                    remaining -= amt
                desc = fake.bs().title()
                item_amounts.append((desc, amt))
                InvoiceLineItem.objects.create(invoice=inv, description=desc, amount=amt)

            # duplicate line item anomaly for odd anomalous invoices
            if is_anomalous and i % 2 == 1 and item_amounts:
                first_desc, first_amt = item_amounts[0]
                InvoiceLineItem.objects.create(invoice=inv, description=first_desc, amount=first_amt)

        self.stdout.write('Seeding anomaly flags...')
        for inv, is_anomalous, contract_rate in invoices_created:
            if inv.status == 'flagged':
                if contract_rate and inv.total_amount > contract_rate.max_rate * Decimal('1.10'):
                    pct = ((inv.total_amount - contract_rate.max_rate) / contract_rate.max_rate * 100).quantize(Decimal('0.1'))
                    severity = 'high' if pct > Decimal('30') else 'medium'
                    AnomalyFlag.objects.create(
                        invoice=inv,
                        detector_name='rate_card_variance',
                        reason=f'Invoice {pct}% above contracted max rate of ${contract_rate.max_rate}',
                        severity=severity,
                        resolved=False,
                    )
                line_items = list(inv.line_items.all())
                seen: dict = {}
                for item in line_items:
                    key = (item.description.lower().strip(), item.amount)
                    if key in seen:
                        AnomalyFlag.objects.create(
                            invoice=inv,
                            detector_name='duplicate_line_item',
                            reason=f'Duplicate line item: "{item.description}" (${item.amount})',
                            severity='medium',
                            resolved=False,
                        )
                    seen[key] = True

        self.stdout.write('Seeding idle events...')
        idle_vehicles = [v for v in vehicles if v.status == 'idle']
        for vehicle in idle_vehicles:
            days_idle = random.randint(2, 14)
            start_time = now - timedelta(days=days_idle)
            IdleEvent.objects.create(
                vehicle=vehicle,
                start_time=start_time,
                end_time=None,
                root_cause=random.choice(ROOT_CAUSES),
                estimated_cost=Decimal(str(days_idle * 150)),
            )

        self.stdout.write(self.style.SUCCESS(
            f'Done! Created {len(orgs)} orgs, {len(suppliers)} suppliers, '
            f'{len(vehicles)} vehicles, 200 invoices.'
        ))
