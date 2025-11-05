#!/bin/bash

# VerGen Browser - Setup Completo su Singola VPS
# Per Ubuntu 25.04 / 22.04 LTS
# Questo script installa: Squid Proxy + Node.js Backend + Nginx Frontend

set -e  # Exit on error

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "VerGen Browser - Setup Completo VPS"
echo "==========================================${NC}"
echo ""

# Verifica root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Esegui questo script come root: sudo bash FULL_VPS_SETUP.sh${NC}"
  exit 1
fi

# Verifica Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
  echo -e "${YELLOW}Attenzione: Questo script è testato su Ubuntu. Continuo comunque...${NC}"
fi

# ==========================================
# PARTE 1: AGGIORNAMENTO SISTEMA
# ==========================================
echo -e "${BLUE}[1/9] Aggiornamento sistema...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git ufw

# ==========================================
# PARTE 2: INSTALLAZIONE SQUID PROXY
# ==========================================
echo -e "${BLUE}[2/9] Installazione Squid Proxy...${NC}"
apt install -y squid

# Backup configurazione originale
cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

# Configurazione Squid
cat > /etc/squid/squid.conf << 'EOF'
# VerGen Browser Proxy Configuration

# Porta HTTP proxy
http_port 3128

# Directory cache (100 MB)
cache_dir ufs /var/spool/squid 100 16 256

# Log accessi
access_log /var/log/squid/access.log squid

# Hostname visibile
visible_hostname VerGen Browser-proxy

# ACL - Permetti localhost (backend sulla stessa VPS)
acl backend_server src 127.0.0.1

# Policy accessi
http_access allow backend_server
http_access deny all

# Anonimizza header
forwarded_for delete

# Header consentiti
request_header_access Allow allow all
request_header_access Authorization allow all
request_header_access Proxy-Authorization allow all
request_header_access Cache-Control allow all
request_header_access Content-Type allow all
request_header_access Cookie allow all

# Dimensione massima oggetto
maximum_object_size 50 MB

# Timeout
connect_timeout 30 seconds
read_timeout 30 seconds
EOF

# Inizializza cache
squid -z

# Avvia Squid
systemctl start squid
systemctl enable squid

echo -e "${GREEN}✓ Squid Proxy installato e avviato sulla porta 3128${NC}"

# ==========================================
# PARTE 3: INSTALLAZIONE NODE.JS
# ==========================================
echo -e "${BLUE}[3/9] Installazione Node.js 20.x...${NC}"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${GREEN}✓ Node.js $(node -v) installato${NC}"
echo -e "${GREEN}✓ npm $(npm -v) installato${NC}"

# Installa PM2 globalmente
npm install -g pm2

echo -e "${GREEN}✓ PM2 installato${NC}"

# ==========================================
# PARTE 4: INSTALLAZIONE NGINX
# ==========================================
echo -e "${BLUE}[4/9] Installazione Nginx...${NC}"
apt install -y nginx

systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx installato e avviato${NC}"

# ==========================================
# PARTE 5: CONFIGURAZIONE FIREWALL
# ==========================================
echo -e "${BLUE}[5/9] Configurazione firewall UFW...${NC}"

# Permetti SSH
ufw allow 22/tcp

# Permetti HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Squid è solo locale, non esporre
# ufw allow 3128/tcp  # NON esporre pubblicamente

# Attiva firewall
echo "y" | ufw enable

echo -e "${GREEN}✓ Firewall configurato (SSH, HTTP, HTTPS)${NC}"

# ==========================================
# PARTE 6: DOMINIO E SSL
# ==========================================
echo -e "${BLUE}[6/9] Configurazione dominio...${NC}"

read -p "Hai un dominio configurato? (y/n): " HAS_DOMAIN

if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
  read -p "Inserisci il tuo dominio (es: example.com): " DOMAIN_NAME

  # Installa Certbot
  apt install -y certbot python3-certbot-nginx

  echo -e "${YELLOW}Configurerò SSL dopo il setup dell'app${NC}"
else
  DOMAIN_NAME=$(curl -s ifconfig.me)
  echo -e "${YELLOW}Nessun dominio. Userò IP pubblico: $DOMAIN_NAME${NC}"
  echo -e "${YELLOW}ATTENZIONE: Senza dominio non posso configurare HTTPS/SSL${NC}"
fi

# ==========================================
# PARTE 7: SETUP PROGETTO
# ==========================================
echo -e "${BLUE}[7/9] Setup progetto VerGen Browser...${NC}"

# Chiedi dove clonare
read -p "Inserisci URL repository GitHub (o premi Enter per saltare): " REPO_URL

if [ -n "$REPO_URL" ]; then
  # Clone da GitHub
  cd /opt
  git clone "$REPO_URL" vergen-browser
  cd vergen-browser
else
  # Creazione directory
  mkdir -p /opt/vergen-browser
  echo -e "${YELLOW}Repository non clonato. Dovrai caricare i file manualmente in /opt/vergen-browser${NC}"
  read -p "Premi Enter per continuare..."
fi

PROJECT_DIR="/opt/vergen-browser"

# ==========================================
# PARTE 8: CONFIGURAZIONE .env
# ==========================================
echo -e "${BLUE}[8/9] Configurazione variabili ambiente...${NC}"

