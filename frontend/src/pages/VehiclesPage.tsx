import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Vehicle } from '@/lib/api'
import { Truck, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  idle: { label: 'Idle', variant: 'destructive', icon: AlertCircle },
  maintenance: { label: 'Maintenance', variant: 'secondary', icon: Clock },
}

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.vehicles,
  })

  const idleCount = vehicles.filter((v: Vehicle) => v.status === 'idle').length
  const activeCount = vehicles.filter((v: Vehicle) => v.status === 'active').length

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
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{vehicles.length}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{activeCount}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Idle</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-destructive">{idleCount}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          : vehicles.length === 0
          ? (
              <p className="text-center text-muted-foreground py-8">No vehicles found</p>
            )
          : vehicles.map((v: Vehicle) => {
              const cfg = statusConfig[v.status] ?? statusConfig.active
              const Icon = cfg.icon
              return (
                <div key={v.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <Icon className={`h-5 w-5 ${v.status === 'idle' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{v.make} {v.model}</p>
                    <p className="text-sm text-muted-foreground font-mono">{v.vin}</p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <p className="text-xs text-muted-foreground">{v.odometer.toLocaleString()} mi</p>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
