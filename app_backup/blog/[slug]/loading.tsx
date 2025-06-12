import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BlogPostLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/blog" className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>

          <Skeleton className="h-6 w-24 mb-4" />

          <Skeleton className="h-10 w-full mb-4" />

          <Skeleton className="h-6 w-3/4 mb-6" />

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <Skeleton className="h-4 w-48" />
          </div>

          <Skeleton className="relative h-[300px] md:h-[400px] mb-8 rounded-lg" />

          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>

        {/* Article Content Skeleton */}
        <div className="space-y-4 mb-12">
          <Skeleton className="h-8 w-2/3 mb-6" />

          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}

          <Skeleton className="h-8 w-1/2 mt-8 mb-4" />

          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i + 10} className="h-4 w-full" />
          ))}

          <Skeleton className="h-8 w-1/2 mt-8 mb-4" />

          <Skeleton className="h-24 w-full rounded-md" />

          {[1, 2, 3].map((i) => (
            <Skeleton key={i + 20} className="h-4 w-full" />
          ))}
        </div>

        {/* Author Bio Skeleton */}
        <Skeleton className="h-40 w-full rounded-lg mb-12" />

        {/* Related Articles Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Navigation Skeleton */}
        <div className="flex justify-between items-center border-t pt-8 mb-12">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Newsletter Signup Skeleton */}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
