import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { DollarSign, AlertTriangle, Truck, TrendingUp, Activity, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { chartData } from '@/lib/mock-data'
import { Link } from 'react-router-dom'

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n}`
}

const AMBER = '#f59e0b'
const EMERALD = '#10b981'
const RED = '#ef4444'
const ZINC = '#52525b'

const PIE_COLORS = [EMERALD, AMBER, RED]

const vehicleStatusData = [
  { name: 'Active', value: 28 },
  { name: 'Idle', value: 8 },
  { name: 'Maintenance', value: 4 },
]

const recentAlerts = [
  { id: 1, type: 'Rate overcharge', supplier: 'AutoCare Pro', amount: '$420', severity: 'high' },
  { id: 2, type: 'Duplicate line item', supplier: 'FleetServ Inc', amount: '$310', severity: 'medium' },
  { id: 3, type: 'Rate overcharge', supplier: 'MechPro Services', amount: '$2,800', severity: 'high' },
  { id: 4, type: 'New vendor', supplier: 'BudgetAuto Repair', amount: '$195', severity: 'low' },
  { id: 5, type: 'Duplicate line item', supplier: 'FleetServ Inc', amount: '$85', severity: 'medium' },
]

function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${map[level] ?? map.low}`}>
      {level}
    </span>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  loading,
  accent = false,
}: {
  label: string
  value: string | null
  sub: string
  icon: React.ElementType
  loading: boolean
  accent?: boolean
}) {
  return (
    <Card className="relative overflow-hidden border-border">
      {accent && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      )}
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        {loading || value === null ? (
          <Skeleton className="h-9 w-28 mb-1" />
        ) : (
          <p
            className={`text-3xl font-bold tracking-tight font-data ${accent ? 'text-primary' : 'text-foreground'}`}
          >
            {value}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">{sub}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  })

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading" style={{ fontFamily: 'var(--font-display)' }}>
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet spend & operations at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span>Live data</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Overcharges Caught"
          value={data ? fmtCurrency(data.overcharges_caught) : null}
          sub="From flagged invoices"
          icon={DollarSign}
          loading={isLoading}
          accent
        />
        <KpiCard
          label="Idle Cost Saved"
          value={data ? fmtCurrency(data.idle_cost_saved) : null}
          sub="Via idle event tracking"
          icon={Truck}
          loading={isLoading}
        />
        <KpiCard
          label="Flagged Invoices"
          value={data ? String(data.flagged_invoice_count) : null}
          sub="Awaiting review"
          icon={AlertTriangle}
          loading={isLoading}
        />
        <KpiCard
          label="Avg Supplier Score"
          value={data ? `${data.avg_supplier_score}/100` : null}
          sub="Across all suppliers"
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      {/* Middle row: Charts + Anomaly Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend bar chart */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Overcharges Caught
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.17 0 0)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: ZINC }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `$${v / 1000}k`}
                  tick={{ fontSize: 11, fill: ZINC }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Overcharges']}
                  cursor={{ fill: 'oklch(0.17 0 0)' }}
                />
                <Bar dataKey="overcharges" fill={AMBER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomaly alert feed */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent Alerts
            </CardTitle>
            <Link to="/app/invoices" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{alert.type}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{alert.supplier}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-data text-foreground">{alert.amount}</span>
                  <SeverityBadge level={alert.severity} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Idle trend + Vehicle status + Supplier snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Idle cost trend */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Idle Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.17 0 0)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Idle cost']}
                />
                <Line type="monotone" dataKey="idle" stroke={AMBER} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle status donut */}
        <Card className="border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" strokeWidth={0}>
                  {vehicleStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {vehicleStatusData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-data text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top supplier snapshot */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Supplier Scores
            </CardTitle>
            <Link to="/app/suppliers" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'QuickFix Garage', score: 91 },
              { name: 'MechPro Services', score: 78 },
              { name: 'FleetServ Inc', score: 65 },
              { name: 'AutoCare Pro', score: 54 },
            ].map(({ name, score }) => (
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
    </div>
  )
}
