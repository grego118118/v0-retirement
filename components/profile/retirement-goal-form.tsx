"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Target, Calendar, DollarSign, Users } from "lucide-react"
import { useSession } from "next-auth/react"

const retirementGoalSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  membershipDate: z.string().min(1, "Membership date is required"),
  retirementGroup: z.enum(["1", "2", "3", "4"], {
    required_error: "Please select a retirement group",
  }),
  benefitPercentage: z.number().min(0).max(5),
  currentSalary: z.number().positive("Current salary must be positive"),
  averageHighest3Years: z.number().positive().optional(),
  yearsOfService: z.number().min(0).optional(),
  plannedRetirementAge: z.number().min(50).max(80).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
  retirementDate: z.string().optional(),
})

type RetirementGoalValues = z.infer<typeof retirementGoalSchema>

interface RetirementGoalFormProps {
  initialData?: any
  onUpdate: () => void
}

export function RetirementGoalForm({ initialData, onUpdate }: RetirementGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const form = useForm<RetirementGoalValues>({
    resolver: zodResolver(retirementGoalSchema),
    defaultValues: {
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      membershipDate: initialData?.membershipDate ? new Date(initialData.membershipDate).toISOString().split('T')[0] : "",
      retirementGroup: initialData?.retirementGroup || "1",
      benefitPercentage: initialData?.benefitPercentage || 2.5,
      currentSalary: initialData?.currentSalary || 0,
      averageHighest3Years: initialData?.averageHighest3Years || undefined,
      yearsOfService: initialData?.yearsOfService || undefined,
      plannedRetirementAge: initialData?.plannedRetirementAge || 65,
      retirementOption: initialData?.retirementOption || undefined,
      retirementDate: "",
    },
  })

  async function onSubmit(data: RetirementGoalValues) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your retirement goals",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Calculate retirement date if planned age is provided
      let retirementDate = ""
      if (data.plannedRetirementAge && data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth)
        const retirementYear = birthDate.getFullYear() + data.plannedRetirementAge
        retirementDate = new Date(retirementYear, birthDate.getMonth(), birthDate.getDate()).toISOString()
      }

      // Prepare data for retirement profile API
      const retirementProfileData = {
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        membershipDate: new Date(data.membershipDate).toISOString(),
        retirementGroup: data.retirementGroup,
        benefitPercentage: data.benefitPercentage,
        currentSalary: data.currentSalary,
        averageHighest3Years: data.averageHighest3Years,
        yearsOfService: data.yearsOfService,
        plannedRetirementAge: data.plannedRetirementAge,
        retirementOption: data.retirementOption,
      }

      // Save to retirement profile using the main profile API
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(retirementProfileData),
      })

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      // Parse the response to ensure it's valid JSON
      await response.json()

      // Also update basic profile with retirement date
      if (retirementDate) {
        await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: session.user.name || "",
            retirement_date: retirementDate.split('T')[0],
          }),
        })
      }

      toast({
        title: "Retirement goals updated",
        description: "Your retirement goals have been saved successfully.",
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating retirement goals:", error)
      toast({
        title: "Error",
        description: "Failed to update retirement goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plannedRetirementAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Planned Retirement Age
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="65"
                    min="50"
                    max="80"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormDescription>Age when you plan to retire</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retirementOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Retirement Option</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Goals...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Save Retirement Goals
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
