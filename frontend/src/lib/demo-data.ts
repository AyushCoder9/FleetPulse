/* Central demo dataset — used by all /demo/* pages */

/* ── Suppliers ────────────────────────────────────────────────────────── */
export const DEMO_SUPPLIERS_RAW = [
  { id: 1, name: 'QuickFix Garage',   region: 'US-West',    total: 48, flagged: 2,  spend: 4320  },
  { id: 2, name: 'AutoCare Pro',      region: 'US-East',    total: 65, flagged: 8,  spend: 9750  },
  { id: 3, name: 'MechPro Services',  region: 'US-Central', total: 72, flagged: 14, spend: 14400 },
  { id: 4, name: 'FleetServ Inc',     region: 'US-South',   total: 43, flagged: 9,  spend: 8450  },
  { id: 5, name: 'Bridgestone Fleet', region: 'US-West',    total: 31, flagged: 11, spend: 5890  },
]

export const DEMO_SUPPLIERS = DEMO_SUPPLIERS_RAW.map(s => ({
  ...s,
  score: Math.round((1 - s.flagged / s.total) * 100),
  flag_rate: `${Math.round((s.flagged / s.total) * 100)}%`,
})).sort((a, b) => b.score - a.score)

export const AVG_SUPPLIER_SCORE = Math.round(
  DEMO_SUPPLIERS.reduce((sum, s) => sum + s.score, 0) / DEMO_SUPPLIERS.length,
)

/* ── Vehicles (15 representative, out of 100 in the demo fleet) ───────── */
export const DEMO_VEHICLES = [
  { id:  1, make: 'Ford',       model: 'F-150',         vin: '1FTFW1ET2DFC10312', status: 'active',      odometer: 45230 },
  { id:  2, make: 'Toyota',     model: 'Camry',         vin: '4T1BF3EK5AU123456', status: 'active',      odometer: 28100 },
  { id:  3, make: 'Honda',      model: 'CR-V',          vin: '2HKRM4H74EH123456', status: 'idle',        odometer: 62800 },
  { id:  4, make: 'Chevrolet',  model: 'Silverado',     vin: '1GCNCNEH0FZ123456', status: 'active',      odometer: 33500 },
  { id:  5, make: 'Ford',       model: 'Transit',       vin: '1FTBR1C89MKA12345', status: 'maintenance', odometer: 91200 },
  { id:  6, make: 'Dodge',      model: 'Ram 1500',      vin: '1C6RR6LT5ES123456', status: 'active',      odometer: 17400 },
  { id:  7, make: 'GMC',        model: 'Sierra',        vin: '1GTV2VEC4FZ123456', status: 'idle',        odometer: 55600 },
  { id:  8, make: 'Nissan',     model: 'Frontier',      vin: '1N6AD0EV4EN123456', status: 'active',      odometer: 41900 },
  { id:  9, make: 'Toyota',     model: 'Tundra',        vin: '5TFFM5F19GX123456', status: 'active',      odometer: 29300 },
  { id: 10, make: 'Ford',       model: 'Explorer',      vin: '1FM5K8D84EGB12345', status: 'maintenance', odometer: 78500 },
  { id: 11, make: 'Chevrolet',  model: 'Tahoe',         vin: '1GNSCAKC5FR123456', status: 'active',      odometer: 22100 },
  { id: 12, make: 'Ram',        model: 'ProMaster',     vin: '3C6TRVAG6EE123456', status: 'idle',        odometer: 87300 },
  { id: 13, make: 'Ford',       model: 'Ranger',        vin: '1FTER4FH6MLD12345', status: 'active',      odometer: 15800 },
  { id: 14, make: 'Jeep',       model: 'Grand Cherokee', vin: '1C4RJFBG5EC123456', status: 'active',     odometer: 38400 },
  { id: 15, make: 'Hyundai',    model: 'Tucson',        vin: 'KM8J3CA47GU123456', status: 'maintenance', odometer: 63100 },
]

