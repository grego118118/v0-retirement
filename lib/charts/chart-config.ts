/**
 * Chart Configuration Module
 * Provides standardized chart theming, responsive dimensions, and performance monitoring
 * for the Massachusetts Retirement System application
 */

// Chart color scheme following Massachusetts Retirement System design patterns
export const CHART_COLORS = {
  // Primary benefit colors
  pension: '#3b82f6',        // Blue - Pension benefits
  socialSecurity: '#10b981', // Green - Social Security
  healthcare: '#8b5cf6',     // Purple - Healthcare benefits
  other: '#f59e0b',          // Amber - Other income
  
  // Status and comparison colors
  current: '#6366f1',        // Indigo - Current values
  projected: '#06b6d4',      // Cyan - Projected values
  target: '#84cc16',         // Lime - Target values
  warning: '#ef4444',        // Red - Warning/negative values
  success: '#22c55e',        // Green - Success/positive values
  
  // UI colors
  background: '#f8fafc',     // Light background
  backgroundDark: '#0f172a', // Dark background
  text: '#1e293b',           // Text color
  textDark: '#f1f5f9',       // Dark mode text
  border: '#e2e8f0',         // Border color
  borderDark: '#334155',     // Dark mode border
  
  // Chart-specific colors
  grid: '#e2e8f0',           // Grid lines
  gridDark: '#475569',       // Dark mode grid lines
  axis: '#64748b',           // Axis labels
  axisDark: '#94a3b8'        // Dark mode axis labels
} as const

// Responsive breakpoints for chart dimensions
export const CHART_BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1920
} as const

// Chart dimensions based on breakpoints
export const CHART_DIMENSIONS = {
  mobile: {
    width: 350,
    height: 250,
    margin: { top: 10, right: 10, left: 10, bottom: 10 }
  },
  tablet: {
    width: 700,
    height: 350,
    margin: { top: 15, right: 15, left: 15, bottom: 15 }
  },
  desktop: {
    width: 900,
    height: 400,
    margin: { top: 20, right: 20, left: 20, bottom: 20 }
  },
  wide: {
    width: 1200,
    height: 500,
    margin: { top: 25, right: 25, left: 25, bottom: 25 }
  }
} as const

// Animation configurations
export const CHART_ANIMATIONS = {
  duration: 750,
  easing: 'ease-in-out',
  delay: 0,
  stagger: 100
} as const

// Tooltip configuration
export const TOOLTIP_CONFIG = {
  cursor: { strokeDasharray: '3 3' },
  contentStyle: {
    backgroundColor: 'var(--background)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
    padding: '12px'
  },
  labelStyle: {
    color: 'var(--foreground)',
    fontWeight: '600',
    marginBottom: '4px'
  },
  itemStyle: {
    color: 'var(--muted-foreground)',
    fontSize: '11px'
  }
} as const

// Legend configuration
export const LEGEND_CONFIG = {
  verticalAlign: 'bottom' as const,
  height: 36,
  iconType: 'circle' as const,
  wrapperStyle: {
    fontSize: '12px',
    color: 'var(--muted-foreground)',
    paddingTop: '16px'
  }
} as const

// Grid configuration
export const GRID_CONFIG = {
  strokeDasharray: '3 3',
  stroke: 'var(--border)',
  opacity: 0.5
} as const

// Axis configuration
export const AXIS_CONFIG = {
  tick: {
    fontSize: 11,
    fill: 'var(--muted-foreground)'
  },
  axisLine: {
    stroke: 'var(--border)',
    strokeWidth: 1
  },
  tickLine: false
} as const

// Chart type specific configurations
export const CHART_TYPE_CONFIG = {
  line: {
    strokeWidth: 2,
    dot: { r: 4, strokeWidth: 2 },
    activeDot: { r: 6, strokeWidth: 2 }
  },
  area: {
    strokeWidth: 2,
    fillOpacity: 0.1,
    dot: false,
    activeDot: { r: 6, strokeWidth: 2 }
  },
  bar: {
    radius: [2, 2, 0, 0],
    maxBarSize: 60
  },
  pie: {
    paddingAngle: 2,
    innerRadius: 0,
    outerRadius: 80
  }
} as const

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  render: 100,      // Maximum render time in ms
  update: 50,       // Maximum update time in ms
  interaction: 16,  // Maximum interaction response time in ms
  memory: 50        // Maximum memory usage in MB
} as const

// Accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  role: 'img',
  tabIndex: 0,
  ariaLabel: 'Interactive chart',
  keyboardNavigation: true,
  highContrast: false,
  reducedMotion: false
} as const

// Chart theme interface
export interface ChartTheme {
  colors: typeof CHART_COLORS
  dimensions: typeof CHART_DIMENSIONS[keyof typeof CHART_DIMENSIONS]
  animations: typeof CHART_ANIMATIONS
  isDark: boolean
  accessibility: typeof ACCESSIBILITY_CONFIG
}

// Responsive dimensions interface
export interface ResponsiveDimensions {
  width: number
  height: number
  margin: { top: number; right: number; left: number; bottom: number }
  breakpoint: keyof typeof CHART_BREAKPOINTS
}

// Performance metrics interface
export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  type: 'render' | 'update' | 'interaction'
  metadata?: Record<string, any>
}

/**
 * Gets chart theme configuration based on dark mode preference
 * @param isDark - Whether dark mode is enabled
 * @returns Chart theme configuration object
 */
export function getChartTheme(isDark: boolean = false): ChartTheme {
  const colors = isDark ? {
    ...CHART_COLORS,
    background: CHART_COLORS.backgroundDark,
    text: CHART_COLORS.textDark,
    border: CHART_COLORS.borderDark,
    grid: CHART_COLORS.gridDark,
    axis: CHART_COLORS.axisDark
  } : CHART_COLORS

  return {
    colors: colors as typeof CHART_COLORS,
    dimensions: CHART_DIMENSIONS.desktop, // Default to desktop
    animations: CHART_ANIMATIONS,
    isDark,
    accessibility: {
      ...ACCESSIBILITY_CONFIG,
      // Enable high contrast in dark mode
      highContrast: isDark,
      // Check for reduced motion preference
      reducedMotion: typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } as typeof ACCESSIBILITY_CONFIG
  }
}

/**
 * Calculates responsive chart dimensions based on viewport width
 * @param viewportWidth - Current viewport width in pixels
 * @returns Responsive dimensions configuration
 */
export function getResponsiveDimensions(viewportWidth: number): ResponsiveDimensions {
  let breakpoint: keyof typeof CHART_BREAKPOINTS
  let dimensions: typeof CHART_DIMENSIONS[keyof typeof CHART_DIMENSIONS]

  if (viewportWidth >= CHART_BREAKPOINTS.wide) {
    breakpoint = 'wide'
    dimensions = CHART_DIMENSIONS.wide
  } else if (viewportWidth >= CHART_BREAKPOINTS.desktop) {
    breakpoint = 'desktop'
    dimensions = CHART_DIMENSIONS.desktop
  } else if (viewportWidth >= CHART_BREAKPOINTS.tablet) {
    breakpoint = 'tablet'
    dimensions = CHART_DIMENSIONS.tablet
  } else {
    breakpoint = 'mobile'
    dimensions = CHART_DIMENSIONS.mobile
  }

  return {
    ...dimensions,
    breakpoint
  }
}

/**
 * Performance monitoring utility for chart operations
 * @param type - Type of operation being measured
 * @param metadata - Additional metadata for the operation
 * @returns Performance monitor object with end() method
 */
export function measureChartPerformance(
  type: 'render' | 'update' | 'interaction',
  metadata?: Record<string, any>
): { end: () => number; getMetrics: () => PerformanceMetrics } {
  const startTime = performance.now()
  
  const metrics: PerformanceMetrics = {
    startTime,
    type,
    metadata
  }

  return {
    end: (): number => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      metrics.endTime = endTime
      metrics.duration = duration

      // Log performance warnings if thresholds are exceeded
      const threshold = PERFORMANCE_THRESHOLDS[type]
      if (duration > threshold) {
        console.warn(
          `Chart ${type} performance warning: ${duration.toFixed(2)}ms exceeds threshold of ${threshold}ms`,
          { metrics, metadata }
        )
      }

      return duration
    },
    getMetrics: (): PerformanceMetrics => ({ ...metrics })
  }
}

/**
 * Formats currency values for chart display
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export function formatChartCurrency(value: number): string {
  if (value === 0) return '$0'
  
  // Format large numbers with K/M suffixes for better chart readability
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
}

/**
 * Formats percentage values for chart display
 * @param value - Numeric value to format (0.25 = 25%)
 * @returns Formatted percentage string
 */
export function formatChartPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value)
}
