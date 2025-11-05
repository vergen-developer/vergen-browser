# VerGen Browser - Guida Setup Singola VPS

Questa guida ti aiuta a configurare **tutto su una singola VPS** (Squid Proxy + Backend Node.js + Frontend).

---

## Requisiti VPS

- **OS**: Ubuntu 25.04 o 22.04 LTS
- **RAM**: Minimo 2GB (4GB consigliato)
- **CPU**: Minimo 1 core (2+ consigliato)
- **Storage**: Minimo 20GB SSD
- **Location**: Canada (per IP canadese)
- **Accesso**: SSH come root

---

## Setup in 4 Passi

### Passo 1: Prepara Repository GitHub

Sul tuo computer locale (non sulla VPS):

```bash
# Inizializza Git nel progetto
cd /path/to/vergen-browser
git init
git add .
git commit -m "Initial commit"

# Crea repository su GitHub.com
# Poi pusha:
git remote add origin https://github.com/tuo-username/vergen-browser.git
git branch -M main
git push -u origin main
```

**Alternativa**: Se non vuoi usare Git, puoi caricare i file manualmente con SFTP/SCP (vedi Passo 3b).

---

### Passo 2: Connetti alla VPS

```bash
# Dal tuo computer
ssh root@TUO_IP_VPS

# Dovresti vedere il prompt della VPS:
root@vps:~#
```

---

### Passo 3a: Esegui Script Automatico (CONSIGLIATO)

```bash
# Scarica script
wget https://raw.githubusercontent.com/tuo-username/vergen-browser/main/FULL_VPS_SETUP.sh

# Oppure se hai già il progetto:
# scp FULL_VPS_SETUP.sh root@TUO_IP_VPS:/root/

# Rendi eseguibile
chmod +x FULL_VPS_SETUP.sh

# Esegui
sudo bash FULL_VPS_SETUP.sh
```

Lo script ti chiederà:
1. **Hai un dominio?** - Rispondi `y` se hai un dominio puntato alla VPS, `n` altrimenti
2. **Dominio**: Se hai risposto `y`, inserisci il dominio (es: `vergen browser.com`)
3. **URL Repository**: Inserisci l'URL del tuo repo GitHub

Lo script installerà automaticamente tutto!

---

### Passo 3b: Setup Manuale (se preferisci)

Se preferisci fare tutto manualmente:

#### 1. Aggiorna sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw nginx
```

#### 2. Installa Squid

```bash
sudo apt install -y squid
sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

# Configura Squid per localhost
sudo nano /etc/squid/squid.conf
```

Incolla questa configurazione:

```conf
http_port 3128
cache_dir ufs /var/spool/squid 100 16 256
access_log /var/log/squid/access.log squid
visible_hostname VerGen Browser-proxy
acl backend_server src 127.0.0.1
http_access allow backend_server
http_access deny all
forwarded_for delete
maximum_object_size 50 MB
connect_timeout 30 seconds
read_timeout 30 seconds
```

Salva (CTRL+X, Y, Enter) e avvia:

```bash
sudo squid -z
sudo systemctl start squid
sudo systemctl enable squid
```

#### 3. Installa Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2
```

#### 4. Clone progetto

```bash
cd /opt
git clone https://github.com/tuo-username/vergen-browser.git
cd vergen-browser
```

Oppure carica con SCP:

```bash
# Dal tuo computer locale
scp -r /path/to/vergen-browser root@TUO_IP_VPS:/opt/
```

#### 5. Configura .env

```bash
cd /opt/vergen-browser
nano .env
```

Copia questo template e compila:

```env
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU

JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

STRIPE_PUBLIC_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PRICE_ID=price_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

PROXY_VPS_HOST=127.0.0.1
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=
PROXY_AUTH_PASS=

NODE_ENV=production
PORT=3000
APP_URL=http://TUO_IP_O_DOMINIO
```

#### 6. Build e avvia

```bash
npm install
npm run build
npm run build:server
pm2 start dist/server/index.js --name vergen-api
pm2 startup
pm2 save
```

#### 7. Configura Nginx

```bash
sudo nano /etc/nginx/sites-available/vergen-browser
```

Incolla:

```nginx
server {
    listen 80;
    server_name TUO_IP_O_DOMINIO;

    location / {
        root /opt/vergen-browser/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Attiva:

```bash
sudo ln -s /etc/nginx/sites-available/vergen-browser /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

### Passo 4: Configura Stripe

1. Vai su https://dashboard.stripe.com
2. Crea prodotto €0,50/mese
3. Copia chiavi da **Developers > API Keys**
4. Crea webhook da **Developers > Webhooks**:
   - URL: `http://TUO_IP_O_DOMINIO/api/webhooks/stripe`
   - Eventi: `customer.subscription.*`
5. Copia webhook secret

Aggiorna `.env` sulla VPS:

```bash
nano /opt/vergen-browser/.env
# Modifica STRIPE_* con valori reali
```

Riavvia backend:

```bash
pm2 restart vergen-api
```

---

## Test Applicazione

### 1. Verifica Servizi

```bash
# Squid attivo?
sudo systemctl status squid

# Backend attivo?
pm2 status

# Nginx attivo?
sudo systemctl status nginx

# Test proxy Squid
curl -x http://127.0.0.1:3128 https://google.com
```

### 2. Test API Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Dovrebbe rispondere:
# {"status":"healthy","timestamp":"...","uptime":123}
```

### 3. Test Frontend

Apri browser e vai su:
```
http://TUO_IP_VPS
```

Dovresti vedere la homepage di VerGen Browser!

### 4. Test Completo

1. **Registrazione**: Crea account
2. **Login**: Accedi
3. **Dashboard**: Verifica stato abbonamento
4. **Browser Interface**: Prova a navigare (es: `example.com`)
   - Nota: Pagamento non funzionerà finché non configuri Stripe

---

## Setup SSL (HTTPS) - Opzionale ma Consigliato

Se hai un **dominio** puntato alla VPS:

```bash
# Installa Certbot
sudo apt install -y certbot python3-certbot-nginx