/* ── Invoices (20 representative rows) ───────────────────────────────── */
export const DEMO_INVOICES = [
  { id: 1,  supplier: 'QuickFix Garage',   vin: '1FTFW1ET2DFC10312', service: 'Oil Change',           amount: 89.99,  status: 'approved', date: '2026-05-02' },
  { id: 2,  supplier: 'Bridgestone Fleet', vin: '4T1BF3EK5AU123456', service: 'Tire Rotation',        amount: 289,    status: 'flagged',  date: '2026-05-05' },
  { id: 3,  supplier: 'MechPro Services',  vin: '2HKRM4H74EH123456', service: 'Brake Service',        amount: 890,    status: 'flagged',  date: '2026-05-07' },
  { id: 4,  supplier: 'QuickFix Garage',   vin: '1GCNCNEH0FZ123456', service: 'Oil Change',           amount: 92,     status: 'approved', date: '2026-05-09' },
  { id: 5,  supplier: 'AutoCare Pro',      vin: '1FTBR1C89MKA12345', service: 'Air Filter',           amount: 45,     status: 'approved', date: '2026-05-11' },
  { id: 6,  supplier: 'FleetServ Inc',     vin: '1C6RR6LT5ES123456', service: 'Transmission Service', amount: 2800,   status: 'flagged',  date: '2026-05-13' },
  { id: 7,  supplier: 'QuickFix Garage',   vin: '1GTV2VEC4FZ123456', service: 'Oil Change',           amount: 95,     status: 'approved', date: '2026-05-14' },
  { id: 8,  supplier: 'Bridgestone Fleet', vin: '1N6AD0EV4EN123456', service: 'Tire Rotation',        amount: 198,    status: 'flagged',  date: '2026-05-16' },
  { id: 9,  supplier: 'AutoCare Pro',      vin: '5TFFM5F19GX123456', service: 'AC Repair',            amount: 650,    status: 'flagged',  date: '2026-05-18' },
  { id: 10, supplier: 'MechPro Services',  vin: '1FM5K8D84EGB12345', service: 'Wheel Alignment',      amount: 120,    status: 'approved', date: '2026-05-19' },
  { id: 11, supplier: 'FleetServ Inc',     vin: '1GNSCAKC5FR123456', service: 'Coolant Flush',        amount: 85,     status: 'approved', date: '2026-05-21' },
  { id: 12, supplier: 'QuickFix Garage',   vin: '3C6TRVAG6EE123456', service: 'Oil Change',           amount: 89,     status: 'approved', date: '2026-05-22' },
  { id: 13, supplier: 'AutoCare Pro',      vin: '1FTER4FH6MLD12345', service: 'Battery Replacement',  amount: 145,    status: 'approved', date: '2026-05-24' },
  { id: 14, supplier: 'Bridgestone Fleet', vin: '1C4RJFBG5EC123456', service: 'Tire Rotation',        amount: 52,     status: 'pending',  date: '2026-05-26' },
  { id: 15, supplier: 'MechPro Services',  vin: 'KM8J3CA47GU123456', service: 'Brake Inspection',     amount: 280,    status: 'flagged',  date: '2026-05-28' },
  { id: 16, supplier: 'FleetServ Inc',     vin: '1FTFW1ET2DFC10312', service: 'Engine Tune-up',       amount: 420,    status: 'flagged',  date: '2026-06-01' },
  { id: 17, supplier: 'QuickFix Garage',   vin: '4T1BF3EK5AU123456', service: 'Oil Change',           amount: 91,     status: 'approved', date: '2026-06-03' },
  { id: 18, supplier: 'AutoCare Pro',      vin: '2HKRM4H74EH123456', service: 'Tire Rotation',        amount: 49,     status: 'approved', date: '2026-06-05' },
  { id: 19, supplier: 'Bridgestone Fleet', vin: '1GCNCNEH0FZ123456', service: 'Fleet Wash',           amount: 38,     status: 'approved', date: '2026-06-07' },
  { id: 20, supplier: 'FleetServ Inc',     vin: '1FTBR1C89MKA12345', service: 'Suspension Check',     amount: 175,    status: 'pending',  date: '2026-06-09' },
]

/* ── Monthly stats ────────────────────────────────────────────────────── */
export const MONTHLY_STATS = [
  { month: 'Jan', total_spend: 12400, invoice_count: 45, flagged_count: 6  },
  { month: 'Feb', total_spend: 14800, invoice_count: 52, flagged_count: 8  },
  { month: 'Mar', total_spend: 13200, invoice_count: 48, flagged_count: 5  },
  { month: 'Apr', total_spend: 17600, invoice_count: 61, flagged_count: 11 },
  { month: 'May', total_spend: 15900, invoice_count: 55, flagged_count: 7  },
  { month: 'Jun', total_spend: 10800, invoice_count: 38, flagged_count: 4  },
]

export const FLEET_STATUS = [
  { name: 'Active',      value: 73 },
  { name: 'Idle',        value: 18 },
  { name: 'Maintenance', value: 9  },
]

export const OVERCHARGES_CAUGHT = 8240
export const IDLE_COST_SAVED    = 3180
export const FLAGGED_PENDING    = 7
