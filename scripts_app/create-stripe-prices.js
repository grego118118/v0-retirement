/**
 * Emergency Stripe Price Creation Script
 * Creates the correct price IDs for Massachusetts Retirement System
 * Run this to resolve the critical checkout regression
 */

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !process.env[key]) {
    process.env[key] = value.replace(/"/g, '');
  }
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createSubscriptionPrices() {
  try {
    console.log('🚨 EMERGENCY: Creating Stripe subscription prices...');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    // First, check if we already have a product
    console.log('🔍 Checking for existing products...');
    const products = await stripe.products.list({ limit: 10 });
    
    let product = products.data.find(p => 
      p.name.toLowerCase().includes('massachusetts') || 
      p.name.toLowerCase().includes('retirement') ||
      p.name.toLowerCase().includes('premium')
    );

    if (!product) {
      console.log('📦 Creating new product...');
      product = await stripe.products.create({
        name: 'Massachusetts Retirement System Premium',
        description: 'Premium subscription for Massachusetts Retirement System calculator with advanced features',
        metadata: {
          app: 'massachusetts_retirement_system',
          version: '1.0',
          created_by: 'emergency_script'
        }
      });
      console.log('✅ Created product:', product.id);
    } else {
      console.log('✅ Using existing product:', product.id, '-', product.name);
    }

    // Check for existing prices
    console.log('🔍 Checking for existing prices...');
    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 10
    });

    const monthlyPrice = existingPrices.data.find(p => 
      p.recurring?.interval === 'month' && p.active
    );
    
    const yearlyPrice = existingPrices.data.find(p => 
      p.recurring?.interval === 'year' && p.active
    );

    let monthlyPriceId, yearlyPriceId;

    // Create monthly price if it doesn't exist
    if (!monthlyPrice) {
      console.log('💳 Creating monthly price ($9.99/month)...');
      const newMonthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 999, // $9.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan: 'monthly',
          app: 'massachusetts_retirement_system'
        }
      });
      monthlyPriceId = newMonthlyPrice.id;
      console.log('✅ Created monthly price:', monthlyPriceId);
    } else {
      monthlyPriceId = monthlyPrice.id;
      console.log('✅ Using existing monthly price:', monthlyPriceId);
    }

    // Create yearly price if it doesn't exist
    if (!yearlyPrice) {
      console.log('💳 Creating yearly price ($99.99/year)...');
      const newYearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 9999, // $99.99
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          plan: 'annual',
          app: 'massachusetts_retirement_system'
        }
      });
      yearlyPriceId = newYearlyPrice.id;
      console.log('✅ Created yearly price:', yearlyPriceId);
    } else {
      yearlyPriceId = yearlyPrice.id;
      console.log('✅ Using existing yearly price:', yearlyPriceId);
    }

    console.log('\n🎯 PRICE IDS TO UPDATE IN CONFIG:');
    console.log('=====================================');
    console.log('Monthly Price ID:', monthlyPriceId);
    console.log('Yearly Price ID:', yearlyPriceId);
    console.log('=====================================');

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Update lib/stripe/config.ts with these price IDs');
    console.log('2. Update Vercel environment variables:');
    console.log('   - STRIPE_MONTHLY_PRICE_ID =', monthlyPriceId);
    console.log('   - STRIPE_ANNUAL_PRICE_ID =', yearlyPriceId);
    console.log('3. Deploy the updated configuration');
    console.log('4. Test Stripe checkout functionality');

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name
      },
      prices: {
        monthly: monthlyPriceId,
        yearly: yearlyPriceId
      }
    };

  } catch (error) {
    console.error('❌ Error creating Stripe prices:', error.message);
    console.error('Error details:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  createSubscriptionPrices()
    .then(result => {
      console.log('\n✅ SUCCESS: Stripe prices created/verified');
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ FAILED: Could not create Stripe prices');
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { createSubscriptionPrices };
