"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Calendar, User, Users, Target, Loader2, CheckCircle, Save } from "lucide-react"

// Helper functions for date format conversion
const convertISOToDateInput = (isoDate: string | null | undefined): string => {
  if (!isoDate) return ""
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ""
    // Convert to YYYY-MM-DD format for HTML date input
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('Error converting ISO date to input format:', error)
    return ""
  }
}

const convertDateInputToISO = (dateInput: string | null | undefined): string => {
  if (!dateInput) return ""
  try {
    // HTML date input gives us YYYY-MM-DD format
    // Convert to ISO string for API
    const date = new Date(dateInput + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) return ""
    return date.toISOString()
  } catch (error) {
    console.warn('Error converting date input to ISO format:', error)
    return ""
  }
}

const personalInfoSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  membershipDate: z.string().min(1, "Membership date is required"),
  retirementGroup: z.enum(["1", "2", "3", "4"], {
    required_error: "Please select a retirement group",
  }),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
})

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfoFormValues>
  onUpdate: (data: Partial<PersonalInfoFormValues>) => void
  onSave?: (data: PersonalInfoFormValues) => Promise<void>
}

export function PersonalInfoForm({ initialData, onUpdate, onSave }: PersonalInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()
  const { data: session, status } = useSession()

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      dateOfBirth: convertISOToDateInput(initialData?.dateOfBirth) || "",
      membershipDate: convertISOToDateInput(initialData?.membershipDate) || "",
      retirementGroup: initialData?.retirementGroup || "1",
      retirementOption: initialData?.retirementOption || undefined,
    },
  })

  // Update form when initialData changes, but preserve user input
  useEffect(() => {
    if (initialData) {
      const currentValues = form.getValues()
      const newValues = {
        dateOfBirth: convertISOToDateInput(initialData.dateOfBirth) || currentValues.dateOfBirth || "",
        membershipDate: convertISOToDateInput(initialData.membershipDate) || currentValues.membershipDate || "",
        retirementGroup: initialData.retirementGroup || currentValues.retirementGroup || "1",
        retirementOption: initialData.retirementOption || currentValues.retirementOption || undefined,
      }

      // Only reset if the values are actually different to avoid clearing user input
      if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
        form.reset(newValues)
      }
    }
  }, [initialData, form])

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async (data: PersonalInfoFormValues) => {
    if (!session?.user?.id || status !== "authenticated") return

    try {
      setIsAutoSaving(true)

      const payload = {
        dateOfBirth: convertDateInputToISO(data.dateOfBirth),
        membershipDate: convertDateInputToISO(data.membershipDate),
        retirementGroup: data.retirementGroup,
        retirementOption: data.retirementOption,
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
      // Only update parent state without triggering profile refetch during auto-save
      // to prevent form state conflicts
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
        if (value.dateOfBirth || value.membershipDate || value.retirementGroup || value.retirementOption) {
          autoSave(value as PersonalInfoFormValues)
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

  // Manual save function that updates parent state
  const manualSave = useCallback(async (data: PersonalInfoFormValues) => {
    if (!session?.user?.id || status !== "authenticated") return

    try {
      setIsLoading(true)

      const payload = {
        dateOfBirth: convertDateInputToISO(data.dateOfBirth),
        membershipDate: convertDateInputToISO(data.membershipDate),
        retirementGroup: data.retirementGroup,
        retirementOption: data.retirementOption,
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
      onUpdate(data) // Update parent state and trigger profile refetch

      toast({
        title: "Success",
        description: "Personal information saved successfully",
      })
    } catch (error) {
      console.error("Manual save error:", error)
      toast({
        title: "Error",
        description: "Failed to save personal information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, status, onUpdate, toast])

  async function onSubmit(data: PersonalInfoFormValues) {
    if (onSave) {
      await onSave(data)
    } else {
      await manualSave(data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your basic personal and membership information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min="1950-01-01"
                        max="2030-12-31"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Your date of birth for age calculations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="membershipDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Membership Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min="1950-01-01"
                        max="2030-12-31"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>When you joined the Massachusetts Retirement System</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retirementGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Retirement Group
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Group 1 - General Employees</SelectItem>
                        <SelectItem value="2">Group 2 - Teachers</SelectItem>
                        <SelectItem value="3">Group 3 - Public Safety</SelectItem>
                        <SelectItem value="4">Group 4 - State Police</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Your Massachusetts Retirement System group classification</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retirementOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Preferred Retirement Option
                    </FormLabel>
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

              <Button type="submit" disabled={isLoading || isAutoSaving} variant="outline" size="sm">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
