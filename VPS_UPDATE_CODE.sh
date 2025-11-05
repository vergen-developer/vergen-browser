#!/bin/bash

# Script per aggiornare il codice sulla VPS dopo fix TypeScript
# Esegui questo sulla VPS: sudo bash VPS_UPDATE_CODE.sh

set -e

echo "🔄 Aggiornamento codice VerGen Browser sulla VPS..."

# Stop PM2
echo "⏸️  Stopping PM2..."
pm2 stop vergen-api || true
pm2 delete vergen-api || true

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
cd /opt/vergen-browser
git pull origin main

# Install dependencies (in case of changes)
echo "📦 Installing dependencies..."
npm install

# Build server
echo "🔨 Building server..."
npm run build:server

# Create package.json for CommonJS in dist/server
echo '{"type":"commonjs"}' > dist/server/package.json

# Fix .env - aggiungi variabili senza VITE_ prefix
echo "🔧 Fixing .env..."
if ! grep -q "^SUPABASE_URL=" .env; then
  echo "" >> .env
  echo "# Server Environment Variables (without VITE_ prefix)" >> .env
  SUPABASE_URL=$(grep "^VITE_SUPABASE_URL=" .env | cut -d'=' -f2-)
  SUPABASE_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2-)
  echo "SUPABASE_URL=$SUPABASE_URL" >> .env
  echo "SUPABASE_ANON_KEY=$SUPABASE_KEY" >> .env
fi

# Generate JWT secret if not exists
if ! grep -q "^JWT_SECRET=" .env || grep -q "JWT_SECRET=\$(openssl" .env; then
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
fi

# Start with PM2
echo "🚀 Starting server with PM2..."
pm2 start dist/server/index.js --name vergen-api --time

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "✅ Server updated and running!"
echo ""
pm2 status
echo ""
echo "📊 Test health endpoint:"
sleep 2
curl -s http://localhost:3000/api/health | jq . || curl -s http://localhost:3000/api/health
echo ""
echo ""
echo "🎉 Done! Backend is ready at: http://192.99.145.87:3000"
