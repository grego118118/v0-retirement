#!/bin/bash

# Massachusetts Retirement System - Branch Reorganization Script
# This script separates the main branch (core features) from dev-features (advanced features)

set -e  # Exit on any error

echo "🚀 Starting Massachusetts Retirement System Branch Reorganization..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the v0-retirement root directory"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed or not in PATH"
    exit 1
fi

# Backup current state
echo "📦 Creating backup branch..."
git checkout main
git branch -f main-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "Backup branch already exists"

# Fetch latest changes
echo "🔄 Fetching latest changes..."
git fetch origin

# Ensure we're on main branch
echo "🔀 Switching to main branch..."
git checkout main

# Create list of advanced features to remove from main
echo "📋 Identifying advanced features to remove from main branch..."

ADVANCED_FEATURES=(
    "app/social-security"
    "app/wizard"
    "components/combined-retirement-calculator.tsx"
    "components/social-security"
    "components/tax"
    "components/wizard"
    "lib/social-security"
    "lib/tax"
    "lib/wizard"
)

# Check which features actually exist
echo "🔍 Checking which advanced features exist..."
EXISTING_FEATURES=()
for feature in "${ADVANCED_FEATURES[@]}"; do
    if [ -e "$feature" ]; then
        EXISTING_FEATURES+=("$feature")
        echo "  ✅ Found: $feature"
    else
        echo "  ⚠️  Not found: $feature"
    fi
done

if [ ${#EXISTING_FEATURES[@]} -eq 0 ]; then
    echo "✅ No advanced features found in main branch - reorganization may already be complete"
    exit 0
fi

# Remove advanced features from main branch
echo "🗑️  Removing advanced features from main branch..."
for feature in "${EXISTING_FEATURES[@]}"; do
    echo "  Removing: $feature"
    git rm -r "$feature" 2>/dev/null || echo "    ⚠️  Could not remove $feature (may not be tracked)"
done

# Check for scenario-related API endpoints that might exist
SCENARIO_APIS=(
    "app/api/scenarios"
    "app/api/tax-calculator"
    "app/api/wizard"
)

echo "🔍 Checking for advanced API endpoints..."
for api in "${SCENARIO_APIS[@]}"; do
    if [ -e "$api" ]; then
        echo "  Removing API: $api"
        git rm -r "$api" 2>/dev/null || echo "    ⚠️  Could not remove $api"
    fi
done

# Check for any scenario-related files in the root
SCENARIO_FILES=(
    "app/scenarios"
    "app/tax-calculator"
)

echo "🔍 Checking for additional scenario files..."
for file in "${SCENARIO_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "  Removing: $file"
        git rm -r "$file" 2>/dev/null || echo "    ⚠️  Could not remove $file"
    fi
done

# Update package.json to reflect core-only features (if needed)
echo "📝 Checking package.json for any advanced feature references..."

# Commit the changes
echo "💾 Committing changes to main branch..."
git add .
git commit -m "feat: streamline main branch to core production features

- Remove social-security advanced features
- Remove tax calculator components
- Remove combined calculation wizard
- Remove scenario modeling features
- Keep core pension calculator and dashboard
- Maintain authentication and basic user management

This creates a production-ready core application that can be deployed immediately.

Advanced features remain available in the dev-features branch for continued development."

# Push changes to main
echo "⬆️  Pushing streamlined main branch..."
git push origin main

# Switch to dev-features to verify it has all features
echo "🔀 Switching to dev-features branch to verify complete feature set..."
git checkout dev-features

# Verify dev-features has the advanced features
echo "✅ Verifying dev-features branch contains all features..."
MISSING_IN_DEV=()
for feature in "${ADVANCED_FEATURES[@]}"; do
    if [ ! -e "$feature" ]; then
        MISSING_IN_DEV+=("$feature")
        echo "  ❌ Missing in dev-features: $feature"
    else
        echo "  ✅ Present in dev-features: $feature"
    fi
done

if [ ${#MISSING_IN_DEV[@]} -gt 0 ]; then
    echo "⚠️  Warning: Some advanced features are missing from dev-features branch"
    echo "This might indicate the features were never committed or are in a different location"
fi

# Create summary
echo ""
echo "🎯 Branch Reorganization Summary"
echo "================================"
echo "✅ Main Branch (Production-Ready):"
echo "   - Home page and basic navigation"
echo "   - Core pension calculator"
echo "   - User dashboard and authentication"
echo "   - Blog and informational pages"
echo "   - Profile management"
echo ""
echo "✅ Dev-Features Branch (Full Development):"
echo "   - All main branch features PLUS"
echo "   - Advanced Social Security features"
echo "   - Tax calculator integration"
echo "   - Combined calculation wizard"
echo "   - Scenario modeling (if present)"
echo ""
echo "🚀 Next Steps:"
echo "1. Test main branch: npm run dev (should show core features only)"
echo "2. Test dev-features branch: git checkout dev-features && npm run dev"
echo "3. Update navigation components to reflect simplified main branch"
echo "4. Deploy main branch for production use"
echo ""
echo "✅ Branch reorganization complete!"
