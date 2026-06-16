import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { Invoice, ImportResult } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

const ACCEPTED_EXTS = ['.csv', '.xlsx', '.xls', '.json']

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

function ImportModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean
  onClose: () => void
  onDone: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const importMutation = useMutation({
    mutationFn: (file: File) => api.importInvoices(file),
    onSuccess: (data) => {
      setResult(data)
      onDone()
      if (data.created > 0) toast.success(`Imported ${data.created} invoices`)
      if (data.skipped > 0) toast.error(`${data.skipped} rows skipped`)
    },
    onError: () => toast.error('Import failed'),
  })

  function handleFile(file: File) {
    setResult(null)
    importMutation.mutate(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>Import Invoices</DialogTitle>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {importMutation.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Processing…</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Drop your invoice file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
              <div className="flex justify-center gap-2 mt-4">
                {ACCEPTED_EXTS.map(ext => (
                  <span key={ext} className="px-2 py-0.5 bg-secondary rounded text-[10px] font-data text-muted-foreground border border-border">
                    {ext}
                  </span>
                ))}
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_EXTS.join(',')}
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {result && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{result.created} invoices imported</span>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400">{result.skipped} rows skipped</span>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="max-h-32 overflow-auto space-y-1 mt-2">
                {result.errors.map(e => (
                  <p key={e.row} className="text-xs text-muted-foreground">
                    Row {e.row}: {e.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          <p className="font-medium text-foreground mb-1">Expected columns:</p>
          <p className="font-data">supplier_name, vehicle_vin, service_type, total_amount</p>
          <p className="mt-0.5 text-muted-foreground">Optional: date, line_item_desc, line_item_amount</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending' | 'approved'>('all')
  const [importOpen, setImportOpen] = useState(false)

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
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Invoices</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review, approve, and investigate fleet invoices</p>
        </div>
        <Button
          onClick={() => setImportOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Import Invoices
        </Button>
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

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
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
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : invoices.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
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
                    className="cursor-pointer border-border hover:bg-secondary/30 transition-colors"
                    onClick={() => setSelected(inv)}
                  >
                    <TableCell className="font-data text-xs text-muted-foreground">#{inv.id}</TableCell>
                    <TableCell className="text-sm font-medium">{inv.supplier_name}</TableCell>
                    <TableCell className="font-data text-xs text-muted-foreground">{inv.vehicle_vin}</TableCell>
                    <TableCell className="text-sm">{inv.service_type}</TableCell>
                    <TableCell className="font-data text-sm text-foreground">${Number(inv.total_amount).toLocaleString()}</TableCell>
                    <TableCell><StatusDot status={inv.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground font-data">
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
      />
    </div>
  )
}
