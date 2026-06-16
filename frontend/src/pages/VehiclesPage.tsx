import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { vehicles } from '@/lib/mock-data'
import { Truck, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  idle: { label: 'Idle', variant: 'destructive', icon: AlertCircle },
  maintenance: { label: 'Maintenance', variant: 'secondary', icon: Clock },
}

export default function VehiclesPage() {
  const idleCount = vehicles.filter(v => v.status === 'idle').length
  const activeCount = vehicles.filter(v => v.status === 'active').length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <p className="text-muted-foreground text-sm">Fleet status and idle event tracking</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{vehicles.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{activeCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Idle</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{idleCount}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {vehicles.map(v => {
          const cfg = statusConfig[v.status]
          const Icon = cfg.icon
          return (
            <div key={v.vin} className="flex items-center gap-4 rounded-lg border p-4">
              <Icon className={`h-5 w-5 ${v.status === 'idle' ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{v.make} {v.model}</p>
                <p className="text-sm text-muted-foreground font-mono">{v.vin}</p>
              </div>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              {v.idleDays > 0 && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{v.idleDays}d idle</p>
                  <p className="text-xs text-muted-foreground">{v.rootCause}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
