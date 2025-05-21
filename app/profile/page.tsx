import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Disabled</CardTitle>
            <CardDescription>Authentication is temporarily disabled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Authentication has been temporarily disabled to resolve deployment issues. Please use the calculator
                without signing in for now.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/calculator">Go to Calculator</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
