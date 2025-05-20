import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface ProjectionTableProps {
  data: {
    rows: Array<{
      age: number
      yearsOfService: number
      factor: number
      totalBenefitPercentage: number
      annualPension: number
      monthlyPension: number
      survivorAnnual: number | string
      survivorMonthly: number | string
    }>
    title: string
  }
  option: string
}

export default function ProjectionTable({ data, option }: ProjectionTableProps) {
  if (!data || !data.rows || data.rows.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">{data.title}</CardTitle>
        </div>
        <CardDescription>
          This projection shows how your pension grows with additional years of service. All amounts reflect Option{" "}
          {option}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Ret. Age</TableHead>
                <TableHead className="font-medium">Y.O.S.</TableHead>
                <TableHead className="font-medium">Factor</TableHead>
                <TableHead className="font-medium">Total %</TableHead>
                <TableHead className="font-medium">Annual (Opt {option})</TableHead>
                <TableHead className="font-medium">Monthly (Opt {option})</TableHead>
                <TableHead className="font-medium">Survivor Annual</TableHead>
                <TableHead className="font-medium">Survivor Monthly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, index) => (
                <TableRow key={index} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.yearsOfService.toFixed(1)}</TableCell>
                  <TableCell>{(row.factor * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(row.totalBenefitPercentage * 100).toFixed(1)}%</TableCell>
                  <TableCell className="font-medium">${row.annualPension.toFixed(2)}</TableCell>
                  <TableCell>${row.monthlyPension.toFixed(2)}</TableCell>
                  <TableCell>
                    {typeof row.survivorAnnual === "number" ? `$${row.survivorAnnual.toFixed(2)}` : row.survivorAnnual}
                  </TableCell>
                  <TableCell>
                    {typeof row.survivorMonthly === "number"
                      ? `$${row.survivorMonthly.toFixed(2)}`
                      : row.survivorMonthly}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Projection tables use your entered average salary and adjust Years of Service. Pension amounts reflect
          selected retirement option.
        </p>
      </CardContent>
    </Card>
  )
}
