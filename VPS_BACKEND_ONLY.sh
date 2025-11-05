#!/bin/bash

# VerGen Browser - Backend + Proxy Setup (NO Frontend)
# Frontend sarà su Vercel/Netlify
# Per Ubuntu 25.04 / 22.04 LTS

set -e

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "VerGen Browser - Backend + Proxy Setup"
echo "Frontend su Vercel/Netlify"
echo "==========================================${NC}"
echo ""

# Verifica root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Esegui come root: sudo bash VPS_BACKEND_ONLY.sh${NC}"
  exit 1
fi

# ==========================================
# PARTE 1: AGGIORNAMENTO SISTEMA
# ==========================================
echo -e "${BLUE}[1/7] Aggiornamento sistema...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git ufw

# ==========================================
# PARTE 2: INSTALLAZIONE SQUID PROXY
# ==========================================
echo -e "${BLUE}[2/7] Installazione Squid Proxy...${NC}"
apt install -y squid

cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

cat > /etc/squid/squid.conf << 'EOF'
# VerGen Browser Proxy Configuration
http_port 3128
cache_dir ufs /var/spool/squid 100 16 256
access_log /var/log/squid/access.log squid
visible_hostname vergen-proxy
acl backend_server src 127.0.0.1
http_access allow backend_server
http_access deny all
forwarded_for delete
maximum_object_size 50 MB
connect_timeout 30 seconds
read_timeout 30 seconds
EOF

squid -z
systemctl start squid
systemctl enable squid

echo -e "${GREEN}✓ Squid Proxy installato (porta 3128)${NC}"

# ==========================================
# PARTE 3: INSTALLAZIONE NODE.JS
# ==========================================
echo -e "${BLUE}[3/7] Installazione Node.js 20...${NC}"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

echo -e "${GREEN}✓ Node.js $(node -v) installato${NC}"
echo -e "${GREEN}✓ npm $(npm -v) installato${NC}"
echo -e "${GREEN}✓ PM2 installato${NC}"

# ==========================================
# PARTE 4: INSTALLAZIONE NGINX (OPZIONALE)
# ==========================================
echo -e "${BLUE}[4/7] Installazione Nginx...${NC}"
apt install -y nginx certbot python3-certbot-nginx

echo -e "${GREEN}✓ Nginx installato${NC}"

# ==========================================
# PARTE 5: FIREWALL
# ==========================================
echo -e "${BLUE}[5/7] Configurazione firewall...${NC}"

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

read -p "Vuoi esporre direttamente porta 3000 backend? (y/n): " EXPOSE_PORT
if [ "$EXPOSE_PORT" = "y" ] || [ "$EXPOSE_PORT" = "Y" ]; then
  ufw allow 3000/tcp
  echo -e "${YELLOW}Porta 3000 esposta pubblicamente${NC}"
else
  echo -e "${YELLOW}Porta 3000 accessibile solo tramite Nginx${NC}"
fi

echo "y" | ufw enable

echo -e "${GREEN}✓ Firewall configurato${NC}"

# ==========================================
# PARTE 6: CLONE PROGETTO
# ==========================================
echo -e "${BLUE}[6/7] Clone progetto...${NC}"

read -p "URL repository GitHub: " REPO_URL

if [ -n "$REPO_URL" ]; then
  cd /opt
  git clone "$REPO_URL" vergen-browser || {
    echo -e "${RED}Errore clone repository${NC}"
    exit 1
  }
  cd vergen-browser
else
  echo -e "${RED}Repository URL richiesto!${NC}"
  exit 1
fi

PROJECT_DIR="/opt/vergen-browser"

# Installa dipendenze
echo -e "${BLUE}Installazione dipendenze npm...${NC}"
npm install

# Build backend
echo -e "${BLUE}Build backend...${NC}"
npm run build:server

echo -e "${GREEN}✓ Backend compilato${NC}"

# ==========================================
# PARTE 7: CONFIGURAZIONE
# ==========================================
echo -e "${BLUE}[7/7] Configurazione...${NC}"

# Crea .env
cat > "$PROJECT_DIR/.env" << EOF
# Database Supabase
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU

