import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { DollarSign, AlertTriangle, Truck, TrendingUp, Activity, ChevronRight, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DEMO_SUPPLIERS,
  MONTHLY_STATS,
  FLEET_STATUS,
  OVERCHARGES_CAUGHT,
  IDLE_COST_SAVED,
  FLAGGED_PENDING,
  AVG_SUPPLIER_SCORE,
} from '@/lib/demo-data'

const AMBER   = '#f59e0b'
const EMERALD = '#10b981'
const RED     = '#ef4444'
const ZINC    = '#52525b'
const PIE_COLORS = [EMERALD, AMBER, RED]

const RECENT_ALERTS = [
  { id: 1, service_type: 'Oil Change',          supplier_name: 'QuickFix Garage',   total_amount: 420,  severity: 'high'   },
  { id: 2, service_type: 'Tire Rotation',        supplier_name: 'AutoCare Pro',      total_amount: 289,  severity: 'medium' },
  { id: 3, service_type: 'Transmission Service', supplier_name: 'FleetServ Inc',     total_amount: 2800, severity: 'high'   },
  { id: 4, service_type: 'Brake Service',        supplier_name: 'MechPro Services',  total_amount: 890,  severity: 'medium' },
  { id: 5, service_type: 'AC Repair',            supplier_name: 'Bridgestone Fleet', total_amount: 650,  severity: 'high'   },
]

const TOP_SUPPLIERS = [...DEMO_SUPPLIERS].sort((a, b) => b.score - a.score).slice(0, 4)

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`
  return `$${n}`
}

function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    high:   'bg-red-500/15 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low:    'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${map[level] ?? map.low}`}>
      {level}
    </span>
  )
}

function KpiCard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string; value: string; sub: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <Card className="relative overflow-hidden border-border">
      {accent && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <p className={`text-3xl font-bold tracking-tight font-data ${accent ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{sub}</p>
      </CardContent>
    </Card>
  )
}

export default function DemoPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet spend & operations at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span>Demo data</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Overcharges Caught"
          value={fmtCurrency(OVERCHARGES_CAUGHT)}
          sub="From flagged invoices"
          icon={DollarSign}
          accent
        />
        <KpiCard
          label="Idle Cost Saved"
          value={fmtCurrency(IDLE_COST_SAVED)}
          sub="Via idle event tracking"
          icon={Truck}
        />
        <KpiCard
          label="Flagged Invoices"
          value={String(FLAGGED_PENDING)}
          sub="Awaiting review"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Avg Supplier Score"
          value={`${AVG_SUPPLIER_SCORE}/100`}
          sub="Across all suppliers"
          icon={TrendingUp}
        />
      </div>

      {/* Middle row: spend chart + recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Invoice Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_STATS} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.17 0 0)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Total spend']}
                  cursor={{ fill: 'oklch(0.17 0 0)' }}
                />
                <Bar dataKey="total_spend" fill={AMBER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent Alerts
            </CardTitle>
            <Link to="/login" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              Sign up <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {RECENT_ALERTS.map(inv => (
                <div key={inv.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{inv.service_type}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{inv.supplier_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-data text-foreground">${inv.total_amount.toLocaleString()}</span>
                    <SeverityBadge level={inv.severity} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: flagged trend + fleet status + supplier scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Flagged Invoice Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={MONTHLY_STATS}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.17 0 0)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [v, 'Flagged']}
                />
                <Line type="monotone" dataKey="flagged_count" stroke={AMBER} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={FLEET_STATUS} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" strokeWidth={0}>
                  {FLEET_STATUS.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {FLEET_STATUS.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-data text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Supplier Scores
            </CardTitle>
            <Link to="/demo/suppliers" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_SUPPLIERS.map(({ name, score }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground truncate pr-2">{name}</span>
                  <span className="font-data text-muted-foreground shrink-0">{score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${score}%`,
                      background: score >= 80 ? EMERALD : score >= 60 ? AMBER : RED,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sign-up CTA */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Ready to run this on your own fleet?
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Import your CSV, Excel, or JSON invoices — anomaly detectors flag issues within seconds.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
        >
          Get started — free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
