New-Item -ItemType Directory -Path ".\archive_root" -Force | Out-Null
Move-Item ".\app" ".\archive_root\app_legacy" -Force
Move-Item ".\components" ".\archive_root\components_legacy" -Force
Move-Item ".\lib" ".\archive_root\lib_legacy" -Force
Move-Item ".\public" ".\archive_root\public_legacy" -Force
Rename-Item ".\vercel.json" "vercel.root.ignore.json" -ErrorAction SilentlyContinue
Rename-Item ".\tsconfig.json" "tsconfig.workspace.json" -ErrorAction SilentlyContinue