# JWT Authentication
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Stripe (CONFIGURARE MANUALMENTE!)
STRIPE_PUBLIC_KEY=pk_test_CHANGE_THIS
STRIPE_SECRET_KEY=sk_test_CHANGE_THIS
STRIPE_PRICE_ID=price_CHANGE_THIS
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_THIS

# VPS Proxy (localhost)
PROXY_VPS_HOST=127.0.0.1
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=
PROXY_AUTH_PASS=

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://vergen-browser-proxy-7yzs.bolt.host
EOF

echo -e "${GREEN}✓ File .env creato${NC}"

# Avvia backend con PM2
cd "$PROJECT_DIR"
pm2 start dist/server/index.js --name vergen-api --time
pm2 startup
pm2 save

echo -e "${GREEN}✓ Backend avviato con PM2${NC}"

# Configura Nginx (opzionale)
read -p "Hai un dominio per l'API? (y/n): " HAS_DOMAIN

if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
  read -p "Dominio API (es: api.vergen browser.com): " API_DOMAIN

  cat > /etc/nginx/sites-available/vergen-api << EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # CORS headers (se frontend su dominio diverso)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

  ln -sf /etc/nginx/sites-available/vergen-api /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  nginx -t
  systemctl reload nginx

  echo -e "${GREEN}✓ Nginx configurato per $API_DOMAIN${NC}"

  # Setup SSL
  read -p "Vuoi configurare SSL con Let's Encrypt? (y/n): " SETUP_SSL
  if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos --email admin@"$API_DOMAIN" || {
      echo -e "${YELLOW}⚠ SSL setup fallito. Configura manualmente:${NC}"
      echo "   sudo certbot --nginx -d $API_DOMAIN"
    }
  fi

  API_URL="https://$API_DOMAIN"
else
  VPS_IP=$(curl -s ifconfig.me)
  API_URL="http://$VPS_IP:3000"
  echo -e "${YELLOW}⚠ Nessun dominio configurato${NC}"
fi

# ==========================================
# RIEPILOGO FINALE
# ==========================================
echo ""
echo -e "${GREEN}=========================================="
echo "✓ BACKEND + PROXY SETUP COMPLETATO!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Informazioni VPS:${NC}"
echo "  • IP Pubblico: $(curl -s ifconfig.me)"
echo "  • Progetto: $PROJECT_DIR"
echo "  • API URL: $API_URL"
echo ""
echo -e "${YELLOW}Servizi Attivi:${NC}"
echo "  • Squid Proxy: localhost:3128"
echo "  • Backend API: localhost:3000"
echo "  • PM2: pm2 status"
echo ""
echo -e "${YELLOW}Comandi Utili:${NC}"
echo "  • Logs: pm2 logs vergen-api"
echo "  • Restart: pm2 restart vergen-api"
echo "  • Status: pm2 status"
echo "  • Squid logs: sudo tail -f /var/log/squid/access.log"
echo ""
echo -e "${RED}⚠ AZIONI RICHIESTE:${NC}"
echo ""
echo "1. CONFIGURA STRIPE:"
echo "   nano $PROJECT_DIR/.env"
echo "   (Inserisci chiavi Stripe reali)"
echo ""
echo "2. AGGIORNA APP_URL:"
echo "   nano $PROJECT_DIR/.env"
echo "   APP_URL=https://tuo-frontend.vercel.app"
echo ""
echo "3. RIAVVIA BACKEND:"
echo "   pm2 restart vergen-api"
echo ""
echo "4. DEPLOY FRONTEND SU VERCEL/NETLIFY:"
echo "   Variabile ambiente da aggiungere:"
echo "   VITE_API_URL=$API_URL"
echo ""
echo "5. AGGIORNA STRIPE WEBHOOK:"
echo "   URL: $API_URL/api/webhooks/stripe"
echo ""
echo -e "${YELLOW}Test Backend:${NC}"
echo "  curl $API_URL/api/health"
echo ""
echo -e "${GREEN}Setup completato! 🚀🇨🇦${NC}"
