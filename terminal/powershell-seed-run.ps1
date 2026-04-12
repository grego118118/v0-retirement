$secret = Read-Host "Enter SEED_SECRET"
Invoke-RestMethod -Uri "https://www.masspension.com/api/admin/blog/seed" -Method POST `
  -Headers @{ "Content-Type"="application/json"; "x-seed-secret"=$secret } `
  -Body (@{ secret = $secret } | ConvertTo-Json)