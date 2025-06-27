"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)

  // Mock search results - in a real implementation, this would come from a search API
  const results = [
    {
      type: "page",
      title: "Pension Calculator",
      description: "Calculate your Massachusetts state employee pension benefits.",
      url: "/calculator",
    },
    {
      type: "page",
      title: "About the Massachusetts Pension Estimator",
      description: "Learn about our mission to help state employees plan for retirement.",
      url: "/about",
    },
    {
      type: "blog",
      title: "Understanding Your Massachusetts Pension Options",
      description: "Learn about the three pension options available to Massachusetts state employees.",
      url: "/blog/understanding-massachusetts-pension-options",
    },
    {
      type: "resource",
      title: "Massachusetts State Retirement Board",
      description: "Official information about your Massachusetts state pension benefits.",
      url: "https://www.mass.gov/orgs/massachusetts-state-retirement-board",
      external: true,
    },
    {
      type: "faq",
      title: "When am I eligible to retire?",
      description: "Information about retirement eligibility for Massachusetts state employees.",
      url: "/faq#eligibility",
    },
  ].filter(
    (item) =>
      query &&
      (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())),
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Search Results</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for retirement information..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </div>
        </form>

        {query ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {results.length} results for <span className="font-medium text-foreground">"{query}"</span>
              </p>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {result.external ? (
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors flex items-center gap-1"
                              >
                                {result.title}
                                <SearchIcon className="h-3 w-3" />
                              </a>
                            ) : (
                              <Link href={result.url} className="hover:text-primary transition-colors">
                                {result.title}
                              </Link>
                            )}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                        </div>
                        <CardDescription>{result.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground truncate">{result.url}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-sm mt-2">
                      Try different keywords or check out our{" "}
                      <Link href="/resources" className="text-primary hover:underline">
                        resources page
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Other tab contents would be similar but filtered by type */}
              <TabsContent value="pages" className="space-y-4">
                {results.filter((r) => r.type === "page").length > 0 ? (
                  results
                    .filter((r) => r.type === "page")
                    .map((result, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            <Link href={result.url} className="hover:text-primary transition-colors">
                              {result.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>{result.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground truncate">{result.url}</p>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No page results found for "{query}"</p>
                  </div>
                )}
              </TabsContent>

              {/* Similar TabsContent components for blog, resources, and faq */}
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Search Mass Pension</h2>
            <p className="text-muted-foreground mb-6">
              Enter keywords above to search for retirement information, pension calculations, and resources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/search?q=pension+options" className="text-primary hover:underline">
                        Pension options
                      </Link>
                    </li>
                    <li>
                      <Link href="/search?q=retirement+eligibility" className="text-primary hover:underline">
                        Retirement eligibility
                      </Link>
                    </li>
                    <li>
                      <Link href="/search?q=creditable+service" className="text-primary hover:underline">
                        Creditable service
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/calculator" className="text-primary hover:underline">
                        Pension Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-primary hover:underline">
                        Retirement Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources" className="text-primary hover:underline">
                        Resources
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Help Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/faq" className="text-primary hover:underline">
                        Frequently Asked Questions
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-primary hover:underline">
                        Contact Support
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="text-primary hover:underline">
                        About the Calculator
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
