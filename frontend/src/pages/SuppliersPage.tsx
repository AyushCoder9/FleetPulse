import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '@/lib/api'
import type { Supplier } from '@/lib/api'

function scoreColor(score: number) {
  if (score >= 85) return 'oklch(0.697 0.170 162.5)'
  if (score >= 65) return 'oklch(0.828 0.189 84.4)'
  return 'oklch(0.628 0.24 27.3)'
}

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <span className="font-data font-bold text-sm" style={{ color }}>
      {score}<span className="text-muted-foreground text-xs font-normal">/100</span>
    </span>
  )
}

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: api.suppliers,
  })

  const sorted = [...suppliers].sort((a: Supplier, b: Supplier) => b.score - a.score)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Supplier Scorecard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Compliance and quality ranking by flagged-invoice ratio</p>
      </div>

      <div className="border border-border rounded-xl bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Score Ranking</p>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No suppliers found</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 44)}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'oklch(0.40 0 0)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 12, fill: 'oklch(0.91 0 0)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: 'oklch(0.08 0 0)', border: '1px solid oklch(0.17 0 0)', borderRadius: 8 }}
                labelStyle={{ color: 'oklch(0.91 0 0)', fontSize: 12 }}
                formatter={(v) => [`${Number(v)}/100`, 'Score']}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {sorted.map((s: Supplier, i: number) => (
                  <Cell key={i} fill={scoreColor(s.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {['Supplier', 'Region', 'Score', 'Invoices', 'Flagged', 'Flag Rate', 'Total Spend'].map(h => (
                <TableHead key={h} className="text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : sorted.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )
              : sorted.map((s: Supplier) => (
                  <TableRow key={s.id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.region}</TableCell>
                    <TableCell><ScoreBadge score={s.score} /></TableCell>
                    <TableCell className="font-data text-sm">{s.invoice_count}</TableCell>
                    <TableCell className="font-data text-sm text-red-400">{s.flagged_count}</TableCell>
                    <TableCell className="font-data text-sm">
                      {s.invoice_count > 0 ? `${((s.flagged_count / s.invoice_count) * 100).toFixed(0)}%` : '—'}
                    </TableCell>
                    <TableCell className="font-data text-sm text-primary">${Number(s.total_spend).toLocaleString()}</TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
