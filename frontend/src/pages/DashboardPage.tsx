import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, AlertTriangle, Truck, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { chartData } from '@/lib/mock-data'

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  })

  const kpis = [
    { label: 'Overcharges Caught', value: data ? fmt(data.overcharges_caught) : null, icon: DollarSign, change: 'From flagged invoices' },
    { label: 'Idle Cost Saved', value: data ? fmt(data.idle_cost_saved) : null, icon: Truck, change: 'Tracked idle events' },
    { label: 'Flagged Invoices', value: data ? String(data.flagged_invoice_count) : null, icon: AlertTriangle, change: 'Awaiting review' },
    { label: 'Avg Supplier Score', value: data ? `${data.avg_supplier_score}/100` : null, icon: TrendingUp, change: 'Across all suppliers' },
  ]

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
              {isLoading || value === null ? (
                <Skeleton className="h-8 w-24 mb-1" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overcharges Caught (Monthly — demo)</CardTitle>
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
            <CardTitle className="text-sm">Idle Cost Trend (demo)</CardTitle>
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
