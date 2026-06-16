import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, AlertTriangle, Truck, TrendingUp } from 'lucide-react'
import { kpiData, chartData } from '@/lib/mock-data'

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
}

const kpis = [
  { label: 'Overcharges Caught', value: fmt(kpiData.overchargesCaught), icon: DollarSign, change: '+12% vs last month' },
  { label: 'Idle Cost Saved', value: fmt(kpiData.idleCostSaved), icon: Truck, change: '+8% vs last month' },
  { label: 'Flagged Invoices', value: String(kpiData.flaggedInvoices), icon: AlertTriangle, change: '3 new this week' },
  { label: 'Avg Supplier Score', value: `${kpiData.supplierScore}/100`, icon: TrendingUp, change: '-2 vs last quarter' },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Fleet spend & operations overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, change }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overcharges Caught (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => `$${v / 1000}k`} className="text-xs" />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Overcharges']} />
                <Bar dataKey="overcharges" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Idle Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => `$${v / 1000}k`} className="text-xs" />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Idle Cost']} />
                <Line type="monotone" dataKey="idle" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
