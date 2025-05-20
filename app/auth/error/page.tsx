import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was a problem with the authentication process. This could be due to a network issue, expired session, or
          configuration problem.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
