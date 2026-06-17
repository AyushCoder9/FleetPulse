import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { ImportResult } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

const ACCEPTED_EXTS = ['.csv', '.xlsx', '.xls', '.json']

export function ImportModal({
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
