#!/bin/bash
# Script per aggiornare il codice sul VPS

echo "🔄 Aggiornamento codice sul VPS..."

# Pulisci e ricompila
rm -rf dist/server
npm run build:server

# Invia i file compilati al VPS
scp -r dist/server ubuntu@vps-cceb6ed6.vps.ovh.ca:/opt/vergen-browser/dist/

# Riavvia PM2 sul VPS
ssh ubuntu@vps-cceb6ed6.vps.ovh.ca << 'REMOTE'
cd /opt/vergen-browser
pm2 delete vergen-api
pm2 start ecosystem.config.cjs
pm2 save
REMOTE

echo "✅ Aggiornamento completato!"
