import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { suppliers } from '@/lib/mock-data'

function scoreColor(score: number) {
  if (score >= 85) return 'hsl(142, 71%, 45%)'
  if (score >= 65) return 'hsl(38, 92%, 50%)'
  return 'hsl(0, 84%, 60%)'
}

export default function SuppliersPage() {
  const sorted = [...suppliers].sort((a, b) => b.score - a.score)

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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sorted} layout="vertical">
              <XAxis type="number" domain={[0, 100]} className="text-xs" />
              <YAxis type="category" dataKey="name" width={120} className="text-xs" />
              <Tooltip formatter={(v) => [`${Number(v)}/100`, 'Score']} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {sorted.map((s, i) => (
                  <Cell key={i} fill={scoreColor(s.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            {sorted.map(s => (
              <TableRow key={s.name}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.region}</TableCell>
                <TableCell>
                  <span className="font-bold" style={{ color: scoreColor(s.score) }}>
                    {s.score}
                  </span>
                  <span className="text-muted-foreground text-xs">/100</span>
                </TableCell>
                <TableCell>{s.invoices}</TableCell>
                <TableCell>{s.flagged}</TableCell>
                <TableCell>{((s.flagged / s.invoices) * 100).toFixed(0)}%</TableCell>
                <TableCell>${s.totalSpend.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
