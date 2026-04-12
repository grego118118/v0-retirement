param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Move-Safe($src, $dst) {
  if (-not (Test-Path $src)) { return }
  $dstDir = Split-Path -Parent $dst
  if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
  if ($DryRun) {
    Write-Host "DRYRUN: Move '$src' -> '$dst'"
  } else {
    Move-Item -LiteralPath $src -Destination $dst -Force
  }
}

# Ensure archive for any existing root content
New-Item -ItemType Directory -Path ".\archive_flatten_backup" -Force | Out-Null

# Primary directories
Move-Safe ".\v0-retirement\app" ".\app"
Move-Safe ".\v0-retirement\components" ".\components"
Move-Safe ".\v0-retirement\lib" ".\lib"
Move-Safe ".\v0-retirement\public" ".\public"
Move-Safe ".\v0-retirement\prisma" ".\prisma"
Move-Safe ".\v0-retirement\styles" ".\styles"
Move-Safe ".\v0-retirement\scripts" ".\scripts_app"

# Config and root files
Move-Safe ".\v0-retirement\package.json" ".\package.json"
Move-Safe ".\v0-retirement\package-lock.json" ".\package-lock.json"
Move-Safe ".\v0-retirement\next.config.js" ".\next.config.js"
Move-Safe ".\v0-retirement\postcss.config.mjs" ".\postcss.config.mjs"
Move-Safe ".\v0-retirement\tailwind.config.ts" ".\tailwind.config.ts"
Move-Safe ".\v0-retirement\tsconfig.json" ".\tsconfig.json"
Move-Safe ".\v0-retirement\tsconfig.build.json" ".\tsconfig.build.json"
Move-Safe ".\v0-retirement\tsconfig.production.json" ".\tsconfig.production.json"
Move-Safe ".\v0-retirement\next-env.d.ts" ".\next-env.d.ts"
Move-Safe ".\v0-retirement\vercel.json" ".\vercel.json"

# Misc runtime files (optional)
Move-Safe ".\v0-retirement\Dockerfile" ".\Dockerfile"
Move-Safe ".\v0-retirement\docker-compose.yml" ".\docker-compose.yml"
Move-Safe ".\v0-retirement\docker-compose.prod.yml" ".\docker-compose.prod.yml"

# After moves, stash any conflicting original root content we might have overwritten into backup (only if DryRun is off)
if (-not $DryRun) {
  foreach ($item in @('app','components','lib','public','prisma','styles')) {
    $legacyPath = ".\archive_root\${item}_legacy"
    if (Test-Path $legacyPath) {
      Move-Item $legacyPath ".\archive_flatten_backup\${item}_legacy" -Force
    }
  }
}

if ($DryRun) { Write-Host 'DRYRUN COMPLETE' } else { Write-Host 'FLATTEN COMPLETE' }

