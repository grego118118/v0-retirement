"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Target, Calendar, Settings } from "lucide-react"

const retirementPlanningSchema = z.object({
  plannedRetirementAge: z.number().min(50, "Minimum retirement age is 50").max(80, "Maximum retirement age is 80"),
  retirementOption: z.string().min(1, "Retirement option is required"),
  benefitPercentage: z.number().min(1, "Benefit percentage is required"),
})

type RetirementPlanningFormValues = z.infer<typeof retirementPlanningSchema>

interface RetirementPlanningFormProps {
  initialData?: Partial<RetirementPlanningFormValues>
  onUpdate: (data: Partial<RetirementPlanningFormValues>) => void
  onSave?: (data: RetirementPlanningFormValues) => Promise<void>
  retirementGroup?: string
}

export function RetirementPlanningForm({ initialData, onUpdate, onSave, retirementGroup }: RetirementPlanningFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Calculate benefit percentage based on retirement group
  const getBenefitPercentage = (group: string) => {
    switch (group) {
      case "Group 1": return 2.0
      case "Group 2": return 2.0
      case "Group 3": return 2.5
      case "Group 4": return 2.5
      default: return 2.0
    }
  }

  const form = useForm<RetirementPlanningFormValues>({
    resolver: zodResolver(retirementPlanningSchema),
    defaultValues: {
      plannedRetirementAge: initialData?.plannedRetirementAge || 65,
      retirementOption: initialData?.retirementOption || "A",
      benefitPercentage: initialData?.benefitPercentage || getBenefitPercentage(retirementGroup || "Group 1"),
    },
  })

  // Watch for form changes and trigger real-time updates
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && value[name] !== undefined) {
        // Use setTimeout to prevent infinite loops
        setTimeout(() => {
          onUpdate({ [name]: value[name] })
        }, 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, onUpdate])

  // Update benefit percentage when retirement group changes
  React.useEffect(() => {
    if (retirementGroup) {
      const newBenefitPercentage = getBenefitPercentage(retirementGroup)
      form.setValue("benefitPercentage", newBenefitPercentage)
      setTimeout(() => {
        onUpdate({ benefitPercentage: newBenefitPercentage })
      }, 0)
    }
  }, [retirementGroup, form.setValue, onUpdate])

  async function onSubmit(data: RetirementPlanningFormValues) {
    if (!onSave) return
    
    setIsLoading(true)
    try {
      await onSave(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Retirement Planning
        </CardTitle>
        <CardDescription>
          Your retirement goals and benefit options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plannedRetirementAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Planned Retirement Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="65"
                        min="50"
                        max="80"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 65)}
                      />
                    </FormControl>
                    <FormDescription>Age when you plan to retire</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefitPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Benefit Percentage
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 2.0)}
                        disabled={true} // Auto-calculated based on group
                      />
                    </FormControl>
                    <FormDescription>
                      Benefit multiplier (auto-calculated based on your retirement group)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="retirementOption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Retirement Option</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Option A - Maximum Allowance</SelectItem>
                      <SelectItem value="B">Option B - 100% Joint & Survivor</SelectItem>
                      <SelectItem value="C">Option C - 66.7% Joint & Survivor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your preferred retirement benefit option</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {onSave && (
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Retirement Planning"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
