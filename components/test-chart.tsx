"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: 'MA Pension', value: 4465, color: '#3b82f6' },
  { name: 'Social Security', value: 2800, color: '#10b981' },
]

export function TestChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="h-64 border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Test Chart</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
