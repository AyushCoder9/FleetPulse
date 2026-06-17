import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DEMO_INVOICES } from '@/lib/demo-data'

type Status = 'all' | 'flagged' | 'pending' | 'approved'

const TABS: { label: string; value: Status }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Flagged',  value: 'flagged'  },
  { label: 'Pending',  value: 'pending'  },
  { label: 'Approved', value: 'approved' },
]

const STATUS_DOT: Record<string, string> = {
  flagged:  'bg-red-500',
  pending:  'bg-amber-500',
  approved: 'bg-emerald-500',
}

const STATUS_BADGE: Record<string, string> = {
  flagged:  'bg-red-500/15 text-red-400 border-red-500/20',
  pending:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export default function DemoInvoicesPage() {
  const [tab, setTab] = useState<Status>('all')

  const rows = tab === 'all' ? DEMO_INVOICES : DEMO_INVOICES.filter(r => r.status === tab)

  const counts = {
    all:      DEMO_INVOICES.length,
    flagged:  DEMO_INVOICES.filter(r => r.status === 'flagged').length,
    pending:  DEMO_INVOICES.filter(r => r.status === 'pending').length,
    approved: DEMO_INVOICES.filter(r => r.status === 'approved').length,
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {DEMO_INVOICES.length} demo invoices · {counts.flagged} flagged
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          Import your invoices <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
              tab === t.value ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
            }`}>
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">VIN</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Service</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(inv => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground font-data text-xs">
                  INV-{String(inv.id).padStart(3, '0')}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {inv.supplier}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-data text-xs hidden md:table-cell">
                  {inv.vin}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                  {inv.service}
                </td>
                <td className="px-4 py-3 text-right font-data text-foreground">
                  ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[inv.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[inv.status]}`} />
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                  {inv.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">Seeing anomalies in these invoices?</p>
        <p className="text-xs text-muted-foreground mb-4">
          FleetPulse automatically flags overcharges, duplicate billings, and rate mismatches.
          Import your own data to get started.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
