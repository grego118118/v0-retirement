$secret="YOUR_SECRET"
$body=@{ secret=$secret } | ConvertTo-Json
Invoke-WebRequest -Uri "https://www.masspension.com/api/admin/blog/seed" -Method POST `
  -Headers @{ "Content-Type"="application/json"; "x-seed-secret"=$secret } -Body $body