// Jest stub for @vercel/analytics (the real package is ESM-only).
module.exports = {
  track: () => {},
  Analytics: () => null,
}
