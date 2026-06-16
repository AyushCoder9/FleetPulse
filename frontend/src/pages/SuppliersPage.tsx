import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '@/lib/api'
import type { Supplier } from '@/lib/api'

function scoreColor(score: number) {
  if (score >= 85) return 'hsl(142, 71%, 45%)'
  if (score >= 65) return 'hsl(38, 92%, 50%)'
  return 'hsl(0, 84%, 60%)'
}

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: api.suppliers,
  })

  const sorted = [...suppliers].sort((a: Supplier, b: Supplier) => b.score - a.score)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Scorecard</h1>
        <p className="text-muted-foreground text-sm">Compliance and quality ranking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Score Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 40)}>
              <BarChart data={sorted} layout="vertical">
                <XAxis type="number" domain={[0, 100]} className="text-xs" />
                <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                <Tooltip formatter={(v) => [`${Number(v)}/100`, 'Score']} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {sorted.map((s: Supplier, i: number) => (
                    <Cell key={i} fill={scoreColor(s.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Flagged</TableHead>
              <TableHead>Flag Rate</TableHead>
              <TableHead>Total Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : sorted.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )
              : sorted.map((s: Supplier) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.region}</TableCell>
                    <TableCell>
                      <span className="font-bold" style={{ color: scoreColor(s.score) }}>
                        {s.score}
                      </span>
                      <span className="text-muted-foreground text-xs">/100</span>
                    </TableCell>
                    <TableCell>{s.invoice_count}</TableCell>
                    <TableCell>{s.flagged_count}</TableCell>
                    <TableCell>
                      {s.invoice_count > 0
                        ? `${((s.flagged_count / s.invoice_count) * 100).toFixed(0)}%`
                        : '—'}
                    </TableCell>
                    <TableCell>${Number(s.total_spend).toLocaleString()}</TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
