import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { invoices } from '@/lib/mock-data'
import { toast } from 'sonner'

type Invoice = typeof invoices[0]

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary'> = {
  flagged: 'destructive',
  approved: 'default',
  pending: 'secondary',
}

export default function InvoicesPage() {
  const [data, setData] = useState(invoices)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending' | 'approved'>('all')

  const filtered = filter === 'all' ? data : data.filter(i => i.status === filter)

  function approve(id: string) {
    setData(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i))
    setSelected(null)
    toast.success(`Invoice ${id} approved`)
  }

  function flag(id: string) {
    setData(prev => prev.map(i => i.id === id ? { ...i, status: 'flagged' } : i))
    setSelected(null)
    toast.error(`Invoice ${id} flagged`)
  }

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
              <TableHead>Invoice</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Anomaly</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(inv => (
              <TableRow
                key={inv.id}
                className="cursor-pointer"
                onClick={() => setSelected(inv)}
              >
                <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                <TableCell>{inv.supplier}</TableCell>
                <TableCell className="font-mono text-sm">{inv.vehicle}</TableCell>
                <TableCell>{inv.service}</TableCell>
                <TableCell>${inv.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status]} className="capitalize">
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{inv.anomaly ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open: boolean) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.id}</SheetTitle>
            <SheetDescription>{selected?.supplier} · {selected?.vehicle}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{selected.service}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">${selected.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[selected.status]} className="capitalize">{selected.status}</Badge>
                </div>
              </div>
              {selected.anomaly && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <strong>Anomaly detected:</strong> {selected.anomaly}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={() => approve(selected.id)} disabled={selected.status === 'approved'}>
                  Approve
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => flag(selected.id)} disabled={selected.status === 'flagged'}>
                  Flag
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
