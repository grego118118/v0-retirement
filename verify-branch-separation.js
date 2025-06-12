/**
 * Branch Separation Verification Script
 * Massachusetts Retirement System - Verify branch reorganization was successful
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Massachusetts Retirement System - Branch Separation Verification');
console.log('================================================================');

// Define what should be in each branch
const CORE_FEATURES = [
    'app/page.tsx',
    'app/calculator',
    'app/dashboard',
    'app/blog',
    'app/auth',
    'app/profile',
    'app/about',
    'app/contact',
    'app/faq',
    'components/pension-calculator.tsx',
    'components/pension-results.tsx',
    'components/dashboard',
    'components/auth',
    'components/profile',
    'components/ui',
    'lib/pension-calculations.ts',
    'lib/auth',
    'lib/prisma.ts'
];

const ADVANCED_FEATURES = [
    'app/social-security',
    'app/wizard',
    'app/scenarios',
    'app/tax-calculator',
    'components/combined-retirement-calculator.tsx',
    'components/social-security',
    'components/tax',
    'components/wizard',
    'components/scenario-modeling',
    'lib/social-security',
    'lib/tax',
    'lib/wizard',
    'lib/scenario-modeling'
];

function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error('❌ Error getting current branch:', error.message);
        return null;
    }
}

function switchBranch(branchName) {
    try {
        execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`❌ Error switching to ${branchName}:`, error.message);
        return false;
    }
}

function verifyBranch(branchName, shouldHaveCore, shouldHaveAdvanced) {
    console.log(`\n🔍 Verifying ${branchName} branch...`);
    
    if (!switchBranch(branchName)) {
        return false;
    }

    let corePresent = 0;
    let coreMissing = 0;
    let advancedPresent = 0;
    let advancedMissing = 0;

    // Check core features
    console.log(`\n📋 Core Features in ${branchName}:`);
    CORE_FEATURES.forEach(feature => {
        const exists = checkFileExists(feature);
        if (exists) {
            corePresent++;
            if (shouldHaveCore) {
                console.log(`  ✅ ${feature}`);
            } else {
                console.log(`  ⚠️  ${feature} (unexpected in this branch)`);
            }
        } else {
            coreMissing++;
            if (shouldHaveCore) {
                console.log(`  ❌ ${feature} (missing)`);
            } else {
                console.log(`  ✅ ${feature} (correctly absent)`);
            }
        }
    });

    // Check advanced features
    console.log(`\n🚀 Advanced Features in ${branchName}:`);
    ADVANCED_FEATURES.forEach(feature => {
        const exists = checkFileExists(feature);
        if (exists) {
            advancedPresent++;
            if (shouldHaveAdvanced) {
                console.log(`  ✅ ${feature}`);
            } else {
                console.log(`  ❌ ${feature} (should be removed from this branch)`);
            }
        } else {
            advancedMissing++;
            if (shouldHaveAdvanced) {
                console.log(`  ❌ ${feature} (missing)`);
            } else {
                console.log(`  ✅ ${feature} (correctly absent)`);
            }
        }
    });

    // Summary for this branch
    console.log(`\n📊 ${branchName} Summary:`);
    console.log(`  Core features: ${corePresent}/${CORE_FEATURES.length} present`);
    console.log(`  Advanced features: ${advancedPresent}/${ADVANCED_FEATURES.length} present`);

    const coreSuccess = shouldHaveCore ? (corePresent >= CORE_FEATURES.length * 0.8) : (corePresent >= CORE_FEATURES.length * 0.8);
    const advancedSuccess = shouldHaveAdvanced ? (advancedPresent >= ADVANCED_FEATURES.length * 0.5) : (advancedPresent === 0);

    if (shouldHaveCore && shouldHaveAdvanced) {
        // dev-features should have both
        console.log(`  Status: ${coreSuccess && advancedSuccess ? '✅ PASS' : '❌ FAIL'}`);
    } else if (shouldHaveCore && !shouldHaveAdvanced) {
        // main should have core only
        console.log(`  Status: ${coreSuccess && (advancedPresent === 0) ? '✅ PASS' : '❌ FAIL'}`);
    }

    return { corePresent, coreMissing, advancedPresent, advancedMissing };
}

function main() {
    const originalBranch = getCurrentBranch();
    if (!originalBranch) {
        console.error('❌ Could not determine current branch');
        return;
    }

    console.log(`📍 Current branch: ${originalBranch}`);

    // Verify main branch (should have core features only)
    const mainResults = verifyBranch('main', true, false);
    
    // Verify dev-features branch (should have all features)
    const devResults = verifyBranch('dev-features', true, true);

    // Switch back to original branch
    switchBranch(originalBranch);

    // Final summary
    console.log('\n🎯 Final Verification Summary');
    console.log('=============================');
    
    const mainSuccess = mainResults && (mainResults.advancedPresent === 0);
    const devSuccess = devResults && (devResults.corePresent >= CORE_FEATURES.length * 0.8) && (devResults.advancedPresent >= ADVANCED_FEATURES.length * 0.5);

    console.log(`Main Branch (Production): ${mainSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  - Should contain core features only`);
    console.log(`  - Advanced features: ${mainResults ? mainResults.advancedPresent : 'unknown'} (should be 0)`);
    
    console.log(`Dev-Features Branch (Development): ${devSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  - Should contain all features`);
    console.log(`  - Core features: ${devResults ? devResults.corePresent : 'unknown'}/${CORE_FEATURES.length}`);
    console.log(`  - Advanced features: ${devResults ? devResults.advancedPresent : 'unknown'}/${ADVANCED_FEATURES.length}`);

    if (mainSuccess && devSuccess) {
        console.log('\n🎉 Branch separation successful!');
        console.log('✅ Main branch is ready for production deployment');
        console.log('✅ Dev-features branch contains full application for development');
    } else {
        console.log('\n⚠️  Branch separation needs attention:');
        if (!mainSuccess) {
            console.log('❌ Main branch still contains advanced features that should be removed');
        }
        if (!devSuccess) {
            console.log('❌ Dev-features branch is missing some features');
        }
    }

    console.log('\n🚀 Next Steps:');
    console.log('1. If main branch still has advanced features, run the reorganization script');
    console.log('2. Test both branches independently');
    console.log('3. Update navigation components for simplified main branch');
    console.log('4. Deploy main branch when ready');
}

main();
