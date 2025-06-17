/**
 * Node.js polyfill for browser globals
 * This file is loaded before Next.js to ensure browser-specific globals
 * are available in the Node.js environment during build and runtime.
 */

// Define 'self' as 'global' for webpack chunk loading compatibility
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

// Also set on globalThis for broader compatibility
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

// Initialize webpack chunk array if not present
if (typeof global !== 'undefined' && typeof global.webpackChunk_N_E === 'undefined') {
  global.webpackChunk_N_E = [];
}

// Ensure self.webpackChunk_N_E is also available
if (typeof global !== 'undefined' && global.self && typeof global.self.webpackChunk_N_E === 'undefined') {
  global.self.webpackChunk_N_E = [];
}

// Add webpack chunk loading polyfill
if (typeof global !== 'undefined' && global.self) {
  // Ensure the push method exists and works correctly
  if (!global.self.webpackChunk_N_E.push) {
    global.self.webpackChunk_N_E.push = function(chunk) {
      // Simple implementation that just adds to the array
      Array.prototype.push.call(this, chunk);
    };
  }
}

// Add React Loadable Manifest polyfill
if (typeof global !== 'undefined' && global.self && typeof global.self.__REACT_LOADABLE_MANIFEST === 'undefined') {
  global.self.__REACT_LOADABLE_MANIFEST = '{}';
}

// Add additional webpack runtime polyfills
if (typeof global !== 'undefined') {
  // Ensure webpack runtime functions have access to required globals
  if (typeof global.__webpack_require__ === 'undefined') {
    global.__webpack_require__ = function() { return {}; };
  }

  // Polyfill for webpack module system
  if (typeof global.webpackJsonp === 'undefined') {
    global.webpackJsonp = [];
  }

  // Ensure self has all the webpack-related properties
  if (global.self) {
    // Initialize webpack chunk loading arrays
    if (!global.self.webpackChunk_N_E) {
      global.self.webpackChunk_N_E = [];
    }

    // Ensure the array has the expected methods and properties
    if (!global.self.webpackChunk_N_E.push) {
      global.self.webpackChunk_N_E.push = function(chunk) {
        Array.prototype.push.call(this, chunk);
        return this.length;
      };
    }

    // Add webpack runtime module cache
    if (!global.self.__webpack_modules__) {
      global.self.__webpack_modules__ = {};
    }

    // Add webpack runtime cache
    if (!global.self.__webpack_module_cache__) {
      global.self.__webpack_module_cache__ = {};
    }

    // Add webpack runtime require function
    if (!global.self.__webpack_require__) {
      global.self.__webpack_require__ = function(moduleId) {
        return global.self.__webpack_modules__[moduleId] || {};
      };
    }

    // Add webpack runtime ensure function
    if (!global.self.__webpack_require__.e) {
      global.self.__webpack_require__.e = function(chunkId) {
        return Promise.resolve();
      };
    }

    // Add webpack runtime public path
    if (!global.self.__webpack_require__.p) {
      global.self.__webpack_require__.p = '';
    }
  }
}

// Add error handling for webpack runtime issues
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('Cannot read properties of undefined')) {
    console.error('Webpack runtime error detected:', reason.message);
    console.error('Stack trace:', reason.stack);
  }
});

// Log that polyfill is loaded (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('✓ Node.js polyfill loaded for webpack compatibility');
}
