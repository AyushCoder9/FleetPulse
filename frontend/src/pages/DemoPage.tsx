import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { DollarSign, AlertTriangle, Truck, TrendingUp, Upload, ArrowRight, Zap } from 'lucide-react'
import Logo from '@/components/Logo'
import { chartData, invoices as mockInvoices, kpiData } from '@/lib/mock-data'

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n}`
}

const AMBER = '#f59e0b'
const ZINC = '#52525b'

const kpis = [
  { label: 'Overcharges Caught', value: fmtCurrency(kpiData.overchargesCaught), icon: DollarSign, accent: true },
  { label: 'Idle Cost Saved', value: fmtCurrency(kpiData.idleCostSaved), icon: Truck, accent: false },
  { label: 'Flagged Invoices', value: String(kpiData.flaggedInvoices), icon: AlertTriangle, accent: false },
  { label: 'Avg Supplier Score', value: `${kpiData.supplierScore}/100`, icon: TrendingUp, accent: false },
]

function statusColor(s: string) {
  if (s === 'flagged') return 'text-red-400'
  if (s === 'approved') return 'text-emerald-400'
  return 'text-amber-400'
}

function StatusDot({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${statusColor(status)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'flagged' ? 'bg-red-400' :
        status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'
      }`} />
      {status}
    </span>
  )
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Demo header */}
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex items-center h-full px-6 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={26} className="text-primary" />
            <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              FleetPulse
            </span>
          </Link>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" />
            Demo Mode
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Back to home
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Sign up free →
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Demo banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              You're viewing demo data
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All numbers are illustrative. Sign up to connect your real fleet invoices.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Start with your data <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet spend & operations at a glance</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-xl border p-5 ${
                accent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className={`text-3xl font-bold tracking-tight font-data ${accent ? 'text-primary' : 'text-foreground'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Middle: Charts + Alert Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Monthly Overcharges Caught
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.17 0 0)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Overcharges']}
                  cursor={{ fill: 'oklch(0.17 0 0)' }}
                />
                <Bar dataKey="overcharges" fill={AMBER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent alerts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Recent Alerts</p>
            <div className="space-y-2.5">
              {mockInvoices.filter(i => i.anomaly).slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{inv.anomaly}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{inv.supplier}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-data text-foreground">${inv.amount}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      inv.status === 'flagged'
                        ? 'bg-red-500/15 text-red-400 border-red-500/20'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                    }`}>
                      {inv.status === 'flagged' ? 'high' : 'medium'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice table */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Invoices</p>
            <span className="text-xs text-muted-foreground">Demo data — {mockInvoices.length} invoices</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Supplier', 'Vehicle', 'Service', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-data text-xs text-muted-foreground">{inv.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{inv.supplier}</td>
                  <td className="px-4 py-3 font-data text-xs text-muted-foreground">{inv.vehicle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.service}</td>
                  <td className="px-4 py-3 font-data text-foreground">${inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusDot status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Import CTA */}
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <Upload className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Import your own invoices
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Sign up free and upload your CSV, Excel, or JSON invoice exports.
            Our anomaly detectors will flag issues within seconds.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
          >
            Get started — free <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex justify-center gap-3 mt-4">
            {['.csv', '.xlsx', '.xls', '.json'].map(ext => (
              <span key={ext} className="px-2 py-0.5 bg-secondary rounded text-[10px] font-data text-muted-foreground border border-border">
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
