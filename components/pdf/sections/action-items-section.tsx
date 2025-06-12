"use client"

import React from 'react'
import { formatDate } from '@/lib/utils'

interface ActionItem {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: Date
}

interface ActionItemsSectionProps {
  actionItems: ActionItem[]
}

export function ActionItemsSection({ actionItems }: ActionItemsSectionProps) {
  // Group action items by category
  const groupedItems = actionItems.reduce((groups, item) => {
    const category = item.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, ActionItem[]>)

  // Sort categories by priority
  const categoryOrder = ['profile', 'calculation', 'planning', 'optimization', 'education']
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'profile':
        return 'Profile Completion'
      case 'calculation':
        return 'Calculation Updates'
      case 'planning':
        return 'Retirement Planning'
      case 'optimization':
        return 'Benefit Optimization'
      case 'education':
        return 'Education & Learning'
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'profile':
        return 'Complete your retirement profile for accurate benefit calculations'
      case 'calculation':
        return 'Update and maintain current retirement benefit calculations'
      case 'planning':
        return 'Strategic planning for your retirement transition'
      case 'optimization':
        return 'Maximize your retirement benefits and service credit'
      case 'education':
        return 'Learn about retirement options and planning strategies'
      default:
        return 'Additional recommendations for your retirement planning'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'in-progress':
        return '🔄'
      case 'dismissed':
        return '❌'
      default:
        return '⏳'
    }
  }

  // Calculate completion statistics
  const totalItems = actionItems.length
  const completedItems = actionItems.filter(item => item.status === 'completed').length
  const pendingItems = actionItems.filter(item => item.status === 'pending').length
  const inProgressItems = actionItems.filter(item => item.status === 'in-progress').length
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <section className="report-section page-break-before">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Personalized Action Items & Recommendations
      </h2>

      {/* Overview Statistics */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-700">{totalItems}</div>
            <div className="text-xs text-blue-600">Total Items</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-700">{completedItems}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-700">{pendingItems + inProgressItems}</div>
            <div className="text-xs text-yellow-600">Active</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-700">{completionRate.toFixed(0)}%</div>
            <div className="text-xs text-purple-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 text-center">
          {completedItems} of {totalItems} action items completed
        </div>
      </div>

      {/* Action Items by Category */}
      {sortedCategories.map((category) => (
        <div key={category} className="mb-6 page-break-avoid">
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-800 mb-1">
              {getCategoryTitle(category)}
            </h3>
            <p className="text-sm text-gray-600">
              {getCategoryDescription(category)}
            </p>
          </div>

          <div className="space-y-3">
            {groupedItems[category]
              .sort((a, b) => {
                // Sort by priority (high, medium, low) then by status
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                const statusOrder = { pending: 3, 'in-progress': 2, completed: 1, dismissed: 0 }
                
                const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                                   (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
                if (priorityDiff !== 0) return priorityDiff
                
                return (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
                       (statusOrder[a.status as keyof typeof statusOrder] || 0)
              })
              .map((item) => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-4 ${
                    item.status === 'completed' ? 'bg-green-50 border-green-200' :
                    item.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                    item.status === 'dismissed' ? 'bg-gray-50 border-gray-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPriorityIcon(item.priority)}</span>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(item.status)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">
                      {item.priority} Priority • {item.category}
                    </span>
                    <span>
                      Created: {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Next Steps Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-md font-medium text-blue-800 mb-3">Recommended Next Steps</h3>
        
        {pendingItems > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-blue-700 mb-3">
              Focus on completing these high-priority action items to optimize your retirement planning:
            </p>
            
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              {actionItems
                .filter(item => item.status === 'pending')
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 }
                  return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                         (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
                })
                .slice(0, 5)
                .map((item, index) => (
                  <li key={item.id} className="leading-relaxed">
                    <strong>{item.title}</strong> - {item.description}
                  </li>
                ))}
            </ol>
            
            {pendingItems > 5 && (
              <p className="text-xs text-blue-600 mt-2">
                Plus {pendingItems - 5} additional action items to review.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm text-blue-700 font-medium">
              Congratulations! You've completed all your action items.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Check back regularly for new personalized recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Action items are generated based on your current profile and calculation data</li>
          <li>Recommendations are updated automatically as you complete items and update your information</li>
          <li>High-priority items should be addressed first for optimal retirement planning</li>
          <li>Contact the Massachusetts Retirement System for official guidance on complex situations</li>
        </ul>
      </div>
    </section>
  )
}
