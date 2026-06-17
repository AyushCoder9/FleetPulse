import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Invoice } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, FileText, AlertTriangle, Trash2, CheckSquare, Square, MinusSquare } from 'lucide-react'
import { ImportModal } from '@/components/ImportModal'

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

const INVALIDATE_KEYS = ['invoices', 'dashboard', 'monthly-stats', 'suppliers', 'fleet-health']

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending' | 'approved'>('all')
  const [importOpen, setImportOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', filter],
    queryFn: () => api.invoices(filter === 'all' ? undefined : filter),
  })

  const invalidateAll = () => INVALIDATE_KEYS.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }))

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.approveInvoice(id),
    onSuccess: () => { invalidateAll(); toast.success('Invoice approved'); setSelected(null) },
    onError: () => toast.error('Failed to approve invoice'),
  })

  const flagMutation = useMutation({
    mutationFn: (id: number) => api.flagInvoice(id),
    onSuccess: () => { invalidateAll(); toast.error('Invoice flagged'); setSelected(null) },
    onError: () => toast.error('Failed to flag invoice'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteInvoice(id),
    onSuccess: () => { invalidateAll(); toast.success('Invoice deleted'); setSelected(null) },
    onError: () => toast.error('Failed to delete invoice'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => api.bulkDeleteInvoices(ids),
    onSuccess: (res) => {
      invalidateAll()
      setCheckedIds(new Set())
      toast.success(`${res.deleted} invoice${res.deleted !== 1 ? 's' : ''} deleted`)
    },
    onError: () => toast.error('Failed to delete invoices'),
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => api.deleteAllInvoices(),
    onSuccess: (res) => {
      invalidateAll()
      setCheckedIds(new Set())
      setConfirmDeleteAll(false)
      toast.success(`All ${res.deleted} invoices deleted`)
    },
    onError: () => toast.error('Failed to delete all invoices'),
  })

  const allChecked = invoices.length > 0 && invoices.every(inv => checkedIds.has(inv.id))
  const someChecked = invoices.some(inv => checkedIds.has(inv.id)) && !allChecked

  function toggleAll() {
    if (allChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(invoices.map(inv => inv.id)))
    }
  }

  function toggleOne(id: number) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const checkedCount = checkedIds.size

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Invoices</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review, approve, and investigate fleet invoices</p>
        </div>
        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            confirmDeleteAll ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                <span className="text-xs text-red-400">Delete all {invoices.length} invoices?</span>
                <Button
                  size="sm"
                  className="h-6 text-xs bg-red-500 text-white hover:bg-red-600 px-2"
                  onClick={() => deleteAllMutation.mutate()}
                  disabled={deleteAllMutation.isPending}
                >
                  {deleteAllMutation.isPending ? 'Deleting…' : 'Confirm'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() => setConfirmDeleteAll(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-sm"
                onClick={() => setConfirmDeleteAll(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete all
              </Button>
            )
          )}
          <Button
            onClick={() => setImportOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Import Invoices
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(['all', 'flagged', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {f === 'all' ? 'All invoices' : f}
          </button>
        ))}
      </div>

      {/* Bulk action toolbar */}
      {checkedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">{checkedCount} selected</span>
          <Button
            size="sm"
            className="h-7 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            onClick={() => bulkDeleteMutation.mutate(Array.from(checkedIds))}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {bulkDeleteMutation.isPending ? 'Deleting…' : `Delete ${checkedCount}`}
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground ml-auto"
            onClick={() => setCheckedIds(new Set())}
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <button onClick={toggleAll} className="flex items-center text-muted-foreground hover:text-foreground">
                  {allChecked
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : someChecked
                    ? <MinusSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4" />
                  }
                </button>
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Supplier</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Vehicle</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Service</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : invoices.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No invoices found</p>
                      <button
                        onClick={() => setImportOpen(true)}
                        className="text-xs text-primary mt-2 hover:underline"
                      >
                        Import your first batch →
                      </button>
                    </TableCell>
                  </TableRow>
                )
              : invoices.map(inv => (
                  <TableRow
                    key={inv.id}
                    className={`border-border transition-colors ${
                      checkedIds.has(inv.id) ? 'bg-primary/5' : 'hover:bg-secondary/30'
                    }`}
                  >
                    <TableCell className="pl-4" onClick={e => { e.stopPropagation(); toggleOne(inv.id) }}>
                      <button className="flex items-center text-muted-foreground hover:text-foreground">
                        {checkedIds.has(inv.id)
                          ? <CheckSquare className="h-4 w-4 text-primary" />
                          : <Square className="h-4 w-4" />
                        }
                      </button>
                    </TableCell>
                    <TableCell
                      className="font-data text-xs text-muted-foreground cursor-pointer"
                      onClick={() => setSelected(inv)}
                    >#{inv.id}</TableCell>
                    <TableCell className="text-sm font-medium cursor-pointer" onClick={() => setSelected(inv)}>{inv.supplier_name}</TableCell>
                    <TableCell className="font-data text-xs text-muted-foreground cursor-pointer" onClick={() => setSelected(inv)}>{inv.vehicle_vin}</TableCell>
                    <TableCell className="text-sm cursor-pointer" onClick={() => setSelected(inv)}>{inv.service_type}</TableCell>
                    <TableCell className="font-data text-sm text-foreground cursor-pointer" onClick={() => setSelected(inv)}>${Number(inv.total_amount).toLocaleString()}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelected(inv)}><StatusDot status={inv.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground font-data cursor-pointer" onClick={() => setSelected(inv)}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Invoice detail sheet */}
      <Sheet open={!!selected} onOpenChange={(open: boolean) => !open && setSelected(null)}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle style={{ fontFamily: 'var(--font-display)' }}>Invoice #{selected?.id}</SheetTitle>
            <SheetDescription>{selected?.supplier_name} · {selected?.vehicle_vin}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="space-y-3 text-sm">
                {[
                  ['Service', selected.service_type],
                  ['Amount', `$${Number(selected.total_amount).toLocaleString()}`],
                  ['Date', new Date(selected.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium ${label === 'Amount' ? 'font-data text-primary' : ''}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <StatusDot status={selected.status} />
                </div>
              </div>

              {selected.line_items && selected.line_items.length > 0 && (
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Line Items</p>
                  {selected.line_items.map(li => (
                    <div key={li.id} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">{li.description}</span>
                      <span className="font-data">${li.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {selected.status === 'flagged' && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
                  <p className="text-red-400 font-semibold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Anomaly detected
                  </p>
                  <p className="text-muted-foreground text-xs">This invoice has been flagged for review by our detection engine.</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  onClick={() => approveMutation.mutate(selected.id)}
                  disabled={selected.status === 'approved' || approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Approve'}
                </Button>
                <Button
                  className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  onClick={() => flagMutation.mutate(selected.id)}
                  disabled={selected.status === 'flagged' || flagMutation.isPending}
                >
                  {flagMutation.isPending ? 'Flagging…' : 'Flag'}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 gap-1.5 mt-1"
                onClick={() => deleteMutation.mutate(selected.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteMutation.isPending ? 'Deleting…' : 'Delete invoice'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => {
          setCheckedIds(new Set())
          invalidateAll()
        }}
      />
    </div>
  )
}
