"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Calendar, Zap } from "lucide-react"
import { EarlyRetirementData } from "@/lib/utils/early-retirement-data"

interface EarlyRetirementHighlightProps {
  data: EarlyRetirementData
}

const colorClasses: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', icon: 'text-emerald-600' },
  red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: 'text-red-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', icon: 'text-amber-600' },
}

export function EarlyRetirementHighlight({ data }: EarlyRetirementHighlightProps) {
  const colors = colorClasses[data.accentColor] || colorClasses.blue
  const isGroup3 = data.group === 'GROUP_3'

  return (
    <Card className={`${colors.bg} ${colors.border} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={colors.badge}>
            <Zap className="w-3 h-3 mr-1" />
            Early Retirement Advantage
          </Badge>
          <span className="text-2xl">{data.iconEmoji}</span>
        </div>
        <CardTitle className="text-xl mt-2">{data.headline}</CardTitle>
        <p className="text-sm text-muted-foreground">{data.subheadline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main advantage text */}
        <p className="text-sm leading-relaxed">{data.advantage}</p>

        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Calendar className={`h-5 w-5 mx-auto mb-1 ${colors.icon}`} />
            <p className="text-lg font-bold">
              {isGroup3 ? 'Any' : data.minimumAge}
            </p>
            <p className="text-xs text-muted-foreground">Min. Age</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Clock className={`h-5 w-5 mx-auto mb-1 ${colors.icon}`} />
            <p className="text-lg font-bold">{data.minimumService}+</p>
            <p className="text-xs text-muted-foreground">Years Req.</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${colors.icon}`} />
            <p className="text-lg font-bold">{data.multiplierAtMin}%</p>
            <p className="text-xs text-muted-foreground">
              {isGroup3 ? 'Always Max!' : 'At Min. Age'}
            </p>
          </div>
        </div>

        {/* Scenario comparison - only show for non-Group 3 or show differently for Group 3 */}
        {isGroup3 ? (
          <div className="bg-white/80 rounded-lg p-3 border border-red-100">
            <p className="text-sm font-medium text-red-800 mb-2">
              🎯 Example Retirement Ages (based on start age):
            </p>
            <div className="flex justify-between text-sm">
              {data.scenarios.map((scenario, idx) => (
                <div key={idx} className="text-center">
                  <span className="font-bold text-red-700">Age {scenario.age}</span>
                  <p className="text-xs text-muted-foreground">{scenario.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">
              All scenarios: 2.5% multiplier (maximum rate)
            </p>
          </div>
        ) : (
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Multiplier by Retirement Age:</p>
            <div className="flex justify-between text-sm">
              {data.scenarios.map((scenario, idx) => (
                <div key={idx} className="text-center">
                  <span className={`font-bold ${idx === 0 ? colors.icon : ''}`}>
                    {scenario.multiplier}%
                  </span>
                  <p className="text-xs text-muted-foreground">Age {scenario.age}</p>
                  <Badge variant="outline" className="text-xs mt-1">{scenario.label}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade-off note - only for non-Group 3 */}
        {data.tradeoff && (
          <p className="text-xs text-muted-foreground italic border-t pt-3">
            💡 {data.tradeoff}
          </p>
        )}

        {/* Special Group 3 note */}
        {isGroup3 && (
          <p className="text-xs text-red-700 font-medium border-t pt-3">
            ✨ No trade-off! MSP members get the maximum 2.5% multiplier at ANY retirement age.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

