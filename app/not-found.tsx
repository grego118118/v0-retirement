import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileSearch } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <FileSearch className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calculator">Try Our Calculator</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
