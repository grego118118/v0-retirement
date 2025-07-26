/**
 * Centralized AdSense Manager - Singleton Pattern
 * 
 * Prevents duplicate Auto Ads initialization and manages ad lifecycle
 * Resolves critical AdSense errors on Massachusetts Retirement System website
 */

declare global {
  interface Window {
    adsbygoogle: any[]
    adSenseManager?: AdSenseManager
    __ADSENSE_INITIALIZED__?: boolean
    __ADSENSE_AUTO_ADS_ENABLED__?: boolean
  }
}

interface AdSenseConfig {
  publisherId: string
  enableAutoAds: boolean
  enableManualAds: boolean
  isPremium: boolean
  isDevelopment: boolean
}

interface AdElement {
  id: string
  element: HTMLElement
  slot: string
  status: 'pending' | 'loaded' | 'failed' | 'unfilled'
  retryCount: number
}

export class AdSenseManager {
  private static instance: AdSenseManager | null = null
  private isInitialized = false
  private autoAdsEnabled = false
  private scriptLoaded = false
  private config: AdSenseConfig
  private adElements = new Map<string, AdElement>()
  private initializationPromise: Promise<void> | null = null
  private autoAdsAttempts = 0
  private maxAutoAdsAttempts = 1

  private constructor() {
    this.config = {
      publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950",
      enableAutoAds: true,
      enableManualAds: true,
      isPremium: false,
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AdSenseManager {
    if (typeof window === 'undefined') {
      throw new Error('AdSenseManager can only be used in browser environment')
    }

    if (!AdSenseManager.instance) {
      AdSenseManager.instance = new AdSenseManager()
      window.adSenseManager = AdSenseManager.instance
    }

    return AdSenseManager.instance
  }

  /**
   * Initialize AdSense with configuration
   */
  public async initialize(config?: Partial<AdSenseConfig>): Promise<void> {
    // Check global initialization flag first
    if (typeof window !== 'undefined' && window.__ADSENSE_INITIALIZED__) {
      console.log('AdSenseManager: AdSense already initialized globally, skipping')
      return
    }

    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('AdSenseManager: Already initialized, skipping')
      return
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      console.log('AdSenseManager: Initialization in progress, waiting...')
      return this.initializationPromise
    }

    // Update configuration
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // Don't initialize in development or for premium users
    if (this.config.isDevelopment) {
      console.log('AdSenseManager: Skipping initialization in development')
      return
    }

    if (this.config.isPremium) {
      console.log('AdSenseManager: Skipping initialization for premium user')
      return
    }

    // Start initialization
    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }

  /**
   * Perform the actual initialization
   */
  private async _performInitialization(): Promise<void> {
    try {
      console.log('AdSenseManager: Starting initialization...')

      // Set global initialization flag
      if (typeof window !== 'undefined') {
        window.__ADSENSE_INITIALIZED__ = true
      }

      // Load AdSense script if not already loaded
      await this._loadAdSenseScript()

      // Initialize Auto Ads if enabled and not already done
      if (this.config.enableAutoAds && !this.autoAdsEnabled) {
        await this._initializeAutoAds()
      }

      this.isInitialized = true
      console.log('AdSenseManager: Initialization completed successfully')
    } catch (error) {
      console.error('AdSenseManager: Initialization failed:', error)
      // Reset global flag on error
      if (typeof window !== 'undefined') {
        window.__ADSENSE_INITIALIZED__ = false
      }
      throw error
    }
  }

  /**
   * Load AdSense script
   */
  private async _loadAdSenseScript(): Promise<void> {
    if (this.scriptLoaded) {
      console.log('AdSenseManager: Script already loaded')
      return
    }

    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]')
      if (existingScript) {
        console.log('AdSenseManager: Script already exists in DOM')
        this.scriptLoaded = true
        window.adsbygoogle = window.adsbygoogle || []
        resolve()
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`
      script.crossOrigin = 'anonymous'
      script.id = 'adsense-script'

      script.onload = () => {
        console.log('AdSenseManager: Script loaded successfully')
        this.scriptLoaded = true
        window.adsbygoogle = window.adsbygoogle || []
        resolve()
      }

      script.onerror = (error) => {
        console.error('AdSenseManager: Failed to load script:', error)
        reject(new Error('Failed to load AdSense script'))
      }

      document.head.appendChild(script)
      console.log('AdSenseManager: Script added to DOM')
    })
  }

  /**
   * Initialize Auto Ads (only once per page)
   */
  private async _initializeAutoAds(): Promise<void> {
    if (this.autoAdsEnabled) {
      console.log('AdSenseManager: Auto Ads already enabled, skipping')
      return
    }

    // Check for existing Auto Ads attempts
    if (this.autoAdsAttempts >= this.maxAutoAdsAttempts) {
      console.warn('AdSenseManager: Maximum Auto Ads attempts reached, preventing duplicate initialization')
      return
    }

    // Check global Auto Ads flag
    if (typeof window !== 'undefined' && window.__ADSENSE_AUTO_ADS_ENABLED__) {
      console.warn('AdSenseManager: Auto Ads already enabled globally, skipping')
      this.autoAdsEnabled = true
      return
    }

    // Check if Auto Ads already exist in adsbygoogle array
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      const existingAutoAds = window.adsbygoogle.filter(item =>
        item && typeof item === 'object' && item.enable_page_level_ads
      )
      if (existingAutoAds.length > 0) {
        console.warn('AdSenseManager: Auto Ads already exist in adsbygoogle array, skipping')
        this.autoAdsEnabled = true
        if (typeof window !== 'undefined') {
          window.__ADSENSE_AUTO_ADS_ENABLED__ = true
        }
        return
      }
    }

    try {
      // Ensure adsbygoogle array exists
      window.adsbygoogle = window.adsbygoogle || []

      // Enable Auto Ads - this should only happen once per page
      window.adsbygoogle.push({
        google_ad_client: this.config.publisherId,
        enable_page_level_ads: true,
        overlays: { bottom: true }
      })

      this.autoAdsAttempts++
      this.autoAdsEnabled = true

      // Set global Auto Ads flag
      if (typeof window !== 'undefined') {
        window.__ADSENSE_AUTO_ADS_ENABLED__ = true
      }

      console.log('AdSenseManager: Auto Ads enabled successfully (attempt', this.autoAdsAttempts, ')')
    } catch (error) {
      console.error('AdSenseManager: Failed to enable Auto Ads:', error)
      throw error
    }
  }

  /**
   * Register a manual ad element
   */
  public registerAdElement(elementId: string, element: HTMLElement, slot: string): void {
    // Check if element is already registered
    if (this.adElements.has(elementId)) {
      console.warn(`AdSenseManager: Ad element ${elementId} already registered`)
      return
    }

    // Check if element already has ads (prevent "already have ads" error)
    const existingAd = element.querySelector('ins.adsbygoogle[data-ad-status]')
    if (existingAd) {
      console.warn(`AdSenseManager: Element ${elementId} already has ads, cleaning up first`)
      this._cleanupExistingAds(element)
    }

    // Check for existing adsbygoogle elements that might conflict
    const existingInsElements = element.querySelectorAll('ins.adsbygoogle')
    if (existingInsElements.length > 0) {
      console.warn(`AdSenseManager: Found ${existingInsElements.length} existing ad elements, cleaning up`)
      existingInsElements.forEach(ins => ins.remove())
    }

    // Register the element
    this.adElements.set(elementId, {
      id: elementId,
      element,
      slot,
      status: 'pending',
      retryCount: 0
    })

    console.log(`AdSenseManager: Registered ad element ${elementId} with slot ${slot}`)
  }

  /**
   * Clean up existing ads in an element
   */
  private _cleanupExistingAds(element: HTMLElement): void {
    try {
      // Remove all existing adsbygoogle elements
      const existingAds = element.querySelectorAll('ins.adsbygoogle')
      existingAds.forEach(ad => {
        console.log('AdSenseManager: Removing existing ad element')
        ad.remove()
      })

      // Clear any data attributes that might interfere
      element.removeAttribute('data-ad-status')
      element.removeAttribute('data-ad-slot')
      element.removeAttribute('data-ad-client')
    } catch (error) {
      console.error('AdSenseManager: Error cleaning up existing ads:', error)
    }
  }

  /**
   * Initialize a manual ad element
   */
  public async initializeAdElement(elementId: string): Promise<void> {
    const adElement = this.adElements.get(elementId)
    if (!adElement) {
      console.error(`AdSenseManager: Ad element ${elementId} not registered`)
      return
    }

    // Skip if already loaded or failed (unless retrying)
    if (adElement.status === 'loaded') {
      console.log(`AdSenseManager: Ad element ${elementId} already loaded`)
      return
    }

    if (adElement.status === 'failed' && adElement.retryCount >= 3) {
      console.log(`AdSenseManager: Ad element ${elementId} failed too many times, skipping`)
      return
    }

    // Check for placeholder slot IDs
    const isPlaceholder = /^[0-9]{10}$/.test(adElement.slot) &&
      ['1234567890', '2345678901', '3456789012', '4567890123'].includes(adElement.slot)

    if (isPlaceholder) {
      console.warn(`AdSenseManager: Element ${elementId} using placeholder slot ${adElement.slot}`)
      adElement.status = 'failed'
      this._handleUnfilledAd(adElement)
      return
    }

    try {
      // Ensure AdSense is initialized
      await this.initialize()

      // Clean up any existing ads first
      this._cleanupExistingAds(adElement.element)

      // Create the ad element structure
      const insElement = this._createAdElement(adElement.slot)
      adElement.element.appendChild(insElement)

      // Push to adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})

      adElement.status = 'loaded'
      console.log(`AdSenseManager: Initialized ad element ${elementId}`)

      // Check for unfilled ads after a delay
      setTimeout(() => this._checkAdStatus(adElement), 3000)
    } catch (error) {
      console.error(`AdSenseManager: Failed to initialize ad element ${elementId}:`, error)
      adElement.status = 'failed'
      adElement.retryCount++
      this._handleUnfilledAd(adElement)
    }
  }

  /**
   * Create an ad element with proper structure
   */
  private _createAdElement(slot: string): HTMLElement {
    const ins = document.createElement('ins')
    ins.className = 'adsbygoogle'
    ins.style.display = 'block'
    ins.setAttribute('data-ad-client', this.config.publisherId)
    ins.setAttribute('data-ad-slot', slot)
    ins.setAttribute('data-ad-format', 'auto')
    ins.setAttribute('data-full-width-responsive', 'true')
    return ins
  }

  /**
   * Check ad status and handle unfilled ads
   */
  private _checkAdStatus(adElement: AdElement): void {
    try {
      const insElement = adElement.element.querySelector('ins.adsbygoogle')
      if (insElement) {
        const adStatus = insElement.getAttribute('data-ad-status')
        if (adStatus === 'unfilled') {
          console.warn(`AdSenseManager: Ad element ${adElement.id} is unfilled`)
          adElement.status = 'unfilled'
          this._handleUnfilledAd(adElement)
        }
      }
    } catch (error) {
      console.error('AdSenseManager: Error checking ad status:', error)
    }
  }

  /**
   * Handle unfilled ads with fallback behavior
   */
  private _handleUnfilledAd(adElement: AdElement): void {
    try {
      // Show a subtle placeholder for unfilled ads
      const placeholder = document.createElement('div')
      placeholder.className = 'ad-placeholder'
      placeholder.style.cssText = `
        min-height: 100px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border: 1px dashed #cbd5e0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #718096;
        font-size: 12px;
        text-align: center;
        padding: 20px;
      `
      placeholder.innerHTML = `
        <div>
          <div style="margin-bottom: 8px;">📢</div>
          <div>Advertisement space</div>
          <div style="font-size: 10px; margin-top: 4px;">Support our free tools</div>
        </div>
      `

      // Replace the ad element with placeholder
      adElement.element.innerHTML = ''
      adElement.element.appendChild(placeholder)

      console.log(`AdSenseManager: Added fallback placeholder for ${adElement.id}`)
    } catch (error) {
      console.error('AdSenseManager: Error handling unfilled ad:', error)
    }
  }

  /**
   * Cleanup ad element
   */
  public cleanupAdElement(elementId: string): void {
    const adElement = this.adElements.get(elementId)
    if (adElement) {
      console.log(`AdSenseManager: Cleaning up ad element ${elementId}`)
      this.adElements.delete(elementId)
    }
  }

  /**
   * Get manager status
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      autoAdsEnabled: this.autoAdsEnabled,
      scriptLoaded: this.scriptLoaded,
      config: this.config,
      adElementsCount: this.adElements.size,
      adElements: Array.from(this.adElements.values()).map(ad => ({
        id: ad.id,
        slot: ad.slot,
        status: ad.status,
        retryCount: ad.retryCount
      }))
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AdSenseConfig>): void {
    this.config = { ...this.config, ...config }
    console.log('AdSenseManager: Configuration updated:', this.config)
  }

  /**
   * Get detailed debug information
   */
  public getDebugInfo() {
    const adElementsDebug = Array.from(this.adElements.values()).map(ad => {
      const element = ad.element
      const insElements = element.querySelectorAll('ins.adsbygoogle')
      return {
        id: ad.id,
        slot: ad.slot,
        status: ad.status,
        retryCount: ad.retryCount,
        hasInsElements: insElements.length,
        insElementsStatus: Array.from(insElements).map(ins => ({
          adStatus: ins.getAttribute('data-ad-status'),
          adSlot: ins.getAttribute('data-ad-slot'),
          adClient: ins.getAttribute('data-ad-client')
        }))
      }
    })

    return {
      ...this.getStatus(),
      scriptExists: !!document.querySelector('script[src*="adsbygoogle.js"]'),
      adsbygoogleLength: typeof window !== 'undefined' && window.adsbygoogle ? window.adsbygoogle.length : 0,
      adElementsDebug,
      duplicateAutoAdsAttempts: this._countAutoAdsAttempts()
    }
  }

  /**
   * Count potential duplicate Auto Ads attempts
   */
  private _countAutoAdsAttempts(): number {
    if (typeof window === 'undefined' || !window.adsbygoogle) return 0

    return window.adsbygoogle.filter(item =>
      item && typeof item === 'object' && item.enable_page_level_ads
    ).length
  }

  /**
   * Reset manager (for testing)
   */
  public reset(): void {
    console.log('AdSenseManager: Resetting manager state')
    this.isInitialized = false
    this.autoAdsEnabled = false
    this.scriptLoaded = false
    this.adElements.clear()
    this.initializationPromise = null
  }
}

// Export singleton instance getter
export const getAdSenseManager = () => AdSenseManager.getInstance()
