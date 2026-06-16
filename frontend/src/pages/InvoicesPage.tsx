import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Invoice } from '@/lib/api'
import { toast } from 'sonner'

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary'> = {
  flagged: 'destructive',
  approved: 'default',
  pending: 'secondary',
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending' | 'approved'>('all')

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', filter],
    queryFn: () => api.invoices(filter === 'all' ? undefined : filter),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.approveInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Invoice approved')
      setSelected(null)
    },
    onError: () => toast.error('Failed to approve invoice'),
  })

  const flagMutation = useMutation({
    mutationFn: (id: number) => api.flagInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.error('Invoice flagged')
      setSelected(null)
    },
    onError: () => toast.error('Failed to flag invoice'),
  })

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground text-sm">Review and manage maintenance invoices</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'flagged', 'pending', 'approved'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : invoices.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )
              : invoices.map(inv => (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(inv)}
                  >
                    <TableCell className="font-mono text-sm">#{inv.id}</TableCell>
                    <TableCell>{inv.supplier_name}</TableCell>
                    <TableCell className="font-mono text-sm">{inv.vehicle_vin}</TableCell>
                    <TableCell>{inv.service_type}</TableCell>
                    <TableCell>${Number(inv.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[inv.status]} className="capitalize">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open: boolean) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invoice #{selected?.id}</SheetTitle>
            <SheetDescription>{selected?.supplier_name} · {selected?.vehicle_vin}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span>{selected.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">${Number(selected.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selected.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[selected.status]} className="capitalize">
                    {selected.status}
                  </Badge>
                </div>
              </div>
              {selected.status === 'flagged' && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <strong>Anomaly detected</strong> — this invoice has been flagged for review.
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => approveMutation.mutate(selected.id)}
                  disabled={selected.status === 'approved' || approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => flagMutation.mutate(selected.id)}
                  disabled={selected.status === 'flagged' || flagMutation.isPending}
                >
                  {flagMutation.isPending ? 'Flagging…' : 'Flag'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