# Ottieni certificato SSL (sostituisci example.com)
sudo certbot --nginx -d vergen browser.com

# Certbot configurerà automaticamente Nginx per HTTPS!
```

Ora puoi accedere via HTTPS:
```
https://vergen browser.com
```

**IMPORTANTE**: Aggiorna anche `.env`:

```bash
nano /opt/vergen-browser/.env
# Cambia APP_URL in https://vergen browser.com
```

Riavvia:

```bash
pm2 restart vergen-api
```

---

## Comandi Utili

### Backend (PM2)

```bash
# Logs in real-time
pm2 logs vergen-api

# Status
pm2 status

# Restart
pm2 restart vergen-api

# Stop
pm2 stop vergen-api

# Start
pm2 start vergen-api
```

### Nginx

```bash
# Restart
sudo systemctl restart nginx

# Reload config
sudo systemctl reload nginx

# Test config
sudo nginx -t

# Logs errori
sudo tail -f /var/log/nginx/error.log

# Logs accessi
sudo tail -f /var/log/nginx/access.log
```

### Squid

```bash
# Status
sudo systemctl status squid

# Restart
sudo systemctl restart squid

# Logs
sudo tail -f /var/log/squid/access.log
```

### Sistema

```bash
# Spazio disco
df -h

# Memoria RAM
free -h

# Processi attivi
htop  # (installa con: sudo apt install htop)

# Riavvia VPS
sudo reboot
```

---

## Aggiornamenti Codice

Quando modifichi il codice localmente e vuoi aggiornare la VPS:

```bash
# 1. Pusha su GitHub (dal tuo computer)
git add .
git commit -m "Update"
git push

# 2. Sulla VPS
cd /opt/vergen-browser
git pull
npm install  # se hai aggiunto dipendenze
npm run build
npm run build:server
pm2 restart vergen-api
```

---

## Troubleshooting

### Problema: Backend non si avvia

```bash
# Verifica logs
pm2 logs vergen-api

# Verifica .env
cat /opt/vergen-browser/.env

# Verifica Node.js
node -v  # Dovrebbe essere v20.x

# Ricompila
cd /opt/vergen-browser
npm run build:server
pm2 restart vergen-api
```

### Problema: Frontend 502 Bad Gateway

```bash
# Verifica backend sia attivo
pm2 status

# Verifica Nginx config
sudo nginx -t

# Verifica logs Nginx
sudo tail -f /var/log/nginx/error.log

# Riavvia Nginx
sudo systemctl restart nginx
```

### Problema: Proxy non funziona

```bash
# Verifica Squid
sudo systemctl status squid

# Test proxy
curl -x http://127.0.0.1:3128 https://google.com

# Logs Squid
sudo tail -f /var/log/squid/access.log

# Riavvia Squid
sudo systemctl restart squid
```

### Problema: Stripe webhook non riceve eventi

- URL webhook deve essere HTTPS in produzione
- Verifica URL sia: `https://tuo-dominio.com/api/webhooks/stripe`
- Test con Stripe CLI: `stripe listen --forward-to http://TUO_IP/api/webhooks/stripe`

---

## Backup

### Backup .env (IMPORTANTE)

```bash
# Backup .env su tuo computer
scp root@TUO_IP_VPS:/opt/vergen-browser/.env ./backup-env
```

### Backup Database

Database su Supabase ha backup automatici. Per sicurezza:
1. Vai su Supabase Dashboard
2. Database > Backups
3. Download backup manuale

---

## Monitoraggio

### Setup Uptime Monitoring (Opzionale)

Usa servizi gratuiti come:
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com

Monitora:
- `http://tuo-ip/api/health` (backend)
- `http://tuo-ip` (frontend)

---

## Architettura Finale

```
┌─────────────────────────────────────┐
│         TUA VPS CANADA              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Nginx (porta 80/443)        │  │
│  │  - Serve frontend da /dist   │  │
│  │  - Proxy /api → localhost    │  │
│  └────────┬─────────────────────┘  │
│           │                         │
│           ▼                         │
│  ┌──────────────────────────────┐  │
│  │  Node.js Backend (porta 3000)│  │
│  │  - Express API               │  │
│  │  - Gestisce auth/Stripe      │  │
│  │  - Usa proxy Squid           │  │
│  └────────┬─────────────────────┘  │
│           │                         │
│           ▼                         │
│  ┌──────────────────────────────┐  │
│  │  Squid Proxy (porta 3128)    │  │
│  │  - Fornisce IP canadese      │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │   Internet   │
    └──────────────┘
```

---

## Costi Mensili Stimati

- VPS Canada (4GB RAM): €5-10/mese
- Dominio (opzionale): €10-15/anno
- SSL Let's Encrypt: GRATIS
- Supabase: GRATIS (tier free)
- Stripe: Solo commissioni transazioni

**Totale: €5-10/mese** 🎉

---

## Prossimi Passi

1. ✅ Setup VPS completo
2. ⏳ Configura Stripe
3. ⏳ Ottieni dominio (opzionale)
4. ⏳ Setup SSL
5. ⏳ Test completo
6. ⏳ Marketing e utenti!

---

**Hai completato il setup! 🚀🇨🇦**

Per supporto, vedi:
- [README.md](README.md)
- [SETUP_GUIDE.md](SETUP_GUIDE.md)
