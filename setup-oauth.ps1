# OAuth Setup Script for Massachusetts Pension Estimator
Write-Host "=== OAuth Setup for Massachusetts Pension Estimator ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (!(Test-Path .env.local)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    New-Item -Path .env.local -ItemType File
}

# Read current values
$envContent = Get-Content .env.local -Raw

Write-Host "This script will help you set up OAuth authentication." -ForegroundColor Green
Write-Host "You'll need to have already created OAuth apps on Google and GitHub." -ForegroundColor Green
Write-Host ""
Write-Host "Follow the guide at: docs/oauth-setup-detailed.md" -ForegroundColor Yellow
Write-Host ""

# Google OAuth Setup
Write-Host "=== Google OAuth Setup ===" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor Yellow
Write-Host "2. Create OAuth 2.0 credentials for a Web application" -ForegroundColor Yellow
Write-Host "3. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google" -ForegroundColor Yellow
Write-Host ""

$googleClientId = Read-Host "Enter your Google Client ID (ends with .apps.googleusercontent.com)"
$googleClientSecret = Read-Host "Enter your Google Client Secret (starts with GOCSPX-)"

# GitHub OAuth Setup
Write-Host ""
Write-Host "=== GitHub OAuth Setup ===" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/settings/developers" -ForegroundColor Yellow
Write-Host "2. Create a new OAuth App" -ForegroundColor Yellow
Write-Host "3. Set callback URL: http://localhost:3000/api/auth/callback/github" -ForegroundColor Yellow
Write-Host ""

$githubId = Read-Host "Enter your GitHub Client ID"
$githubSecret = Read-Host "Enter your GitHub Client Secret"

# Update the .env.local file
$newContent = @"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=SGkGLOVKYJQ9D8VyRxBKhREf/knEnsJNkOHprlLWQ9I=
GOOGLE_CLIENT_ID=$googleClientId
GOOGLE_CLIENT_SECRET=$googleClientSecret
GITHUB_ID=$githubId
GITHUB_SECRET=$githubSecret
"@

Set-Content -Path .env.local -Value $newContent

Write-Host ""
Write-Host "✅ OAuth credentials have been saved to .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor Yellow
Write-Host "2. Visit http://localhost:3000" -ForegroundColor Yellow
Write-Host "3. Click 'Sign In' and test both Google and GitHub authentication" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you encounter issues, check docs/oauth-setup-detailed.md for troubleshooting." -ForegroundColor Yellow 