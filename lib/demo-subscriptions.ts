// Demo entitlements must never be enabled in a hosted or production runtime.
export function demoSubscriptionsEnabled(): boolean {
  return process.env.NODE_ENV === 'development' &&
    !process.env.VERCEL &&
    process.env.ENABLE_DEMO_SUBSCRIPTIONS === 'true' &&
    !process.env.STRIPE_SECRET_KEY
}
