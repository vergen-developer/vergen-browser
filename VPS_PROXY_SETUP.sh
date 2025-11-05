#!/bin/bash

# VerGen Browser - VPS Proxy Setup Script
# Per Ubuntu 25.04 / 22.04 LTS
# Location: Canada (Beauharnois / Toronto)

echo "=========================================="
echo "VerGen Browser - VPS Proxy Setup"
echo "=========================================="
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Esegui questo script come root: sudo bash VPS_PROXY_SETUP.sh${NC}"
  exit 1
fi

echo -e "${GREEN}[1/7] Aggiornamento sistema...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/7] Installazione Squid Proxy...${NC}"
apt install squid -y

echo -e "${GREEN}[3/7] Backup configurazione originale...${NC}"
cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

echo -e "${GREEN}[4/7] Configurazione Squid...${NC}"

# Richiedi IP backend
read -p "Inserisci IP pubblico del server backend (es: 123.456.789.xxx): " BACKEND_IP

# Crea nuova configurazione
cat > /etc/squid/squid.conf << EOF
# VerGen Browser Proxy Configuration

# Porta HTTP proxy
http_port 3128

# Directory cache (100 MB)
cache_dir ufs /var/spool/squid 100 16 256

# Log accessi
access_log /var/log/squid/access.log squid

# Hostname visibile
visible_hostname VerGen Browser-proxy

# ACL - Permetti solo IP del backend
acl backend_server src ${BACKEND_IP}/32

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

echo -e "${GREEN}[5/7] Inizializzazione cache Squid...${NC}"
squid -z

echo -e "${GREEN}[6/7] Avvio Squid...${NC}"
systemctl start squid
systemctl enable squid

echo -e "${GREEN}[7/7] Configurazione firewall...${NC}"
apt install ufw -y

# Permetti SSH
ufw allow 22/tcp

# Permetti Squid solo da backend
ufw allow from ${BACKEND_IP} to any port 3128

# Attiva firewall
echo "y" | ufw enable

echo ""
echo -e "${GREEN}=========================================="
echo "Setup completato con successo!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Informazioni VPS:${NC}"
echo "  - IP VPS: $(curl -s ifconfig.me)"
echo "  - Porta Proxy: 3128"
echo "  - Backend IP permesso: ${BACKEND_IP}"
echo ""
echo -e "${YELLOW}Test Proxy:${NC}"
echo "  curl -x http://$(curl -s ifconfig.me):3128 https://ifconfig.me"
echo ""
echo -e "${YELLOW}Monitor Logs:${NC}"
echo "  sudo tail -f /var/log/squid/access.log"
echo ""
echo -e "${YELLOW}Status Squid:${NC}"
echo "  sudo systemctl status squid"
echo ""
echo -e "${YELLOW}Aggiungi a .env del backend:${NC}"
echo "  PROXY_VPS_HOST=$(curl -s ifconfig.me)"
echo "  PROXY_VPS_PORT=3128"
echo ""
echo -e "${GREEN}Setup completato! 🇨🇦${NC}"
