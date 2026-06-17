import { Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DEMO_VEHICLES, FLEET_STATUS } from '@/lib/demo-data'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  active:      { label: 'Active',      icon: CheckCircle, cls: 'text-emerald-400', dot: 'bg-emerald-500' },
  idle:        { label: 'Idle',        icon: Clock,       cls: 'text-amber-400',   dot: 'bg-amber-500'   },
  maintenance: { label: 'Maintenance', icon: AlertCircle, cls: 'text-red-400',     dot: 'bg-red-500'     },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  )
}

const TOTAL    = FLEET_STATUS.reduce((s, x) => s + x.value, 0)
const ACTIVE   = FLEET_STATUS.find(x => x.name === 'Active')?.value ?? 0
const IDLE     = FLEET_STATUS.find(x => x.name === 'Idle')?.value ?? 0
const MAINT    = FLEET_STATUS.find(x => x.name === 'Maintenance')?.value ?? 0

const KPI_CARDS = [
  { label: 'Total Vehicles',  value: String(TOTAL), sub: 'In demo fleet',     accent: false },
  { label: 'Active',          value: String(ACTIVE),  sub: 'On the road',     accent: false },
  { label: 'Idle',            value: String(IDLE),    sub: 'Not in service',  accent: false },
  { label: 'Maintenance',     value: String(MAINT),   sub: 'Being serviced',  accent: true  },
]

export default function DemoVehiclesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Vehicles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            100-vehicle demo fleet · 15 shown
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          Add your fleet <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, accent }) => (
          <Card key={label} className={`border-border ${accent ? 'border-red-500/30' : ''}`}>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
              <p className={`text-3xl font-bold tracking-tight font-data ${accent ? 'text-red-400' : 'text-foreground'}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Make / Model</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">VIN</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Odometer</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_VEHICLES.map(v => (
              <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{v.make} {v.model}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-data text-xs hidden md:table-cell">
                  {v.vin}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground font-data text-xs hidden sm:table-cell">
                  {v.odometer.toLocaleString()} mi
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
          Showing 15 of 100 vehicles in the demo fleet
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">Track your entire fleet in one place</p>
        <p className="text-xs text-muted-foreground mb-4">
          Vehicles are auto-created when you import invoices. No manual entry needed.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
