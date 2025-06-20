"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { DollarSign, Briefcase, TrendingUp, Loader2, CheckCircle, Save } from "lucide-react"

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
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()
  const { data: session, status } = useSession()

  const form = useForm<EmploymentInfoFormValues>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      currentSalary: initialData?.currentSalary || 0,
      averageHighest3Years: initialData?.averageHighest3Years || 0,
      yearsOfService: initialData?.yearsOfService || 0,
    },
  })

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async (data: EmploymentInfoFormValues) => {
    if (!session?.user?.id || status !== "authenticated") return

    try {
      setIsAutoSaving(true)

      const payload = {
        currentSalary: data.currentSalary,
        averageHighest3Years: data.averageHighest3Years,
        yearsOfService: data.yearsOfService,
      }

      const response = await fetch("/api/retirement/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
      setLastSaved(new Date())
      onUpdate(data)
    } catch (error) {
      console.error("Auto-save error:", error)
      // Don't show toast for auto-save errors to avoid spam
    } finally {
      setIsAutoSaving(false)
    }
  }, [session?.user?.id, status, onUpdate])

  // Watch for form changes and auto-save with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const subscription = form.watch((value) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Debounce auto-save by 2 seconds
      timeoutId = setTimeout(() => {
        if (value.currentSalary || value.averageHighest3Years || value.yearsOfService) {
          autoSave(value as EmploymentInfoFormValues)
        }
      }, 2000)
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [form.watch, autoSave])

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

            {/* Auto-save status indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isAutoSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>Changes auto-save</span>
                  </>
                )}
              </div>

              {onSave && (
                <Button type="submit" disabled={isLoading} variant="outline" size="sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Now"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
