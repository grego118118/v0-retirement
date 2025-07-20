"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bot, Filter, X } from 'lucide-react'
import { BlogCategory } from '@/types/ai-blog'

interface BlogCategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  showAIGenerated: boolean
  onAIGeneratedChange: (show: boolean) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function BlogCategoryFilter({
  selectedCategory,
  onCategoryChange,
  showAIGenerated,
  onAIGeneratedChange,
  searchQuery,
  onSearchChange
}: BlogCategoryFilterProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      // Mock categories - would fetch from API in production
      const mockCategories: BlogCategory[] = [
        {
          id: 'all',
          name: 'All Topics',
          slug: 'all',
          description: 'All blog posts',
          color: '#3B82F6',
          icon: '📚',
          sort_order: 0,
          is_ai_topic: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'pension-planning',
          name: 'Pension Planning',
          slug: 'pension-planning',
          description: 'Strategies for maximizing Massachusetts pension benefits',
          color: '#059669',
          icon: '💰',
          sort_order: 1,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'cola-adjustments',
          name: 'COLA Adjustments',
          slug: 'cola-adjustments',
          description: 'Cost of Living Adjustment updates and impact analysis',
          color: '#DC2626',
          icon: '📈',
          sort_order: 2,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'group-classifications',
          name: 'Group Classifications',
          slug: 'group-classifications',
          description: 'Retirement guidance for Groups 1-4 employees',
          color: '#7C3AED',
          icon: '👥',
          sort_order: 3,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'social-security',
          name: 'Social Security',
          slug: 'social-security',
          description: 'Coordinating Massachusetts pensions with Social Security',
          color: '#2563EB',
          icon: '🏛️',
          sort_order: 4,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'retirement-timing',
          name: 'Retirement Timing',
          slug: 'retirement-timing',
          description: 'Optimal retirement age and timing strategies',
          color: '#EA580C',
          icon: '⏰',
          sort_order: 5,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'benefit-calculations',
          name: 'Benefit Calculations',
          slug: 'benefit-calculations',
          description: 'Understanding pension calculation methods',
          color: '#0891B2',
          icon: '🧮',
          sort_order: 6,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'legislative-updates',
          name: 'Legislative Updates',
          slug: 'legislative-updates',
          description: 'Massachusetts retirement law changes and updates',
          color: '#BE185D',
          icon: '📜',
          sort_order: 7,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'financial-planning',
          name: 'Financial Planning',
          slug: 'financial-planning',
          description: 'Comprehensive retirement financial planning',
          color: '#16A34A',
          icon: '📊',
          sort_order: 8,
          is_ai_topic: true,
          created_at: new Date().toISOString()
        }
      ]

      setCategories(mockCategories)
      setLoading(false)
    } catch (error) {
      console.error('Error loading categories:', error)
      setLoading(false)
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    onCategoryChange(categorySlug)
  }

  const clearFilters = () => {
    onCategoryChange('all')
    onSearchChange('')
    onAIGeneratedChange(true)
  }

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery || !showAIGenerated

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Categories
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug
            return (
              <Badge
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors hover:opacity-80 ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-primary/10'
                }`}
                style={{
                  backgroundColor: isSelected ? category.color : undefined,
                  borderColor: category.color,
                  color: isSelected ? 'white' : category.color
                }}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* AI Content Filter */}
      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <Bot className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <Label htmlFor="ai-content-toggle" className="text-sm font-medium text-purple-900">
            Show AI-Generated Content
          </Label>
          <p className="text-xs text-purple-700">
            Include articles created by our AI content system
          </p>
        </div>
        <Switch
          id="ai-content-toggle"
          checked={showAIGenerated}
          onCheckedChange={onAIGeneratedChange}
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-900">
              <span className="font-medium">Active Filters:</span>
              <div className="mt-1 space-y-1">
                {selectedCategory !== 'all' && (
                  <div className="text-xs">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name}
                  </div>
                )}
                {searchQuery && (
                  <div className="text-xs">
                    Search: "{searchQuery}"
                  </div>
                )}
                {!showAIGenerated && (
                  <div className="text-xs">
                    Hiding AI-generated content
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Category Descriptions */}
      {selectedCategory !== 'all' && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          {(() => {
            const category = categories.find(c => c.slug === selectedCategory)
            if (!category) return null
            
            return (
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.is_ai_topic && (
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
                      <Bot className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">{category.description}</p>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
