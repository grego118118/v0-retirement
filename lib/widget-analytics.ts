/**
 * Widget Analytics Tracking
 * Tracks widget embed usage, calculations, and partner metrics
 */

interface WidgetEvent {
  event_type: 'widget_load' | 'widget_calculate' | 'widget_cta_click' | 'widget_error'
  partner_id?: string
  retirement_group?: string
  theme?: string
  referrer?: string
  user_agent?: string
  timestamp: string
  metadata?: Record<string, any>
}

interface CalculationEvent extends WidgetEvent {
  event_type: 'widget_calculate'
  retirement_age?: number
  years_of_service?: number
  estimated_pension?: number
  eligible?: boolean
}

class WidgetAnalytics {
  private queue: WidgetEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly FLUSH_INTERVAL_MS = 5000
  private readonly MAX_QUEUE_SIZE = 10

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushInterval()
      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS)
  }

  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      // Send to analytics API
      await fetch('/api/widget/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      // Re-queue failed events (up to limit)
      this.queue = [...events.slice(0, this.MAX_QUEUE_SIZE / 2), ...this.queue].slice(0, this.MAX_QUEUE_SIZE)
      console.warn('Widget analytics flush failed:', error)
    }
  }

  private track(event: WidgetEvent) {
    this.queue.push(event)

    // Flush immediately if queue is full
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush()
    }

    // Also send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event_type, {
        event_category: 'widget',
        event_label: event.partner_id || 'direct',
        ...event.metadata,
      })
    }
  }

  trackLoad(config: { partnerId?: string; theme?: string; group?: string }) {
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined

    this.track({
      event_type: 'widget_load',
      partner_id: config.partnerId,
      theme: config.theme,
      retirement_group: config.group,
      referrer,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    })
  }

  trackCalculation(data: {
    partnerId?: string
    retirementGroup: string
    retirementAge: number
    yearsOfService: number
    estimatedPension: number
    eligible: boolean
  }) {
    const event: CalculationEvent = {
      event_type: 'widget_calculate',
      partner_id: data.partnerId,
      retirement_group: data.retirementGroup,
      retirement_age: data.retirementAge,
      years_of_service: data.yearsOfService,
      estimated_pension: data.estimatedPension,
      eligible: data.eligible,
      timestamp: new Date().toISOString(),
      metadata: {
        retirement_group: data.retirementGroup,
        retirement_age: data.retirementAge,
      },
    }

    this.track(event)
  }

  trackCtaClick(config: { partnerId?: string; ctaUrl?: string }) {
    this.track({
      event_type: 'widget_cta_click',
      partner_id: config.partnerId,
      timestamp: new Date().toISOString(),
      metadata: { cta_url: config.ctaUrl },
    })
  }

  trackError(error: string, config: { partnerId?: string }) {
    this.track({
      event_type: 'widget_error',
      partner_id: config.partnerId,
      timestamp: new Date().toISOString(),
      metadata: { error },
    })
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Singleton instance
let analyticsInstance: WidgetAnalytics | null = null

export function getWidgetAnalytics(): WidgetAnalytics {
  if (!analyticsInstance && typeof window !== 'undefined') {
    analyticsInstance = new WidgetAnalytics()
  }
  return analyticsInstance!
}

export { WidgetAnalytics }
export type { WidgetEvent, CalculationEvent }

