// Server-side polyfills for browser-specific globals
// This file provides compatibility shims for packages that expect browser globals

if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // Define 'self' as 'global' for server-side compatibility
  global.self = global;
}

if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // Minimal window object for server-side compatibility
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

if (typeof global !== 'undefined' && typeof document === 'undefined') {
  // Minimal document object for server-side compatibility
  global.document = global.window?.document || {
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

// Export for explicit imports
module.exports = {
  setupServerPolyfills: () => {
    // This function can be called to ensure polyfills are loaded
    console.log('Server polyfills loaded');
  }
};
