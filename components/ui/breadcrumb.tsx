import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import Script from "next/script"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mapensionestimator.gov",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `https://mapensionestimator.gov${item.href}`,
      })),
    ],
  }

  return (
    <>
      <Script id="breadcrumb-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="flex items-center hover:text-primary">
              <Home className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" aria-hidden="true" />
              {item.isCurrent ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
