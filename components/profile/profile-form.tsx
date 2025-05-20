"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  retirementDate: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    return selectedDate >= today
  }, "Retirement date must be in the future"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  initialData?: {
    fullName: string
    retirementDate: string
  }
  onUpdate: () => void
}

export function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      retirementDate: initialData?.retirementDate || "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("users_metadata").upsert(
        {
          id: user.id,
          full_name: data.fullName,
          retirement_date: data.retirementDate,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and retirement date.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>This is your full name as it will appear on your profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="retirementDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retirement Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your expected retirement date. This will be used to calculate your countdown.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Your profile information is only used to personalize your experience and is not shared with third parties.
        </p>
      </CardFooter>
    </Card>
  )
}
