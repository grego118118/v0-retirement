"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Calculation {
  id: string
  name: string
  created_at: string
  group_type: string
  salary1: string
  salary2: string
  salary3: string
  retirement_option: string
}

export function SavedCalculations() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()

  const fetchCalculations = async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/retirement/calculations?limit=20")

      if (!response.ok) {
        throw new Error("Failed to fetch calculations")
      }

      const data = await response.json()
      setCalculations(data.calculations || [])
    } catch (error) {
      console.error("Error fetching calculations:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved calculations.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchCalculations()
    } else {
      setIsLoading(false)
    }
  }, [session])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete calculation")
      }

      setCalculations((prev) => prev.filter((calc) => calc.id !== id))
      toast({
        title: "Calculation deleted",
        description: "Your saved calculation has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting calculation:", error)
      toast({
        title: "Error",
        description: "Failed to delete calculation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Saved Calculations</CardTitle>
          <CardDescription>You haven't saved any pension calculations yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calculator className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <p className="mb-4">Use our calculator to estimate your pension and save the results here.</p>
          <Button asChild>
            <Link href="/calculator">Go to Calculator</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {calculations.map((calculation) => {
        const avgSalary =
          (Number.parseFloat(calculation.salary1) +
            Number.parseFloat(calculation.salary2) +
            Number.parseFloat(calculation.salary3)) /
          3

        return (
          <Card key={calculation.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{calculation.name}</CardTitle>
                  <CardDescription>Created on {new Date(calculation.created_at).toLocaleDateString()}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(calculation.id)}
                  disabled={deletingId === calculation.id}
                >
                  {deletingId === calculation.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Group</p>
                  <p className="text-sm text-muted-foreground">{calculation.group_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Salary</p>
                  <p className="text-sm text-muted-foreground">${avgSalary.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Option</p>
                  <p className="text-sm text-muted-foreground">{calculation.retirement_option}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/calculator?load=${calculation.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
