"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, BookOpen } from "lucide-react"
import { CalculatorCTA } from "@/components/blog/calculator-cta"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { EnhancedBlogGrid } from "@/components/blog/enhanced-blog-grid"
import { BlogCategoryFilter } from "@/components/blog/blog-category-filter"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { useState } from 'react'

export default function BlogClientComponent() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-mrs-navy-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mrs-page-wrapper relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-6">Massachusetts Retirement Planning Blog</h1>
            <p className="text-blue-100/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
              Expert articles and comprehensive guides to help Massachusetts state employees plan for retirement and maximize their pension benefits.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-mrs-gold-500/20 text-mrs-gold-100 border-mrs-gold-400/30 px-3 py-1.5 backdrop-blur-sm">
                <BookOpen className="w-3.5 h-3.5 mr-2" />
                In-Depth Guides
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 px-3 py-1.5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Expert Reviewed
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Blog" }]}
            className="mb-6"
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Search Bar - White Background for Contrast */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    className="pl-10 bg-white border-slate-200"
                    aria-label="Search articles"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filters */}
                <BlogCategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">

              {/* Calculator CTA - Clean Style */}
              <div className="mb-0">
                <CalculatorCTA variant="featured" />
              </div>

              {/* AdSense Ad for Free Users */}
              <div className="mb-8">
                <ResponsiveAd className="flex justify-center" />
                <PremiumAlternative />
              </div>

              {/* Enhanced Blog Grid */}
              <EnhancedBlogGrid
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />

            </div>
          </div>

          {/* Newsletter Signup - Clean Style */}
          <div className="mt-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated on Massachusetts Retirement</h2>
              <p className="text-gray-600 mb-6">
                Subscribe to receive the latest retirement planning insights, pension updates, and personalized
                resources for Massachusetts state employees.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input placeholder="Your email address" type="email" className="flex-1" />
                <Button className="bg-mrs-navy-900 text-white hover:bg-mrs-navy-800">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Get weekly retirement planning content. We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
