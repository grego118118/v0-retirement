export function getCSP(isDevelopment: boolean = false) {
  const self = "'self'"
  const unsafeInline = "'unsafe-inline'"
  const unsafeEval = "'unsafe-eval'"
  const none = "'none'"

  // Generate nonce for inline scripts (more secure than unsafe-inline)
  const nonce = isDevelopment ? '' : generateNonce()
  const nonceDirective = nonce ? `'nonce-${nonce}'` : ''

  const directives: Record<string, string[]> = {
    'default-src': [self],
    'script-src': [
      self,
      // Allow unsafe-inline in development for hot reloading
      isDevelopment ? unsafeInline : nonceDirective,
      // Allow unsafe-eval for Next.js and Radix UI components
      // This is necessary for dynamic component rendering and animations
      unsafeEval,
      // External scripts
      'https://apis.google.com',
      'https://accounts.google.com',
      // Stripe for payments
      'https://js.stripe.com',
      // Allow webpack chunks in development
      isDevelopment && "'unsafe-inline'",
    ].filter(Boolean) as string[],
    'style-src': [
      self,
      unsafeInline, // Required for CSS-in-JS and dynamic styles
      'https://fonts.googleapis.com'
    ],
    'img-src': [self, 'data:', 'https:', 'blob:'],
    'font-src': [self, 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      self,
      'https://api.github.com',
      'https://accounts.google.com',
      'https://www.googleapis.com',
      'https://securetoken.googleapis.com',
      // Stripe API
      'https://api.stripe.com',
      // Development websockets
      isDevelopment && 'ws://localhost:*',
      isDevelopment && 'wss://localhost:*',
      // Allow hot reloading in development
      isDevelopment && 'webpack://*',
    ].filter(Boolean) as string[],
    'frame-src': [
      'https://accounts.google.com',
      'https://js.stripe.com', // Stripe checkout
    ],
    'frame-ancestors': [none],
    'object-src': [none],
    'base-uri': [self],
    'form-action': [self, 'https://checkout.stripe.com'], // Allow Stripe form submissions
    'manifest-src': [self],
    'worker-src': [self, 'blob:'],
    // Allow media for potential future features
    'media-src': [self, 'data:', 'blob:'],
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// Generate a random nonce for inline scripts (production only)
function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}