// Offline route regression tests: all authentication, database and billing calls are mocked.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')
let passed = 0
function load(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(source, {
    module, exports: module.exports, process, Date, Set,
    console: { log() {}, error() {} },
    require(name) {
      if (!(name in mocks)) throw new Error(`Unmocked dependency: ${name}`)
      return mocks[name]
    }
  }, { filename: file })
  return module.exports
}
async function check(name, fn) { await fn(); passed++; console.log(`PASS ${name}`) }
async function main() {
  delete process.env.STRIPE_SECRET_KEY
  delete process.env.VERCEL
  delete process.env.ENABLE_DEMO_SUBSCRIPTIONS
  const demo = load('lib/demo-subscriptions.ts', {})
  const calls = []
  let session = { user: { email: 'customer@example.test', id: 'u_1' } }
  let user = { id: 'u_1', subscriptionStatus: 'active', subscriptionId: 'sub_test', stripeCustomerId: 'cus_test' }
  let failStripe = false, failDb = false, customerId = 'cus_test'
  const end = new Date('2026-11-08T00:00:00Z')
  const db = {
    findUnique: async () => user,
    update: async args => { calls.push(['update', args]); if (failDb) throw new Error('mock DB failure') },
    upsert: async () => calls.push(['upsert']),
    create: async () => { throw new Error('mock DB failure') }
  }
  const service = {
    getSubscription: async () => ({ customerId }),
    cancelSubscription: async id => {
      calls.push(['cancel', id]); if (failStripe) throw new Error('mock Stripe failure')
      return { currentPeriodEnd: end, cancelAtPeriodEnd: true }
    }
  }
  const mocks = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    'next-auth/next': { getServerSession: async () => { calls.push(['auth']); return session } },
    'next-auth': { getServerSession: async () => session },
    '@/lib/auth/auth-config': { authOptions: {} },
    '@/lib/prisma': { prisma: { user: db, retirementCalculation: { count: async () => 0 } } },
    '@/lib/stripe/service': { StripeService: service },
    '@/lib/stripe/config': { isSubscriptionActive: s => ['active', 'trialing'].includes(s), FREE_TIER_LIMITS: {} },
    '@/lib/demo-subscriptions': demo,
    '@/lib/subscription-utils': { isPremiumUser: () => false, addPremiumUser: () => calls.push(['grant']), removePremiumUser: () => calls.push(['remove']) }
  }
  const complete = load('app/api/subscription/complete-demo/route.ts', mocks)
  for (const env of ['production', 'test', 'development']) {
    await check(`demo disabled by default in ${env}`, async () => {
      process.env.NODE_ENV = env; calls.length = 0
      const response = await complete.POST({ json: async () => ({ planType: 'annual' }) })
      assert.equal(response.status, 404); assert.equal(calls.length, 0)
    })
  }
  process.env.ENABLE_DEMO_SUBSCRIPTIONS = 'true'
  await check('hosted development cannot enable demo', async () => {
    process.env.VERCEL = '1'; assert.equal(demo.demoSubscriptionsEnabled(), false); delete process.env.VERCEL
  })
  await check('Stripe configured prevents local demo grant', async () => {
    process.env.STRIPE_SECRET_KEY = 'mock-only'; assert.equal(demo.demoSubscriptionsEnabled(), false); delete process.env.STRIPE_SECRET_KEY
  })
  await check('explicit local demo remains available', async () => assert.equal(demo.demoSubscriptionsEnabled(), true))
  process.env.NODE_ENV = 'production'
  const utils = load('lib/subscription-utils.ts', mocks)
  await check('production ignores hardcoded and in-memory premium', async () => {
    utils.addPremiumUser('premium@example.com'); assert.equal(utils.isPremiumUser('premium@example.com'), false)
    user = { id: 'u_1', subscriptionStatus: 'inactive' }
    assert.equal((await utils.getUserSubscriptionInfo('premium@example.com')).isPremium, false)
  })
  const status = load('app/api/subscription/status/route.ts', mocks)
  await check('status fallback ignores demo allowlist in production', async () => {
    session.user.email = 'premium@example.com'; assert.equal((await status.GET({})).body.isPremium, false)
  })
  await check('persisted trial retains premium on status fallback', async () => {
    user.subscriptionStatus = 'trialing'; assert.equal((await status.GET({})).body.isPremium, true)
    assert.equal((await utils.getUserSubscriptionInfo(session.user.email)).isPremium, true)
  })
  const cancel = load('app/api/subscription/cancel/route.ts', mocks)
  await check('cancel requires authentication', async () => {
    const old = session; session = null; calls.length = 0
    assert.equal((await cancel.POST({})).status, 401); assert.equal(calls.some(c => c[0] === 'update'), false); session = old
  })
  user = { id: 'u_1', subscriptionStatus: 'active', subscriptionId: 'sub_test', stripeCustomerId: 'cus_test' }
  await check('missing Stripe configuration cannot falsely cancel billing', async () => {
    calls.length = 0; assert.equal((await cancel.POST({})).status, 503)
    assert.equal(calls.some(c => ['update', 'remove', 'cancel'].includes(c[0])), false)
  })
  process.env.STRIPE_SECRET_KEY = 'mock-only'
  for (const state of ['active', 'trialing', 'past_due']) {
    await check(`${state} cancellation schedules period end without revoking access`, async () => {
      user.subscriptionStatus = state; calls.length = 0
      const response = await cancel.POST({}); assert.equal(response.status, 200)
      assert.equal(response.body.accessEndsAt, end.toISOString())
      assert.equal(calls.find(c => c[0] === 'update')[1].data.cancelAtPeriodEnd, true)
      assert.equal(calls.find(c => c[0] === 'update')[1].data.subscriptionStatus, undefined)
      assert.equal(calls.some(c => c[0] === 'remove'), false)
    })
  }
  await check('customer mismatch makes no billing mutation', async () => {
    customerId = 'cus_other'; calls.length = 0; assert.equal((await cancel.POST({})).status, 409)
    assert.equal(calls.some(c => c[0] === 'cancel'), false); customerId = 'cus_test'
  })
  await check('Stripe failure makes no database cancellation', async () => {
    failStripe = true; calls.length = 0; assert.equal((await cancel.POST({})).status, 500)
    assert.equal(calls.some(c => c[0] === 'update'), false); failStripe = false
  })
  await check('database failure is not reported as success', async () => {
    failDb = true; assert.equal((await cancel.POST({})).status, 500); failDb = false
  })
  await check('production missing billing record cannot use demo fallback', async () => {
    user.subscriptionStatus = 'active'; user.subscriptionId = null
    calls.length = 0; assert.equal((await cancel.POST({})).status, 409)
    assert.equal(calls.some(c => ['update', 'remove'].includes(c[0])), false)
  })
  await check('inactive subscription cannot cancel', async () => {
    user.subscriptionStatus = 'inactive'; assert.equal((await cancel.POST({})).status, 400)
  })
  const raw = { id: 'sub_test', customer: 'cus_test', status: 'active', cancel_at_period_end: true,
    items: { data: [{ price: { id: 'price_test' }, current_period_start: 1791417600, current_period_end: end.getTime()/1000 }] }, metadata: {} }
  const stripeService = load('lib/stripe/service.ts', {
    './config': { stripe: { subscriptions: { update: async () => raw, retrieve: async () => raw } },
      getSubscriptionPlan: () => 'monthly', StripeError: Error }
  }).StripeService
  await check('Stripe Basil item period dates survive cancellation', async () => {
    assert.equal((await stripeService.cancelSubscription('sub_test')).currentPeriodEnd.toISOString(), end.toISOString())
    assert.equal((await stripeService.getSubscription('sub_test')).currentPeriodEnd.toISOString(), end.toISOString())
  })
  console.log(`${passed} offline security and subscription checks passed`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
