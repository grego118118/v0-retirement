"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Bot, Sparkles } from "lucide-react"
import { CalculatorCTA } from "@/components/blog/calculator-cta"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { EnhancedBlogGrid } from "@/components/blog/enhanced-blog-grid"
import { BlogCategoryFilter } from "@/components/blog/blog-category-filter"
import { useState } from 'react'

export default function BlogClientComponent() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAIGenerated, setShowAIGenerated] = useState(true)

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Massachusetts Retirement Planning Blog</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Expert articles, AI-powered insights, and comprehensive guides to help Massachusetts state employees plan for retirement and maximize their pension benefits.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
              <Bot className="w-3 h-3 mr-1" />
              AI-Enhanced Content
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Sparkles className="w-3 h-3 mr-1" />
              Expert Reviewed
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10"
                  aria-label="Search articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <BlogCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                showAIGenerated={showAIGenerated}
                onAIGeneratedChange={setShowAIGenerated}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Featured AI Content Notice */}
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI-Powered Content</h3>
                  <p className="text-sm text-gray-600">
                    Our advanced AI system generates comprehensive, fact-checked articles about Massachusetts retirement benefits,
                    reviewed by experts for accuracy and relevance.
                  </p>
                </div>
              </div>
            </div>

            {/* Calculator CTA */}
            <div className="mb-8">
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
              showAIGenerated={showAIGenerated}
            />

          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Stay Updated with AI-Powered Insights</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Subscribe to receive the latest AI-generated retirement planning insights, pension updates, and personalized
              resources for Massachusetts state employees.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Your email address" type="email" className="sm:flex-1" />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Get weekly AI-curated content. We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
