/**
 * Global polyfills for server-side compatibility
 * This file must be loaded before any other modules to ensure
 * browser-specific globals are available in Node.js environment
 */

// Immediately execute polyfills
(function() {
  // Ensure we're in a Node.js environment
  if (typeof global !== 'undefined') {
  // Define 'self' as 'global' for webpack and other packages
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  
  // Also set it on globalThis for broader compatibility
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  
  // Set up webpack chunk loading mechanism
  if (typeof global.webpackChunk_N_E === 'undefined') {
    global.webpackChunk_N_E = [];
  }
  
  // Minimal window object for packages that check for window
  if (typeof global.window === 'undefined') {
    global.window = {
      matchMedia: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      location: {
        href: '',
        protocol: 'https:',
        hostname: 'localhost',
        pathname: '/',
        search: '',
      },
      navigator: {
        userAgent: 'Node.js',
      },
      document: {
        createElement: () => ({}),
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    };
  }
  
  // Minimal document object
  if (typeof global.document === 'undefined') {
    global.document = global.window.document;
  }

  // Log that polyfills are loaded
  console.log('✓ Global polyfills loaded for server-side compatibility');
  }
})();

// Also set up polyfills on module load
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}
