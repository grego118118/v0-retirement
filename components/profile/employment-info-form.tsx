"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DollarSign, Briefcase, TrendingUp } from "lucide-react"

const employmentInfoSchema = z.object({
  currentSalary: z.number().min(0, "Current salary must be positive"),
  averageHighest3Years: z.number().min(0, "Average salary must be positive").optional(),
  yearsOfService: z.number().min(0, "Years of service must be positive").optional(),
})

type EmploymentInfoFormValues = z.infer<typeof employmentInfoSchema>

interface EmploymentInfoFormProps {
  initialData?: Partial<EmploymentInfoFormValues>
  onUpdate: (data: Partial<EmploymentInfoFormValues>) => void
  onSave?: (data: EmploymentInfoFormValues) => Promise<void>
}

export function EmploymentInfoForm({ initialData, onUpdate, onSave }: EmploymentInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EmploymentInfoFormValues>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      currentSalary: initialData?.currentSalary || 0,
      averageHighest3Years: initialData?.averageHighest3Years || 0,
      yearsOfService: initialData?.yearsOfService || 0,
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

  async function onSubmit(data: EmploymentInfoFormValues) {
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
          <Briefcase className="h-5 w-5" />
          Employment Information
        </CardTitle>
        <CardDescription>
          Your salary and service information for benefit calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Annual Salary
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="75000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Your current annual salary</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="averageHighest3Years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Average Highest 3 Years
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Average of your highest 3 consecutive years of salary</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsOfService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Years of Service
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Total years of creditable service</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {onSave && (
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Employment Information"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
