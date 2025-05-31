"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Trash2, Eye, ArrowRight, Heart, Calendar, DollarSign, Star, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SavedCalculations() {
  const router = useRouter()
  const { calculations, deleteCalculation, loading } = useRetirementData()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setSelectedCalc(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCalc) {
      await deleteCalculation(selectedCalc)
      setDeleteDialogOpen(false)
      setSelectedCalc(null)
    }
  }

  const getOptionDescription = (option: string) => {
    switch (option) {
      case 'A': return 'Maximum Allowance'
      case 'B': return 'Annuity Protection'
      case 'C': return 'Joint Survivor'
      default: return option
    }
  }

  // Show loading skeleton while data is being fetched
  if (loading && (!calculations || calculations.length === 0)) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!calculations || calculations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No saved calculations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first pension calculation to compare different retirement scenarios.
          </p>
        </div>
        <Button onClick={() => router.push("/calculator")}>
          Create New Calculation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className="relative p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              {calc.isFavorite && (
                <Star className="absolute top-3 right-3 h-4 w-4 text-amber-500 fill-amber-500" />
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{calc.calculationName || `Calculation ${calc.id?.slice(0, 8) || 'Unknown'}`}</h3>
                    <Badge variant="outline" className="text-xs">
                      Option {calc.retirementOption}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {calc.createdAt ? formatDate(new Date(calc.createdAt)) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-muted/50 rounded-md p-2">
                  <div className="text-xs text-muted-foreground mb-1">Monthly Benefit</div>
                  <div className="font-semibold text-sm text-green-600">
                    {formatCurrency(calc.monthlyBenefit)}
                  </div>
                  {calc.socialSecurityData?.selectedMonthlyBenefit && (
                    <div className="text-xs text-muted-foreground">
                      Pension only
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <div className="text-xs text-muted-foreground mb-1">Retirement Age</div>
                  <div className="font-semibold text-sm">
                    {calc.retirementAge} years
                  </div>
                </div>
              </div>

              {/* Social Security Integration Display */}
              {calc.socialSecurityData?.selectedMonthlyBenefit && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-md p-3 mb-3">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Combined Income Analysis
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">MA Pension</div>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(calc.monthlyBenefit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Social Security</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(calc.socialSecurityData.selectedMonthlyBenefit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total/Month</div>
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(calc.monthlyBenefit + calc.socialSecurityData.selectedMonthlyBenefit)}
                      </div>
                    </div>
                  </div>
                  {calc.socialSecurityData.replacementRatio && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="text-xs text-muted-foreground">
                        Income Replacement: {Math.round(calc.socialSecurityData.replacementRatio * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{calc.yearsOfService} years service</span>
                <span>{getOptionDescription(calc.retirementOption)}</span>
                {calc.benefitReduction && (
                  <span className="text-orange-600">
                    -{(calc.benefitReduction * 100).toFixed(1)}% reduction
                  </span>
                )}
              </div>

              {calc.notes && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mb-3">
                  {calc.notes}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => router.push(`/calculator?load=${calc.id}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(calc.id!)}
                  className="text-xs"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {calculations.length} saved calculation{calculations.length !== 1 ? 's' : ''}
          </span>
          <Button variant="outline" size="sm" onClick={() => router.push("/calculator")}>
            <ArrowRight className="h-3 w-3 mr-1" />
            New Calculation
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this calculation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 