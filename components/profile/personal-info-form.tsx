"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar, User, Users } from "lucide-react"

const personalInfoSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  membershipDate: z.string().min(1, "Membership date is required"),
  retirementGroup: z.string().min(1, "Retirement group is required"),
})

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfoFormValues>
  onUpdate: (data: Partial<PersonalInfoFormValues>) => void
  onSave?: (data: PersonalInfoFormValues) => Promise<void>
}

export function PersonalInfoForm({ initialData, onUpdate, onSave }: PersonalInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      dateOfBirth: initialData?.dateOfBirth || "",
      membershipDate: initialData?.membershipDate || "",
      retirementGroup: initialData?.retirementGroup || "Group 1",
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

  async function onSubmit(data: PersonalInfoFormValues) {
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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>When you joined the Massachusetts Retirement System</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="Group 1">Group 1 - General Employees</SelectItem>
                      <SelectItem value="Group 2">Group 2 - Teachers</SelectItem>
                      <SelectItem value="Group 3">Group 3 - Public Safety</SelectItem>
                      <SelectItem value="Group 4">Group 4 - State Police</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your Massachusetts Retirement System group classification</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {onSave && (
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Personal Information"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
