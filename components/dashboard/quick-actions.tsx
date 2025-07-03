"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  TrendingUp,
  FileText,
  Download,
  Share2,
  Settings,
  HelpCircle,
  Zap,
  Target,
  BarChart3,
  PlusCircle,
  RefreshCw,
  BookOpen,
  User,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  Crown
} from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuickActionsProps {
  hasCalculations?: boolean
  latestCalculation?: any
  onRefresh?: () => void
  isLoading?: boolean
  pensionProjection?: {
    currentAge: number
    retirementAge: number
    currentPension: number
    projectedPension: number
    yearsOfService: number
    maxBenefit: number
  }
  calculationStats?: {
    totalCalculations: number
    lastCalculationDate?: string
    retirementReadiness: 'on-track' | 'needs-attention' | 'excellent'
  }
}

export function QuickActions({
  hasCalculations = false,
  latestCalculation,
  onRefresh,
  isLoading = false,
  pensionProjection,
  calculationStats
}: QuickActionsProps) {
  const router = useRouter()
  const { isPremium } = useSubscriptionStatus()

  const primaryActions = [
    {
      id: 'new-analysis',
      title: 'New Combined Analysis',
      description: 'Create comprehensive retirement plan',
      icon: PlusCircle,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white',
      action: () => router.push('/wizard'),
      premium: false,
      badge: 'Popular',
      priority: 'high'
    },
    {
      id: 'pension-calculator',
      title: 'Quick Pension Calculator',
      description: 'Calculate MA pension benefits',
      icon: Calculator,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      textColor: 'text-white',
      action: () => router.push('/calculator'),
      premium: false,
      priority: 'high'
    },

  ]

  const secondaryActions = [
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download calculations as CSV',
      icon: Download,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      action: async () => {
        if (latestCalculation) {
          try {
            // Create CSV data for the latest calculation
            const csvData = [
              ['Massachusetts Retirement Data Export'],
              ['Generated on:', new Date().toLocaleDateString()],
              [''],
              ['Latest Calculation Summary'],
              ['Calculation ID:', latestCalculation.id],
              ['Created:', new Date(latestCalculation.createdAt).toLocaleDateString()],
              [''],
              ['Dashboard Statistics'],
              ['Total Calculations:', calculationStats.totalCalculations.toString()],
              ['Last Calculation Date:', calculationStats.lastCalculationDate],
              ['Retirement Readiness:', calculationStats.retirementReadiness],
              [''],
              ['Note: For detailed calculation data, use the Export button on individual calculations.']
            ]

            // Convert to CSV string
            const csvContent = csvData.map(row => row.join(',')).join('\n')

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            link.setAttribute('href', url)
            link.setAttribute('download', `MA_Retirement_Dashboard_Export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('Dashboard data exported successfully')
          } catch (error) {
            console.error('Export failed:', error)
          }
        }
      },
      premium: false,
      disabled: !hasCalculations,
      priority: 'medium'
    },
    {
      id: 'share-analysis',
      title: 'Share Analysis',
      description: 'Share with financial advisor',
      icon: Share2,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      textColor: 'text-white',
      action: async () => {
        if (latestCalculation) {
          try {
            // Create shareable URL
            const shareUrl = `${window.location.origin}/calculator?shared=${latestCalculation.id}`

            // Create share text
            const shareText = `Check out my Massachusetts Retirement Analysis! View my pension calculation and retirement planning details.`

            // Try to use Web Share API if available
            if (navigator.share) {
              await navigator.share({
                title: 'Massachusetts Retirement Analysis',
                text: shareText,
                url: shareUrl,
              })
            } else {
              // Fallback to clipboard
              await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)

              // Show success message (you may want to add toast notification here)
              console.log('Share URL copied to clipboard:', shareUrl)
            }
          } catch (error) {
            console.error('Share failed:', error)
            // Fallback - just copy the URL
            try {
              const shareUrl = `${window.location.origin}/calculator?shared=${latestCalculation.id}`
              await navigator.clipboard.writeText(shareUrl)
              console.log('Share URL copied to clipboard as fallback:', shareUrl)
            } catch (clipboardError) {
              console.error('Clipboard access failed:', clipboardError)
            }
          }
        }
      },
      premium: true,
      disabled: !hasCalculations,
      priority: 'medium'
    }
  ]

  const resourceLinks = [
    {
      title: 'Retirement Planning Guide',
      description: 'Learn about MA retirement system',
      icon: BookOpen,
      action: () => router.push('/guide'),
      category: 'education'
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile',
      icon: User,
      action: () => router.push('/account'),
      category: 'settings'
    },
    {
      title: 'System Information',
      description: 'MA retirement system details',
      icon: HelpCircle,
      action: () => router.push('/system-info'),
      category: 'education'
    },
    {
      title: 'Contact Support',
      description: 'Get help with calculations',
      icon: ExternalLink,
      action: () => window.open('mailto:support@example.com'),
      category: 'support'
    }
  ]

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'on-track': return 'text-blue-600 bg-blue-50'
      case 'needs-attention': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getReadinessText = (readiness: string) => {
    switch (readiness) {
      case 'excellent': return 'Excellent'
      case 'on-track': return 'On Track'
      case 'needs-attention': return 'Needs Attention'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Primary Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
        <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-6 lg:px-8 xl:px-10 pt-6 lg:pt-8 xl:pt-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 lg:space-y-3">
              <CardTitle className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-xl lg:text-2xl xl:text-3xl">
                <div className="p-3 lg:p-4 xl:p-5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg">
                  <Zap className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                </div>
                <span className="text-slate-800 dark:text-slate-200">Quick Actions</span>
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg text-muted-foreground">
                Common tasks and tools for retirement planning
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="min-h-[44px] shadow-sm hover:shadow-md transition-all duration-200 px-4 lg:px-6 xl:px-8 py-2 lg:py-3"
            >
              <RefreshCw className={`h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm lg:text-base">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-8 xl:space-y-10 px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 xl:pb-10">
          {/* Primary Actions Grid */}
          <div>
            <h4 className="text-sm lg:text-base xl:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4">
              <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm"></div>
              Essential Tools
            </h4>
            <div className="space-y-3 lg:space-y-4">
              {primaryActions.map((action) => {
                const Icon = action.icon
                const isDisabled = ((action as any).disabled ?? false) || (action.premium && !isPremium)

                return (
                  <TooltipProvider key={action.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className={`h-auto min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] p-4 lg:p-5 xl:p-6 flex items-center gap-4 lg:gap-5 xl:gap-6 justify-start transition-all duration-300 border-0 shadow-md w-full ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                              : `hover:shadow-xl hover:scale-[1.01] ${action.hoverColor} bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 hover:text-white group`
                          }`}
                          onClick={isDisabled ? undefined : action.action}
                          disabled={isDisabled}
                        >
                          {/* Icon Container */}
                          <div className={`p-3 lg:p-3.5 xl:p-4 rounded-xl ${action.color} ${action.textColor} shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}>
                            <Icon className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                          </div>

                          {/* Text Content Container - Horizontal Layout */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="space-y-1 lg:space-y-1.5">
                              <div className="font-semibold text-sm lg:text-base xl:text-lg group-hover:text-white transition-colors leading-tight">
                                {action.title}
                              </div>
                              <div className="text-xs lg:text-sm xl:text-base text-muted-foreground group-hover:text-white/80 transition-colors leading-tight">
                                {action.description}
                              </div>
                            </div>

                            {/* Badges Container */}
                            {(action.badge || action.premium) && (
                              <div className="flex flex-wrap gap-2 lg:gap-3 mt-2 lg:mt-3">
                                {action.badge && (
                                  <Badge variant="secondary" className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5">
                                    {action.badge}
                                  </Badge>
                                )}
                                {action.premium && (
                                  <Badge variant="outline" className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5 border-yellow-400 text-yellow-600">
                                    <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        {isDisabled && action.premium && !isPremium ? (
                          <p>Premium feature - Upgrade to access advanced tools</p>
                        ) : isDisabled && ((action as any).disabled ?? false) ? (
                          <p>Complete a calculation first to unlock this feature</p>
                        ) : (
                          <p>{action.description}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>

          {/* Secondary Actions */}
          <div>
            <h4 className="text-sm lg:text-base xl:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4">
              <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-sm"></div>
              Advanced Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {secondaryActions.map((action) => {
                const Icon = action.icon
                const isDisabled = ((action as any).disabled ?? false) || (action.premium && !isPremium)

                return (
                  <TooltipProvider key={action.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`h-auto min-h-[70px] lg:min-h-[80px] xl:min-h-[90px] p-3 lg:p-4 xl:p-5 flex items-center gap-3 lg:gap-4 xl:gap-5 justify-start transition-all duration-300 border-0 shadow-sm w-full ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                              : 'hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-slate-50/50 dark:hover:from-slate-800 dark:hover:to-slate-700/50 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/30'
                          }`}
                          onClick={isDisabled ? undefined : action.action}
                          disabled={isDisabled}
                        >
                          {/* Icon Container */}
                          <div className={`p-2.5 lg:p-3 xl:p-3.5 rounded-xl ${action.color} ${action.textColor} shadow-md transition-all duration-300 flex-shrink-0`}>
                            <Icon className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                          </div>

                          {/* Text Content - Horizontal Layout */}
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-xs lg:text-sm xl:text-base leading-tight text-slate-800 dark:text-slate-200">
                              {action.title}
                            </div>
                            <div className="text-xs lg:text-sm text-muted-foreground mt-1 leading-tight">
                              {action.description}
                            </div>
                          </div>

                          {/* Premium Badge */}
                          {action.premium && (
                            <div className="flex-shrink-0">
                              <Badge variant="outline" className="text-xs lg:text-sm border-yellow-400 text-yellow-600 px-2 py-1 lg:px-3 lg:py-1.5">
                                <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                                Pro
                              </Badge>
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isDisabled && action.premium && !isPremium ? (
                          <p>Premium feature - Upgrade to access</p>
                        ) : isDisabled && ((action as any).disabled ?? false) ? (
                          <p>Complete a calculation first</p>
                        ) : (
                          <p>{action.description}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pension Growth Projection */}
      {pensionProjection && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-6 lg:px-8 xl:px-10 pt-6 lg:pt-8 xl:pt-10">
            <CardTitle className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-lg lg:text-xl xl:text-2xl">
              <div className="p-3 lg:p-4 xl:p-5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              </div>
              <span className="text-slate-800 dark:text-slate-200">Pension Growth Projection</span>
            </CardTitle>
            <CardDescription className="text-sm lg:text-base xl:text-lg text-muted-foreground">
              From age {pensionProjection.currentAge} up to {pensionProjection.retirementAge} maximum
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 lg:space-y-8 xl:space-y-10 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
            {/* Current Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-600 mb-1 lg:mb-2">
                  {formatCurrency(pensionProjection.currentPension)}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Current Annual</div>
              </div>
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-600 mb-1 lg:mb-2">
                  {formatCurrency(pensionProjection.projectedPension)}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Projected Annual</div>
              </div>
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-600 mb-1 lg:mb-2">
                  {pensionProjection.yearsOfService}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Years of Service</div>
              </div>
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-600 mb-1 lg:mb-2">
                  {Math.round((pensionProjection.projectedPension / pensionProjection.maxBenefit) * 100)}%
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">of Maximum</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 lg:space-y-4 xl:space-y-5">
              <div className="flex justify-between text-sm lg:text-base xl:text-lg">
                <span className="font-medium">Progress to Maximum Benefit</span>
                <span className="text-muted-foreground">
                  {formatCurrency(pensionProjection.maxBenefit)} max
                </span>
              </div>
              <Progress
                value={(pensionProjection.projectedPension / pensionProjection.maxBenefit) * 100}
                className="h-3 lg:h-4 xl:h-5"
                aria-label={`Progress to maximum benefit: ${((pensionProjection.projectedPension / pensionProjection.maxBenefit) * 100).toFixed(1)}%`}
              />
              <div className="flex justify-between text-xs lg:text-sm xl:text-base text-muted-foreground">
                <span>Current: {formatCurrency(pensionProjection.currentPension)}</span>
                <span>Projected: {formatCurrency(pensionProjection.projectedPension)}</span>
              </div>
            </div>

            {/* Growth Indicators */}
            <div className="flex items-center justify-between p-4 lg:p-5 xl:p-6 bg-white rounded-xl border">
              <div className="flex items-center gap-3 lg:gap-4 xl:gap-5">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                  <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm lg:text-base xl:text-lg">Annual Growth</div>
                  <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">
                    Based on 2.5% benefit multiplier
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-green-600 text-sm lg:text-base xl:text-lg">
                  +{formatCurrency((pensionProjection.projectedPension - pensionProjection.currentPension) / (pensionProjection.retirementAge - pensionProjection.currentAge))}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">per year</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculation Statistics */}
      {calculationStats && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
          <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-6 lg:px-8 xl:px-10 pt-6 lg:pt-8 xl:pt-10">
            <CardTitle className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-lg lg:text-xl xl:text-2xl">
              <div className="p-3 lg:p-4 xl:p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              </div>
              <span className="text-slate-800 dark:text-slate-200">Your Progress</span>
            </CardTitle>
            <CardDescription className="text-sm lg:text-base xl:text-lg text-muted-foreground">
              Track your retirement planning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 lg:space-y-8 xl:space-y-10 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-600 mb-1 lg:mb-2">
                  {calculationStats.totalCalculations}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Total Calculations</div>
              </div>
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-600 mb-1 lg:mb-2">
                  {calculationStats.lastCalculationDate ?
                    formatDate(calculationStats.lastCalculationDate).split(',')[0] : 'None'}
                </div>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Last Updated</div>
              </div>
              <div className="text-center p-4 lg:p-5 xl:p-6 bg-white rounded-xl shadow-sm border">
                <Badge className={`text-sm lg:text-base px-3 py-2 lg:px-4 lg:py-3 ${getReadinessColor(calculationStats.retirementReadiness)}`}>
                  {getReadinessText(calculationStats.retirementReadiness)}
                </Badge>
                <div className="text-xs lg:text-sm xl:text-base text-muted-foreground mt-2">Readiness Status</div>
              </div>
            </div>

            {/* Action Items */}
            {calculationStats.retirementReadiness === 'needs-attention' && (
              <div className="p-4 lg:p-5 xl:p-6 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex-shrink-0">
                    <Target className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm lg:text-base text-orange-800 dark:text-orange-200 mb-2">
                      Action Required
                    </h4>
                    <p className="text-xs lg:text-sm text-orange-700 dark:text-orange-300 mb-3">
                      {calculationStats.totalCalculations === 0
                        ? 'Start by running your first pension calculation to see your retirement outlook.'
                        : 'Update your calculations with current information to improve your retirement readiness.'}
                    </p>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => router.push(calculationStats.totalCalculations === 0 ? '/calculator' : '/profile')}
                    >
                      {calculationStats.totalCalculations === 0 ? 'Start Calculation' : 'Update Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources & Settings */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
        <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-6 lg:px-8 xl:px-10 pt-6 lg:pt-8 xl:pt-10">
          <CardTitle className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-lg lg:text-xl xl:text-2xl">
            <div className="p-3 lg:p-4 xl:p-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
              <Target className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            </div>
            <span className="text-slate-800 dark:text-slate-200">Resources & Settings</span>
          </CardTitle>
          <CardDescription className="text-sm lg:text-base xl:text-lg text-muted-foreground">
            Additional tools and information to help with your retirement planning
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 xl:pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {resourceLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto min-h-[70px] lg:min-h-[80px] xl:min-h-[90px] p-3 lg:p-4 xl:p-5 flex items-center gap-3 lg:gap-4 xl:gap-5 justify-start transition-all duration-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-slate-50/50 dark:hover:from-slate-800 dark:hover:to-slate-700/50 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/30 border-0 shadow-sm group w-full"
                  onClick={link.action}
                >
                  {/* Icon Container */}
                  <div className="p-2.5 lg:p-3 xl:p-3.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:from-slate-200 group-hover:to-slate-300 dark:group-hover:from-slate-600 dark:group-hover:to-slate-500 transition-all duration-300 shadow-md flex-shrink-0">
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  </div>

                  {/* Text Content - Horizontal Layout */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-xs lg:text-sm xl:text-base text-slate-800 dark:text-slate-200 leading-tight">
                      {link.title}
                    </div>
                    <div className="text-xs lg:text-sm text-muted-foreground mt-1 leading-tight">
                      {link.description}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                </Button>
              )
            })}
          </div>

          <Separator className="my-6 lg:my-8 xl:my-10" />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
            <div className="text-center p-3 lg:p-4 xl:p-5 bg-gray-50 rounded-lg">
              <div className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                {calculationStats?.totalCalculations || 0}
              </div>
              <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Calculations</div>
            </div>
            <div className="text-center p-3 lg:p-4 xl:p-5 bg-gray-50 rounded-lg">
              <div className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                {hasCalculations ? 'Active' : 'None'}
              </div>
              <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Status</div>
            </div>
            <div className="text-center p-3 lg:p-4 xl:p-5 bg-gray-50 rounded-lg">
              <div className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 lg:mb-2 break-words">
                {calculationStats?.lastCalculationDate ? formatDate(calculationStats.lastCalculationDate) : 'N/A'}
              </div>
              <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Last Update</div>
            </div>
            <div className="text-center p-3 lg:p-4 xl:p-5 bg-gray-50 rounded-lg">
              <div className="mb-1 lg:mb-2">
                <Badge
                  variant="outline"
                  className={`text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-2 ${getReadinessColor(calculationStats?.retirementReadiness || 'unknown')}`}
                >
                  {getReadinessText(calculationStats?.retirementReadiness || 'unknown')}
                </Badge>
              </div>
              <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">Readiness</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Calculations */}
      {hasCalculations && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
          <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-6 lg:px-8 xl:px-10 pt-6 lg:pt-8 xl:pt-10">
            <CardTitle className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-lg lg:text-xl xl:text-2xl">
              <div className="p-3 lg:p-4 xl:p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              </div>
              <span className="text-slate-800 dark:text-slate-200">Saved Calculations</span>
            </CardTitle>
            <CardDescription className="text-sm lg:text-base xl:text-lg text-muted-foreground">
              Your retirement analysis history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6 xl:space-y-8 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
              <div className="p-4 lg:p-5 xl:p-6 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                    <Calculator className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm lg:text-base xl:text-lg">Total Calculations</div>
                    <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-600">
                      {calculationStats?.totalCalculations || 1}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-5 xl:p-6 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm lg:text-base xl:text-lg">Latest Analysis</div>
                    <div className="text-sm lg:text-base xl:text-lg font-medium text-green-600">
                      {latestCalculation?.createdAt ? formatDate(latestCalculation.createdAt) : 'Today'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-5 xl:p-6 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                    <Target className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm lg:text-base xl:text-lg">Retirement Readiness</div>
                    <Badge
                      variant="outline"
                      className={`mt-1 lg:mt-2 text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-2 ${getReadinessColor(calculationStats?.retirementReadiness || 'on-track')}`}
                    >
                      {getReadinessText(calculationStats?.retirementReadiness || 'on-track')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action for Latest Calculation */}
            {latestCalculation && (
              <div className="p-4 lg:p-5 xl:p-6 bg-white rounded-xl border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                    <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0">
                      <FileText className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm lg:text-base xl:text-lg">Latest Calculation</div>
                      <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">
                        Created {formatDate(latestCalculation.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:gap-3 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/calculations/${latestCalculation.id}`)}
                      className="min-h-[44px] px-3 lg:px-4 xl:px-5 text-sm lg:text-base"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
