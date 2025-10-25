#!/usr/bin/env node

/**
 * Pre-build script to set up global polyfills for server-side compatibility
 * This script runs before the Next.js build to ensure browser-specific globals
 * are available in the Node.js environment
 */

// Set up global polyfills for server-side rendering
if (typeof global !== 'undefined') {
  // Define 'self' as 'global' for packages that expect browser environment
  if (typeof global.self === 'undefined') {
    global.self = global;
  }

  // Also set it on globalThis for broader compatibility
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }

  // Set up the webpack chunk loading mechanism
  if (typeof global.webpackChunk_N_E === 'undefined') {
    global.webpackChunk_N_E = [];
  }
  
  // Define minimal 'window' object for packages that check for window
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
  
  // Define minimal 'document' object
  if (typeof global.document === 'undefined') {
    global.document = global.window.document;
  }
}

console.log('✓ Global polyfills set up for server-side rendering');

// Export for use in other scripts
module.exports = {
  setupPolyfills: () => {
    console.log('✓ Polyfills already set up');
  }
};
