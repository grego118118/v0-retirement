"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  RefreshCw,
  Plus,
  Filter,
  X,
  ExternalLink,
  Calendar,
  User,
  Calculator,
  BookOpen,
  Settings,
  MessageCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useActionItems, ActionItem } from '@/hooks/use-action-items'
import { formatDate } from '@/lib/utils'
import { recordUserAction } from '@/components/error-boundary/error-monitoring'

interface ActionItemsProps {
  showHeader?: boolean
  maxItems?: number
  categories?: string[]
  priorities?: string[]
  className?: string
}

export function ActionItems({
  showHeader = true,
  maxItems,
  categories,
  priorities,
  className = '',
}: ActionItemsProps) {
  const router = useRouter()
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const {
    actionItems,
    stats,
    isLoading,
    isGenerating,
    error,
    generateActionItems,
    completeActionItem,
    dismissActionItem,
    refreshData,
  } = useActionItems({
    includeCompleted: showCompleted,
    category: categories,
    priority: priorities,
  })

  // Filter and limit items
  let filteredItems = actionItems
  
  if (selectedCategory) {
    filteredItems = filteredItems.filter(item => item.category === selectedCategory)
  }
  
  if (maxItems) {
    filteredItems = filteredItems.slice(0, maxItems)
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile':
        return User
      case 'calculation':
        return Calculator
      case 'planning':
        return Target
      case 'optimization':
        return TrendingUp
      case 'education':
        return BookOpen
      default:
        return Target
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        }
      case 'in-progress':
        return {
          icon: Clock,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        }
      case 'dismissed':
        return {
          icon: X,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        }
    }
  }

  // Handle action item click
  const handleActionItemClick = async (item: ActionItem) => {
    recordUserAction('click_action_item', 'action-items', { 
      id: item.id, 
      category: item.category,
      actionType: item.actionType 
    })

    if (item.actionUrl) {
      if (item.actionType === 'navigate') {
        router.push(item.actionUrl)
      } else if (item.actionType === 'learn') {
        window.open(item.actionUrl, '_blank')
      }
    }
  }

  // Handle complete action
  const handleComplete = async (item: ActionItem, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await completeActionItem(item.id)
      recordUserAction('complete_action_item', 'action-items', { id: item.id })
    } catch (error) {
      console.error('Failed to complete action item:', error)
    }
  }

  // Handle dismiss action
  const handleDismiss = async (item: ActionItem, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await dismissActionItem(item.id, 'User dismissed')
      recordUserAction('dismiss_action_item', 'action-items', { id: item.id })
    } catch (error) {
      console.error('Failed to dismiss action item:', error)
    }
  }

  // Handle generate action items
  const handleGenerate = async () => {
    try {
      await generateActionItems()
      recordUserAction('generate_action_items', 'action-items')
    } catch (error) {
      console.error('Failed to generate action items:', error)
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load action items. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4 lg:pb-6 px-6 lg:px-8 pt-6 lg:pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-4 text-xl lg:text-2xl">
                <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                  <Target className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <span className="text-slate-800 dark:text-slate-200">Action Items</span>
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Personalized recommendations to optimize your retirement planning
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {stats && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="text-lg lg:text-xl font-bold text-purple-600">
                          {stats.completionRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stats.completed} of {stats.total} items completed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {stats && stats.total > 0 && (
            <div className="space-y-2">
              <Progress value={stats.completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.activeItems} active items</span>
                <span>{stats.completed} completed</span>
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="px-6 lg:px-8 pb-6 lg:pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Action Items</h3>
            <p className="text-muted-foreground mb-4">
              {actionItems.length === 0 
                ? "Generate personalized recommendations to get started"
                : "All action items completed! Generate new recommendations to stay on track"
              }
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category)
              const statusDisplay = getStatusDisplay(item.status)
              const StatusIcon = statusDisplay.icon

              return (
                <div
                  key={item.id}
                  className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    item.status === 'completed' ? 'opacity-75' : ''
                  } ${statusDisplay.bgColor}`}
                  onClick={() => handleActionItemClick(item)}
                >
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      item.priority === 'high' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : item.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm lg:text-base leading-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority}
                          </Badge>
                          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                        </div>
                      </div>
                      
                      <p className="text-xs lg:text-sm text-muted-foreground mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Action buttons */}
                      {item.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleComplete(item, e)}
                            className="h-7 px-3 text-xs gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDismiss(item, e)}
                            className="h-7 px-3 text-xs gap-1"
                          >
                            <X className="h-3 w-3" />
                            Dismiss
                          </Button>
                          {item.actionUrl && (
                            <div className="ml-auto">
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.expiresAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires {formatDate(item.expiresAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Show more button */}
        {maxItems && actionItems.length > maxItems && (
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/action-items')}>
              View All {actionItems.length} Action Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
