export function getCSP(isDevelopment: boolean = false) {
  const self = "'self'"
  const unsafeInline = "'unsafe-inline'"
  const unsafeEval = "'unsafe-eval'"
  const none = "'none'"
  
  const directives: Record<string, string[]> = {
    'default-src': [self],
    'script-src': isDevelopment 
      ? [self, unsafeInline, unsafeEval, 'https://apis.google.com', 'https://accounts.google.com']
      : [self, unsafeInline, 'https://apis.google.com', 'https://accounts.google.com'],
    'style-src': [self, unsafeInline, 'https://fonts.googleapis.com'],
    'img-src': [self, 'data:', 'https:', 'blob:'],
    'font-src': [self, 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      self, 
      'https://api.github.com',
      'https://accounts.google.com',
      'https://www.googleapis.com',
      'https://securetoken.googleapis.com',
      isDevelopment && 'ws://localhost:*',
      isDevelopment && 'wss://localhost:*',
    ].filter(Boolean) as string[],
    'frame-src': ['https://accounts.google.com'],
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