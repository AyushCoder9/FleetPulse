import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEMO_SUPPLIERS, AVG_SUPPLIER_SCORE } from '@/lib/demo-data'

const EMERALD = '#10b981'
const AMBER   = '#f59e0b'
const RED     = '#ef4444'
const ZINC    = '#52525b'

function scoreColor(score: number) {
  if (score >= 80) return EMERALD
  if (score >= 60) return AMBER
  return RED
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
    score >= 60 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                  'bg-red-500/15 text-red-400 border-red-500/20'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-data font-semibold border ${cls}`}>
      {score}
    </span>
  )
}

const CHART_DATA = [...DEMO_SUPPLIERS].sort((a, b) => a.score - b.score)

export default function DemoSuppliersPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Suppliers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {DEMO_SUPPLIERS.length} suppliers · avg score {AVG_SUPPLIER_SCORE}/100
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          Score your suppliers <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Score chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Supplier Score Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHART_DATA} layout="vertical" barSize={20} margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: ZINC }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f0f0f', border: '1px solid #262626', borderRadius: 6, fontSize: 12 }}
                formatter={(v) => [v, 'Score']}
                cursor={{ fill: 'oklch(0.17 0 0)' }}
              />
              <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                {CHART_DATA.map(s => (
                  <Cell key={s.name} fill={scoreColor(s.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Region</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Invoices</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Flagged</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Flag Rate</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {[...DEMO_SUPPLIERS].sort((a, b) => b.score - a.score).map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.region}</td>
                <td className="px-4 py-3">
                  <ScoreBadge score={s.score} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground font-data hidden sm:table-cell">
                  {s.total}
                </td>
                <td className="px-4 py-3 text-right font-data hidden sm:table-cell">
                  <span className={s.flagged > 5 ? 'text-red-400' : 'text-muted-foreground'}>
                    {s.flagged}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground font-data hidden lg:table-cell">
                  {s.flag_rate}
                </td>
                <td className="px-4 py-3 text-right text-foreground font-data">
                  ${s.spend.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">Know which suppliers overcharge most</p>
        <p className="text-xs text-muted-foreground mb-4">
          FleetPulse scores every supplier based on flag rate, billing accuracy, and contract compliance.
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
