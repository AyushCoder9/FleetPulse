import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import type { Vehicle } from '@/lib/api'
import { Truck, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const STATUS_CFG: Record<string, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  active:      { label: 'Active',      color: 'text-emerald-400', Icon: CheckCircle },
  idle:        { label: 'Idle',        color: 'text-red-400',     Icon: AlertCircle },
  maintenance: { label: 'Maintenance', color: 'text-amber-400',   Icon: Clock },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.active
  const { Icon, label, color } = cfg
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      {label}
    </span>
  )
}

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.vehicles,
  })

  const counts = { active: 0, idle: 0, maintenance: 0 }
  vehicles.forEach((v: Vehicle) => { if (v.status in counts) counts[v.status as keyof typeof counts]++ })

  const kpis = [
    { label: 'Total', value: vehicles.length, Icon: Truck, color: 'text-foreground' },
    { label: 'Active', value: counts.active, Icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Idle', value: counts.idle, Icon: AlertCircle, color: 'text-red-400' },
    { label: 'Maintenance', value: counts.maintenance, Icon: Clock, color: 'text-amber-400' },
  ]

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Fleet Vehicles
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Status and idle tracking across your fleet</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(({ label, value, Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              {isLoading
                ? <Skeleton className="h-7 w-12 mt-1" />
                : <p className={`text-2xl font-bold font-data mt-0.5 ${color}`}>{value}</p>
              }
            </div>
            <Icon className={`h-5 w-5 ${color} opacity-60`} />
          </div>
        ))}
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {['Make / Model', 'VIN', 'Status', 'Odometer', 'Added'].map(h => (
                <TableHead key={h} className="text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : vehicles.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                )
              : vehicles.map((v: Vehicle) => (
                  <TableRow key={v.id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{v.make} {v.model}</TableCell>
                    <TableCell className="font-data text-xs text-muted-foreground">{v.vin}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell className="font-data text-sm">{v.odometer.toLocaleString()} mi</TableCell>
                    <TableCell className="font-data text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
