export const kpiData = {
  overchargesCaught: 148320,
  idleCostSaved: 34750,
  flaggedInvoices: 37,
  supplierScore: 72,
}

export const chartData = [
  { month: 'Jan', overcharges: 12000, idle: 3200 },
  { month: 'Feb', overcharges: 18400, idle: 4100 },
  { month: 'Mar', overcharges: 15600, idle: 5800 },
  { month: 'Apr', overcharges: 22000, idle: 4400 },
  { month: 'May', overcharges: 31200, idle: 6200 },
  { month: 'Jun', overcharges: 49120, idle: 11050 },
]

export const invoices = [
  { id: 'INV-001', supplier: 'AutoCare Pro', vehicle: 'VIN-7823', service: 'Oil Change', amount: 420, status: 'flagged', anomaly: 'Rate 40% above contract' },
  { id: 'INV-002', supplier: 'QuickFix Garage', vehicle: 'VIN-4411', service: 'Brake Pads', amount: 890, status: 'approved', anomaly: null },
  { id: 'INV-003', supplier: 'FleetServ Inc', vehicle: 'VIN-9920', service: 'Tire Rotation', amount: 310, status: 'flagged', anomaly: 'Duplicate line item' },
  { id: 'INV-004', supplier: 'AutoCare Pro', vehicle: 'VIN-3301', service: 'AC Repair', amount: 1240, status: 'pending', anomaly: null },
  { id: 'INV-005', supplier: 'MechPro', vehicle: 'VIN-5518', service: 'Transmission', amount: 2800, status: 'flagged', anomaly: 'Rate 28% above contract' },
  { id: 'INV-006', supplier: 'QuickFix Garage', vehicle: 'VIN-6674', service: 'Battery Replace', amount: 180, status: 'approved', anomaly: null },
  { id: 'INV-007', supplier: 'AutoCare Pro', vehicle: 'VIN-1122', service: 'Oil Change', amount: 390, status: 'pending', anomaly: null },
  { id: 'INV-008', supplier: 'FleetServ Inc', vehicle: 'VIN-8833', service: 'Wiper Blades', amount: 85, status: 'flagged', anomaly: 'Duplicate line item' },
]

export const vehicles = [
  { vin: 'VIN-7823', make: 'Toyota', model: 'Camry', status: 'idle', idleDays: 5, rootCause: 'Awaiting parts' },
  { vin: 'VIN-4411', make: 'Ford', model: 'Transit', status: 'active', idleDays: 0, rootCause: null },
  { vin: 'VIN-9920', make: 'Honda', model: 'CR-V', status: 'idle', idleDays: 12, rootCause: 'Awaiting paperwork' },
  { vin: 'VIN-3301', make: 'Chevrolet', model: 'Express', status: 'maintenance', idleDays: 3, rootCause: 'In service' },
  { vin: 'VIN-5518', make: 'Ram', model: 'ProMaster', status: 'active', idleDays: 0, rootCause: null },
  { vin: 'VIN-6674', make: 'Mercedes', model: 'Sprinter', status: 'idle', idleDays: 8, rootCause: 'No driver assigned' },
]

export const suppliers = [
  { name: 'QuickFix Garage', region: 'Northeast', score: 91, invoices: 48, flagged: 2, totalSpend: 42000 },
  { name: 'MechPro', region: 'Southwest', score: 78, invoices: 36, flagged: 5, totalSpend: 38500 },
  { name: 'FleetServ Inc', region: 'Midwest', score: 65, invoices: 52, flagged: 11, totalSpend: 61200 },
  { name: 'AutoCare Pro', region: 'Southeast', score: 54, invoices: 64, flagged: 19, totalSpend: 88400 },
]
