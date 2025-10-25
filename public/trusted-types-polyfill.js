// Trusted Types Polyfill for browsers that don't support it
if (typeof window !== 'undefined' && !window.trustedTypes) {
  window.trustedTypes = {
    createPolicy: function(name, rules) {
      return {
        createHTML: rules.createHTML || function(s) { return s; },
        createScript: rules.createScript || function(s) { return s; },
        createScriptURL: rules.createScriptURL || function(s) { return s; }
      };
    },
    getAttributeType: function() { return null; },
    getPropertyType: function() { return null; },
    getTypeMapping: function() { return {}; },
    isHTML: function() { return false; },
    isScript: function() { return false; },
    isScriptURL: function() { return false; }
  };
} 