cat > "$PROJECT_DIR/.env" << EOF
# Database Supabase
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU

# JWT Authentication
JWT_SECRET=CHANGE_THIS_SECRET_MIN_32_CHARS_$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d

# Stripe (DEVI CONFIGURARE MANUALMENTE)
STRIPE_PUBLIC_KEY=pk_test_CHANGE_THIS
STRIPE_SECRET_KEY=sk_test_CHANGE_THIS
STRIPE_PRICE_ID=price_CHANGE_THIS
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_THIS

# VPS Proxy (localhost perché tutto sulla stessa VPS)
PROXY_VPS_HOST=127.0.0.1
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=
PROXY_AUTH_PASS=

# Application
NODE_ENV=production
PORT=3000
APP_URL=http://$DOMAIN_NAME
EOF

echo -e "${GREEN}✓ File .env creato in $PROJECT_DIR/.env${NC}"
echo -e "${YELLOW}⚠ IMPORTANTE: Modifica .env e inserisci le chiavi Stripe reali!${NC}"

# ==========================================
# PARTE 9: CONFIGURAZIONE NGINX
# ==========================================
echo -e "${BLUE}[9/9] Configurazione Nginx...${NC}"

cat > /etc/nginx/sites-available/vergen-browser << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Frontend (serve file statici da dist/)
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;

        # Cache per assets statici
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (proxy a Node.js)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout lunghi per proxy requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Disabilita log per assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        access_log off;
    }
}
EOF

# Attiva configurazione
ln -sf /etc/nginx/sites-available/vergen-browser /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configurazione
nginx -t

# Reload Nginx
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configurato${NC}"

# ==========================================
# INSTALLAZIONE DIPENDENZE E BUILD
# ==========================================
echo ""
echo -e "${BLUE}Installazione dipendenze npm...${NC}"

if [ -f "$PROJECT_DIR/package.json" ]; then
  cd "$PROJECT_DIR"
  npm install

  echo -e "${BLUE}Build frontend...${NC}"
  npm run build

  echo -e "${BLUE}Build backend...${NC}"
  npm run build:server

  echo -e "${GREEN}✓ Build completato${NC}"
else
  echo -e "${YELLOW}⚠ package.json non trovato. Carica prima il progetto!${NC}"
fi

# ==========================================
# AVVIO BACKEND CON PM2
# ==========================================
echo ""
echo -e "${BLUE}Avvio backend con PM2...${NC}"

if [ -f "$PROJECT_DIR/dist/server/index.js" ]; then
  cd "$PROJECT_DIR"
  pm2 start dist/server/index.js --name vergen-api --time
  pm2 startup
  pm2 save

  echo -e "${GREEN}✓ Backend avviato con PM2${NC}"
else
  echo -e "${YELLOW}⚠ Backend non trovato. Build manualmente dopo aver caricato il progetto.${NC}"
fi

# ==========================================
# SETUP SSL (se dominio presente)
# ==========================================
if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
  echo ""
  echo -e "${BLUE}Setup SSL con Let's Encrypt...${NC}"

  certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --email admin@"$DOMAIN_NAME" || {
    echo -e "${YELLOW}⚠ Certbot fallito. Configura SSL manualmente:${NC}"
    echo "   sudo certbot --nginx -d $DOMAIN_NAME"
  }
fi

# ==========================================
# RIEPILOGO FINALE
# ==========================================
echo ""
echo -e "${GREEN}=========================================="
echo "✓ SETUP COMPLETATO CON SUCCESSO!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Informazioni VPS:${NC}"
echo "  • IP Pubblico: $(curl -s ifconfig.me)"
echo "  • Dominio: $DOMAIN_NAME"
echo "  • Progetto: $PROJECT_DIR"
echo ""
echo -e "${YELLOW}Servizi Attivi:${NC}"
echo "  • Squid Proxy: localhost:3128"
echo "  • Backend API: localhost:3000"
echo "  • Nginx: porta 80 (HTTP) e 443 (HTTPS)"
echo ""
echo -e "${YELLOW}Comandi Utili:${NC}"
echo "  • Backend logs: pm2 logs vergen-api"
echo "  • Backend restart: pm2 restart vergen-api"
echo "  • Backend status: pm2 status"
echo "  • Nginx restart: systemctl restart nginx"
echo "  • Nginx logs: tail -f /var/log/nginx/error.log"
echo "  • Squid logs: tail -f /var/log/squid/access.log"
echo ""
echo -e "${YELLOW}File Importanti:${NC}"
echo "  • .env: $PROJECT_DIR/.env"
echo "  • Nginx config: /etc/nginx/sites-available/vergen-browser"
echo "  • Squid config: /etc/squid/squid.conf"
echo ""
echo -e "${RED}⚠ AZIONI RICHIESTE:${NC}"
echo "  1. Modifica $PROJECT_DIR/.env con chiavi Stripe reali"
echo "  2. Riavvia backend: pm2 restart vergen-api"
echo "  3. Testa applicazione: http://$DOMAIN_NAME"
echo ""
echo -e "${YELLOW}URL Applicazione:${NC}"
echo "  • Frontend: http://$DOMAIN_NAME"
echo "  • API Health: http://$DOMAIN_NAME/api/health"
echo ""
echo -e "${GREEN}Setup completato! 🚀🇨🇦${NC}"
