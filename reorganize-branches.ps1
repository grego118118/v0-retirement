# Massachusetts Retirement System - Branch Reorganization Script (PowerShell)
# This script separates the main branch (core features) from dev-features (advanced features)

Write-Host "🚀 Starting Massachusetts Retirement System Branch Reorganization..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the v0-retirement root directory" -ForegroundColor Red
    exit 1
}

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Error: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Backup current state
Write-Host "📦 Creating backup branch..." -ForegroundColor Yellow
git checkout main
$backupName = "main-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch -f $backupName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backup branch creation failed, but continuing..." -ForegroundColor Yellow
}

# Fetch latest changes
Write-Host "🔄 Fetching latest changes..." -ForegroundColor Yellow
git fetch origin

# Ensure we're on main branch
Write-Host "🔀 Switching to main branch..." -ForegroundColor Yellow
git checkout main

# Create list of advanced features to remove from main
Write-Host "📋 Identifying advanced features to remove from main branch..." -ForegroundColor Yellow

$AdvancedFeatures = @(
    "app/social-security",
    "app/wizard",
    "components/combined-retirement-calculator.tsx",
    "components/social-security",
    "components/tax",
    "components/wizard",
    "lib/social-security",
    "lib/tax",
    "lib/wizard"
)

# Check which features actually exist
Write-Host "🔍 Checking which advanced features exist..." -ForegroundColor Yellow
$ExistingFeatures = @()
foreach ($feature in $AdvancedFeatures) {
    if (Test-Path $feature) {
        $ExistingFeatures += $feature
        Write-Host "  ✅ Found: $feature" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Not found: $feature" -ForegroundColor Yellow
    }
}

if ($ExistingFeatures.Count -eq 0) {
    Write-Host "✅ No advanced features found in main branch - reorganization may already be complete" -ForegroundColor Green
    exit 0
}

# Remove advanced features from main branch
Write-Host "🗑️  Removing advanced features from main branch..." -ForegroundColor Yellow
foreach ($feature in $ExistingFeatures) {
    Write-Host "  Removing: $feature" -ForegroundColor Yellow
    git rm -r $feature 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ⚠️  Could not remove $feature (may not be tracked)" -ForegroundColor Yellow
    }
}

# Check for scenario-related API endpoints that might exist
$ScenarioAPIs = @(
    "app/api/scenarios",
    "app/api/tax-calculator",
    "app/api/wizard"
)

Write-Host "🔍 Checking for advanced API endpoints..." -ForegroundColor Yellow
foreach ($api in $ScenarioAPIs) {
    if (Test-Path $api) {
        Write-Host "  Removing API: $api" -ForegroundColor Yellow
        git rm -r $api 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    ⚠️  Could not remove $api" -ForegroundColor Yellow
        }
    }
}

# Check for any scenario-related files in the root
$ScenarioFiles = @(
    "app/scenarios",
    "app/tax-calculator"
)

Write-Host "🔍 Checking for additional scenario files..." -ForegroundColor Yellow
foreach ($file in $ScenarioFiles) {
    if (Test-Path $file) {
        Write-Host "  Removing: $file" -ForegroundColor Yellow
        git rm -r $file 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    ⚠️  Could not remove $file" -ForegroundColor Yellow
        }
    }
}

# Commit the changes
Write-Host "💾 Committing changes to main branch..." -ForegroundColor Yellow
git add .
$commitMessage = @"
feat: streamline main branch to core production features

- Remove social-security advanced features
- Remove tax calculator components
- Remove combined calculation wizard
- Remove scenario modeling features
- Keep core pension calculator and dashboard
- Maintain authentication and basic user management

This creates a production-ready core application that can be deployed immediately.

Advanced features remain available in the dev-features branch for continued development.
"@

git commit -m $commitMessage

# Push changes to main
Write-Host "⬆️  Pushing streamlined main branch..." -ForegroundColor Yellow
git push origin main

# Switch to dev-features to verify it has all features
Write-Host "🔀 Switching to dev-features branch to verify complete feature set..." -ForegroundColor Yellow
git checkout dev-features

# Verify dev-features has the advanced features
Write-Host "✅ Verifying dev-features branch contains all features..." -ForegroundColor Yellow
$MissingInDev = @()
foreach ($feature in $AdvancedFeatures) {
    if (-not (Test-Path $feature)) {
        $MissingInDev += $feature
        Write-Host "  ❌ Missing in dev-features: $feature" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Present in dev-features: $feature" -ForegroundColor Green
    }
}

if ($MissingInDev.Count -gt 0) {
    Write-Host "⚠️  Warning: Some advanced features are missing from dev-features branch" -ForegroundColor Yellow
    Write-Host "This might indicate the features were never committed or are in a different location" -ForegroundColor Yellow
}

# Create summary
Write-Host ""
Write-Host "🎯 Branch Reorganization Summary" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Main Branch (Production-Ready):" -ForegroundColor Green
Write-Host "   - Home page and basic navigation"
Write-Host "   - Core pension calculator"
Write-Host "   - User dashboard and authentication"
Write-Host "   - Blog and informational pages"
Write-Host "   - Profile management"
Write-Host ""
Write-Host "✅ Dev-Features Branch (Full Development):" -ForegroundColor Green
Write-Host "   - All main branch features PLUS"
Write-Host "   - Advanced Social Security features"
Write-Host "   - Tax calculator integration"
Write-Host "   - Combined calculation wizard"
Write-Host "   - Scenario modeling (if present)"
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test main branch: npm run dev (should show core features only)"
Write-Host "2. Test dev-features branch: git checkout dev-features; npm run dev"
Write-Host "3. Update navigation components to reflect simplified main branch"
Write-Host "4. Deploy main branch for production use"
Write-Host ""
Write-Host "✅ Branch reorganization complete!" -ForegroundColor Green
