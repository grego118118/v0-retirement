export function getCSP(isDevelopment: boolean = false) {
  const self = "'self'"
  const unsafeInline = "'unsafe-inline'"
  const unsafeEval = "'unsafe-eval'"
  const none = "'none'"

  const directives: Record<string, string[]> = {
    'default-src': [self],
    'script-src': isDevelopment
      ? [
          self,
          unsafeInline,
          unsafeEval,
          'https://apis.google.com',
          'https://accounts.google.com',
          'https://pagead2.googlesyndication.com',
          'https://googleads.g.doubleclick.net',
          'https://ep1.adtrafficquality.google',
          'https://ep2.adtrafficquality.google',
          'https://fundingchoicesmessages.google.com',
          'https://www.google.com',
          'https://vercel.live',
          'https://va.vercel-scripts.com',
          'https://vitals.vercel-insights.com',
          'https://vitals.vercel-analytics.com'
        ]
      : [
          self,
          unsafeInline,
          'https://apis.google.com',
          'https://accounts.google.com',
          'https://pagead2.googlesyndication.com',
          'https://googleads.g.doubleclick.net',
          'https://ep1.adtrafficquality.google',
          'https://ep2.adtrafficquality.google',
          'https://fundingchoicesmessages.google.com',
          'https://www.google.com',
          'https://vercel.live',
          'https://va.vercel-scripts.com',
          'https://vitals.vercel-insights.com',
          'https://vitals.vercel-analytics.com'
        ],
    'script-src-elem': isDevelopment
      ? [
          self,
          unsafeInline,
          'https://apis.google.com',
          'https://accounts.google.com',
          'https://pagead2.googlesyndication.com',
          'https://googleads.g.doubleclick.net',
          'https://ep1.adtrafficquality.google',
          'https://ep2.adtrafficquality.google',
          'https://fundingchoicesmessages.google.com',
          'https://www.google.com',
          'https://vercel.live',
          'https://va.vercel-scripts.com',
          'https://vitals.vercel-insights.com',
          'https://vitals.vercel-analytics.com'
        ]
      : [
          self,
          unsafeInline,
          'https://apis.google.com',
          'https://accounts.google.com',
          'https://pagead2.googlesyndication.com',
          'https://googleads.g.doubleclick.net',
          'https://ep1.adtrafficquality.google',
          'https://ep2.adtrafficquality.google',
          'https://fundingchoicesmessages.google.com',
          'https://www.google.com',
          'https://vercel.live',
          'https://va.vercel-scripts.com',
          'https://vitals.vercel-insights.com',
          'https://vitals.vercel-analytics.com'
        ],
    'style-src': [self, unsafeInline, 'https://fonts.googleapis.com'],
    'img-src': [self, 'data:', 'https:', 'blob:', 'https://googleads.g.doubleclick.net', 'https://pagead2.googlesyndication.com'],
    'font-src': [self, 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      self,
      'https://api.github.com',
      'https://accounts.google.com',
      'https://www.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://googleads.g.doubleclick.net',
      'https://pagead2.googlesyndication.com',
      'https://ep1.adtrafficquality.google',
      'https://ep2.adtrafficquality.google',
      'https://googleadservices.com',
      'https://www.googleadservices.com',
      'https://fundingchoicesmessages.google.com',
      'https://www.google.com',
      'https://vercel.live',
      'https://va.vercel-scripts.com',
      'https://vitals.vercel-insights.com',
      'https://vitals.vercel-analytics.com',
      isDevelopment && 'ws://localhost:*',
      isDevelopment && 'wss://localhost:*',
    ].filter(Boolean) as string[],
    'frame-src': [
      'https://accounts.google.com',
      'https://googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
      'https://ep1.adtrafficquality.google',
      'https://ep2.adtrafficquality.google',
      'https://www.google.com',
      'https://fundingchoicesmessages.google.com',
      'https://vercel.live'
    ],
    'frame-ancestors': [none],
    'object-src': [none],
    'base-uri': [self],
    'form-action': [self],
    'manifest-src': [self],
    'worker-src': [self, 'blob:'],
  }
  
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
} 