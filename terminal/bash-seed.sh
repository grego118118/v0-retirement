SECRET="$SEED_SECRET"
curl -X POST https://www.masspension.com/api/admin/blog/seed \
  -H "Content-Type: application/json" -H "x-seed-secret: $SECRET" \
  -d "{\"secret\":\"$SECRET\"}"