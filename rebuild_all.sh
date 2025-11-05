#!/bin/bash

echo "🧹 Pulizia completa..."
rm -rf dist/

echo "🔨 Build frontend..."
npm run build

echo "🔨 Build server..."
npm run build:server

echo "🔄 Riavvio PM2..."
pm2 delete vergen-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "⏳ Attendo 3 secondi per l'avvio..."
sleep 3

echo ""
echo "✅ Rebuild completato!"
echo ""
echo "🧪 Test del proxy..."
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEzZGMwMGQyLTRlM2ItNDRkZi05ZjhjLWQ0NGE5MmRjNTk0OSIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NjIzNTk4ODMsImV4cCI6MTc2Mjk2NDY4M30.UxCQCxylld_-eo3ZmRIq_k5j29DVLxFGg6k64Ha00Pk" \
  -d '{"url":"https://example.com"}'

echo ""
echo ""
echo "📊 Logs PM2:"
pm2 logs vergen-api --lines 10 --nostream
