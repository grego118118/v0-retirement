# Massachusetts Retirement System - Simple Branch Reorganization Script
# This script separates the main branch (core features) from dev-features (advanced features)

Write-Host "Starting Massachusetts Retirement System Branch Reorganization..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the v0-retirement root directory" -ForegroundColor Red
    exit 1
}

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Backup current state
Write-Host "Creating backup branch..." -ForegroundColor Yellow
git checkout main
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "main-backup-$timestamp"
git branch $backupName 2>$null

# Fetch latest changes
Write-Host "Fetching latest changes..." -ForegroundColor Yellow
git fetch origin

# Ensure we're on main branch
Write-Host "Switching to main branch..." -ForegroundColor Yellow
git checkout main

# Define advanced features to remove from main
$AdvancedFeatures = @(
    "app\social-security",
    "app\wizard", 
    "app\scenarios",
    "app\tax-calculator",
    "components\combined-retirement-calculator.tsx",
    "components\social-security",
    "components\tax",
    "components\wizard",
    "components\scenario-modeling",
    "lib\social-security",
    "lib\tax",
    "lib\wizard",
    "lib\scenario-modeling"
)

# Check which features exist and remove them
Write-Host "Checking and removing advanced features from main branch..." -ForegroundColor Yellow
$removedFeatures = @()

foreach ($feature in $AdvancedFeatures) {
    if (Test-Path $feature) {
        Write-Host "  Removing: $feature" -ForegroundColor Yellow
        try {
            git rm -r $feature 2>$null
            if ($LASTEXITCODE -eq 0) {
                $removedFeatures += $feature
                Write-Host "    Successfully removed: $feature" -ForegroundColor Green
            } else {
                Write-Host "    Could not remove: $feature (may not be tracked)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    Error removing: $feature" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Not found: $feature" -ForegroundColor Gray
    }
}

# Check for additional API endpoints
$ApiEndpoints = @(
    "app\api\scenarios",
    "app\api\tax-calculator", 
    "app\api\wizard"
)

Write-Host "Checking for advanced API endpoints..." -ForegroundColor Yellow
foreach ($api in $ApiEndpoints) {
    if (Test-Path $api) {
        Write-Host "  Removing API: $api" -ForegroundColor Yellow
        try {
            git rm -r $api 2>$null
            if ($LASTEXITCODE -eq 0) {
                $removedFeatures += $api
                Write-Host "    Successfully removed: $api" -ForegroundColor Green
            }
        } catch {
            Write-Host "    Error removing: $api" -ForegroundColor Yellow
        }
    }
}

# Show what was removed
if ($removedFeatures.Count -gt 0) {
    Write-Host ""
    Write-Host "Successfully removed the following advanced features:" -ForegroundColor Green
    foreach ($feature in $removedFeatures) {
        Write-Host "  - $feature" -ForegroundColor Green
    }
} else {
    Write-Host "No advanced features found to remove - main branch may already be streamlined" -ForegroundColor Yellow
    Write-Host "Checking dev-features branch for verification..." -ForegroundColor Yellow
    git checkout dev-features
    
    $devHasFeatures = $false
    foreach ($feature in $AdvancedFeatures) {
        if (Test-Path $feature) {
            $devHasFeatures = $true
            break
        }
    }
    
    if ($devHasFeatures) {
        Write-Host "Dev-features branch contains advanced features - reorganization may already be complete" -ForegroundColor Green
    } else {
        Write-Host "Warning: Advanced features not found in either branch" -ForegroundColor Yellow
    }
    
    git checkout main
    exit 0
}

# Commit the changes
Write-Host ""
Write-Host "Committing changes to main branch..." -ForegroundColor Yellow
git add .

$commitMessage = "feat: streamline main branch to core production features

- Remove social-security advanced features
- Remove tax calculator components  
- Remove combined calculation wizard
- Remove scenario modeling features
- Keep core pension calculator and dashboard
- Maintain authentication and basic user management

This creates a production-ready core application that can be deployed immediately.

Advanced features remain available in the dev-features branch for continued development."

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully committed changes" -ForegroundColor Green
} else {
    Write-Host "Error committing changes" -ForegroundColor Red
    exit 1
}

# Push changes to main
Write-Host "Pushing streamlined main branch..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to origin/main" -ForegroundColor Green
} else {
    Write-Host "Error pushing to origin/main" -ForegroundColor Red
    exit 1
}

# Verify dev-features branch
Write-Host ""
Write-Host "Verifying dev-features branch contains all features..." -ForegroundColor Yellow
git checkout dev-features

$missingFeatures = @()
foreach ($feature in $AdvancedFeatures) {
    if (-not (Test-Path $feature)) {
        $missingFeatures += $feature
    }
}

if ($missingFeatures.Count -eq 0) {
    Write-Host "All advanced features present in dev-features branch" -ForegroundColor Green
} else {
    Write-Host "Warning: Some features missing from dev-features branch:" -ForegroundColor Yellow
    foreach ($feature in $missingFeatures) {
        Write-Host "  - $feature" -ForegroundColor Yellow
    }
}

# Final summary
Write-Host ""
Write-Host "Branch Reorganization Summary" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "Main Branch (Production-Ready):" -ForegroundColor Green
Write-Host "  - Home page and basic navigation"
Write-Host "  - Core pension calculator"
Write-Host "  - User dashboard and authentication"
Write-Host "  - Blog and informational pages"
Write-Host "  - Profile management"
Write-Host ""
Write-Host "Dev-Features Branch (Full Development):" -ForegroundColor Green
Write-Host "  - All main branch features PLUS"
Write-Host "  - Advanced Social Security features"
Write-Host "  - Tax calculator integration"
Write-Host "  - Combined calculation wizard"
Write-Host "  - Scenario modeling features"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test main branch: npm run dev (should show core features only)"
Write-Host "2. Test dev-features branch: git checkout dev-features; npm run dev"
Write-Host "3. Update navigation components to reflect simplified main branch"
Write-Host "4. Deploy main branch for production use"
Write-Host ""
Write-Host "Branch reorganization complete!" -ForegroundColor Green
