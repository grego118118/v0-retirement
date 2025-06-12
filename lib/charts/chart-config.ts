/**
 * Chart Configuration and Theme System
 * Massachusetts Retirement System - Interactive Charts
 * 
 * Provides centralized configuration for all chart components including:
 * - Color schemes and themes
 * - Responsive breakpoints
 * - Animation settings
 * - Performance optimizations
 */

// Color palette following Massachusetts Retirement System design
export const CHART_COLORS = {
  // Primary income sources
  pension: '#3b82f6',        // Blue - MA State Pension
  socialSecurity: '#10b981', // Green - Social Security
  healthcare: '#8b5cf6',     // Purple - Healthcare/Medicare
  other: '#f59e0b',         // Amber - Other income
  
  // Status and comparison colors
  current: '#6366f1',        // Indigo - Current values
  projected: '#06b6d4',      // Cyan - Projected values
  target: '#84cc16',         // Lime - Target values
  warning: '#f97316',        // Orange - Warning states
  danger: '#ef4444',         // Red - Danger/critical states
  
  // Neutral colors
  background: '#f8fafc',     // Light background
  backgroundDark: '#0f172a', // Dark background
  border: '#e2e8f0',        // Light border
  borderDark: '#334155',    // Dark border
  text: '#1e293b',          // Light text
  textDark: '#f1f5f9',      // Dark text
  muted: '#64748b',         // Muted text
  
  // Gradient colors for enhanced visuals
  gradients: {
    pension: ['#3b82f6', '#1d4ed8'],
    socialSecurity: ['#10b981', '#047857'],
    healthcare: ['#8b5cf6', '#7c3aed'],
    income: ['#06b6d4', '#0891b2']
  }
} as const

// Responsive breakpoints for chart sizing
export const CHART_BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1920
} as const

// Chart dimensions for different screen sizes
export const CHART_DIMENSIONS = {
  mobile: {
    height: 200,
    margin: { top: 10, right: 10, left: 10, bottom: 10 }
  },
  tablet: {
    height: 250,
    margin: { top: 15, right: 15, left: 15, bottom: 15 }
  },
  desktop: {
    height: 300,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  },
  largeDesktop: {
    height: 400,
    margin: { top: 25, right: 40, left: 25, bottom: 25 }
  }
} as const

// Animation configuration for smooth transitions
export const CHART_ANIMATIONS = {
  duration: 750,
  easing: 'ease-in-out',
  stagger: 100,
  
  // Performance-optimized settings
  performance: {
    enableAnimations: true,
    maxDataPoints: 100, // Limit for performance
    debounceMs: 150,    // Debounce for real-time updates
    lazyLoadThreshold: 50 // Data points before lazy loading
  }
} as const

// Tooltip configuration
export const TOOLTIP_CONFIG = {
  contentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    padding: '12px'
  },
  contentStyleDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    padding: '12px',
    color: '#f1f5f9'
  },
  cursor: { fill: 'rgba(59, 130, 246, 0.1)' },
  animationDuration: 200
} as const

// Legend configuration
export const LEGEND_CONFIG = {
  verticalAlign: 'bottom' as const,
  height: 36,
  iconType: 'circle' as const,
  wrapperStyle: {
    fontSize: '14px',
    paddingTop: '16px'
  }
} as const

// Grid configuration
export const GRID_CONFIG = {
  strokeDasharray: '3 3',
  stroke: '#e2e8f0',
  strokeDark: '#334155',
  opacity: 0.5
} as const

// Axis configuration
export const AXIS_CONFIG = {
  tick: {
    fontSize: 12,
    fill: '#64748b'
  },
  tickDark: {
    fontSize: 12,
    fill: '#94a3b8'
  },
  axisLine: {
    stroke: '#e2e8f0',
    strokeWidth: 1
  },
  axisLineDark: {
    stroke: '#334155',
    strokeWidth: 1
  }
} as const

// Chart type specific configurations
export const CHART_TYPE_CONFIG = {
  line: {
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6, stroke: '#ffffff', strokeWidth: 2 }
  },
  area: {
    strokeWidth: 2,
    fillOpacity: 0.6,
    dot: { r: 3 },
    activeDot: { r: 5 }
  },
  bar: {
    radius: [4, 4, 0, 0],
    maxBarSize: 60
  },
  pie: {
    innerRadius: 60,
    outerRadius: 100,
    paddingAngle: 2,
    cornerRadius: 4
  }
} as const

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  renderTime: 2000,      // 2 seconds max render time
  updateTime: 500,       // 500ms max update time
  animationTime: 750,    // 750ms max animation time
  memoryLimit: 50 * 1024 * 1024 // 50MB memory limit
} as const

// Accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  ariaLabel: 'Interactive chart visualization',
  role: 'img',
  tabIndex: 0,
  keyboardNavigation: true,
  screenReaderSupport: true,
  highContrastMode: false
} as const

// Export utility functions for theme detection and responsive sizing
export const getChartTheme = (isDark: boolean) => ({
  background: isDark ? CHART_COLORS.backgroundDark : CHART_COLORS.background,
  text: isDark ? CHART_COLORS.textDark : CHART_COLORS.text,
  border: isDark ? CHART_COLORS.borderDark : CHART_COLORS.border,
  grid: isDark ? GRID_CONFIG.strokeDark : GRID_CONFIG.stroke,
  tooltip: isDark ? TOOLTIP_CONFIG.contentStyleDark : TOOLTIP_CONFIG.contentStyle,
  axis: isDark ? AXIS_CONFIG.tickDark : AXIS_CONFIG.tick,
  axisLine: isDark ? AXIS_CONFIG.axisLineDark : AXIS_CONFIG.axisLine
})

export const getResponsiveDimensions = (width: number) => {
  if (width >= CHART_BREAKPOINTS.largeDesktop) return CHART_DIMENSIONS.largeDesktop
  if (width >= CHART_BREAKPOINTS.desktop) return CHART_DIMENSIONS.desktop
  if (width >= CHART_BREAKPOINTS.tablet) return CHART_DIMENSIONS.tablet
  return CHART_DIMENSIONS.mobile
}

// Format currency for chart display
export const formatChartCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value.toLocaleString()}`
}

// Format percentage for chart display
export const formatChartPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

// Performance monitoring utilities
export const measureChartPerformance = (operation: string) => {
  const start = performance.now()
  return {
    end: () => {
      const duration = performance.now() - start
      if (duration > PERFORMANCE_THRESHOLDS.renderTime) {
        console.warn(`⚠️ Chart ${operation} took ${duration.toFixed(2)}ms (>${PERFORMANCE_THRESHOLDS.renderTime}ms)`)
      }
      return duration
    }
  }
}
