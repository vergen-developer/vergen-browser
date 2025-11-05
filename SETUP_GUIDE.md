# VerGen Browser - Guida Setup Completa

Questa guida ti accompagnerà passo dopo passo nella configurazione completa di VerGen Browser.

---

## Indice

1. [Preparazione Account](#1-preparazione-account)
2. [Configurazione Database Supabase](#2-configurazione-database-supabase)
3. [Configurazione Stripe](#3-configurazione-stripe)
4. [Setup VPS Proxy Linux](#4-setup-vps-proxy-linux)
5. [Configurazione Locale](#5-configurazione-locale)
6. [Deploy Produzione](#6-deploy-produzione)
7. [Test Completo](#7-test-completo)

---

## 1. Preparazione Account

### Account Necessari

Prima di iniziare, crea account su:

1. **Supabase** (già fatto ✅)
2. **Stripe** - https://dashboard.stripe.com/register
3. **VPS Provider** - Es: OVH, DigitalOcean, Hetzner
4. **Deploy Platform** (opzionale) - Railway, Heroku, Netlify/Vercel

---

## 2. Configurazione Database Supabase

### Il database è già configurato! ✅

Le seguenti tabelle sono già state create:
- `users` - Utenti registrati
- `subscriptions` - Gestione abbonamenti
- `proxy_sessions` - Storico navigazione
- `stripe_events` - Log eventi Stripe

**Nessuna azione richiesta per il database.**

Assicurati solo di avere in `.env`:
```env
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 3. Configurazione Stripe

### Passo 1: Crea Account Stripe

1. Vai su https://dashboard.stripe.com/register
2. Completa la registrazione
3. Attiva il tuo account (potrebbero richiedere documenti)

### Passo 2: Crea Prodotto

1. Vai in **Prodotti** nel menu Stripe
2. Clicca **+ Nuovo Prodotto**
3. Compila:
   - Nome: `Browser Proxy Mensile`
   - Descrizione: `Accesso illimitato al proxy browser con IP canadese`
   - Prezzo: `€0,50`
   - Tipo: `Ricorrente`
   - Frequenza: `Mensile`
4. Clicca **Salva prodotto**
5. **Copia il Price ID** (es: `price_1Axxxxxxxxxxx`)

### Passo 3: Ottieni API Keys

1. Vai in **Developers > API Keys**
2. Copia:
   - **Publishable key** (pk_live_xxx o pk_test_xxx)
   - **Secret key** (sk_live_xxx o sk_test_xxx - MANTIENI SEGRETO!)

### Passo 4: Configura Webhook

1. Vai in **Developers > Webhooks**
2. Clicca **+ Add endpoint**
3. Endpoint URL: `https://your-api-domain.com/api/webhooks/stripe`
   - In sviluppo locale usa ngrok o Stripe CLI
4. Seleziona eventi:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clicca **Add endpoint**
6. **Copia Signing secret** (whsec_xxx)

### Passo 5: Test con Stripe CLI (Locale)

```bash
# Installa Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Linux: wget e dpkg

# Login
stripe login

# Forward webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In un altro terminale, testa webhook
stripe trigger customer.subscription.created
```

### Aggiungi a .env

```env
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_1Axxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## 4. Setup VPS Proxy Linux

### Passo 1: Acquista VPS

Raccomandazioni provider:
- **OVH** (Beauharnois, Canada) - €3-5/mese
- **DigitalOcean** (Toronto) - $4-6/mese
- **Hetzner** - €4-7/mese

Specifiche minime:
- **OS**: Ubuntu 25.04 o 22.04
- **CPU**: 1-2 vCore
- **RAM**: 1-2GB
- **Storage**: 20GB SSD
- **Location**: Canada (preferibilmente Beauharnois o Toronto)

### Passo 2: Connetti al VPS

```bash
# SSH nel VPS
ssh root@your-vps-ip
```

### Passo 3: Installa Squid

```bash
# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Squid Proxy
sudo apt install squid -y

# Verifica installazione
squid -v
```

### Passo 4: Configura Squid

```bash
# Backup config originale
sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

# Edita config
sudo nano /etc/squid/squid.conf
```

**Incolla questa configurazione:**

```conf
# Porta HTTP proxy
http_port 3128

# Directory cache (100 MB)
cache_dir ufs /var/spool/squid 100 16 256

# Log accessi
access_log /var/log/squid/access.log squid

# Hostname visibile (opzionale)
visible_hostname VerGen Browser-proxy

# ACL - Permetti solo IP del tuo backend
acl backend_server src YOUR_BACKEND_SERVER_IP/32

# Permetti accesso solo dal backend
http_access allow backend_server
http_access deny all

# Anonimizza header forwarded (opzionale)
forwarded_for delete

# Header visibili
request_header_access Allow allow all
request_header_access Authorization allow all
request_header_access Proxy-Authorization allow all
request_header_access Cache-Control allow all
request_header_access Content-Type allow all
request_header_access Cookie allow all

# Dimensione massima oggetto
maximum_object_size 50 MB

# Timeout connessione
connect_timeout 30 seconds
read_timeout 30 seconds
```

**Nota:** Sostituisci `YOUR_BACKEND_SERVER_IP` con l'IP pubblico del server dove gira il backend Node.js.

Salva con `CTRL+X`, poi `Y`, poi `ENTER`.

### Passo 5: Inizializza e Avvia Squid

```bash
# Crea directory cache
sudo squid -z

# Avvia Squid
sudo systemctl start squid

# Verifica status
sudo systemctl status squid

# Abilita avvio automatico al boot
sudo systemctl enable squid
```

### Passo 6: Configura Firewall

```bash
# Installa UFW se non presente
sudo apt install ufw -y

# Permetti SSH (IMPORTANTE!)
sudo ufw allow 22/tcp

# Permetti porta Squid SOLO da backend
sudo ufw allow from YOUR_BACKEND_IP to any port 3128

# Attiva firewall
sudo ufw enable

# Verifica regole
sudo ufw status
```

### Passo 7: Test Proxy

```bash
# Test locale (dal VPS stesso)
curl -x http://localhost:3128 https://www.google.com

# Test remoto (dal tuo PC, sostituisci IP)
curl -x http://YOUR_VPS_IP:3128 https://ifconfig.me

# Dovresti vedere l'IP del VPS
```

### Passo 8: Monitor Logs

```bash
# Segui logs in real-time
sudo tail -f /var/log/squid/access.log

# Verifica errori
sudo tail -f /var/log/squid/cache.log
```

### Aggiungi a .env

```env
PROXY_VPS_HOST=123.456.789.xxx  # IP pubblico del VPS
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=                # Lascia vuoto se no auth
PROXY_AUTH_PASS=                # Lascia vuoto se no auth
```

---

## 5. Configurazione Locale

### Passo 1: Clone Repository

```bash
git clone <repository-url>
cd vergen-browser
```

### Passo 2: Installa Dipendenze

```bash
npm install
```

### Passo 3: Configura .env

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

Edita `.env` e compila tutti i valori:

```env
# Supabase (già configurato)
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=your_key

# JWT (genera una stringa random di 32+ caratteri)
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
JWT_EXPIRES_IN=7d

# Stripe (dai passi precedenti)
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_1Axxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# VPS Proxy (dal passo precedente)
PROXY_VPS_HOST=123.456.789.xxx
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=
PROXY_AUTH_PASS=

# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
```

### Passo 4: Avvia Applicazione

```bash
# Avvia frontend + backend insieme
npm run dev:full
```

Apri browser su:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 6. Deploy Produzione

### Opzione A: Frontend su Netlify + Backend su Railway

#### Deploy Backend su Railway

1. Vai su https://railway.app
2. Clicca **New Project > Deploy from GitHub repo**
3. Seleziona il repository
4. Aggiungi variabili ambiente (tutte quelle in `.env`)
5. Railway rileverà automaticamente Node.js
6. Build command: `npm run build:server`
7. Start command: `npm run start:server`
8. Deploy!

Copia l'URL del backend (es: `https://your-app.railway.app`)

#### Deploy Frontend su Netlify

1. Vai su https://netlify.com
2. Clicca **Add new site > Import existing project**
3. Connetti GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Variabili ambiente:
   ```
   VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_API_URL=https://your-app.railway.app/api
   ```
6. Deploy!

### Opzione B: Tutto su VPS

Se preferisci hostare tutto su un singolo VPS:

```bash
# Sul VPS
git clone <repo-url>
cd vergen-browser
npm install
npm run build
npm run build:server

# Setup PM2 per processo persistente
npm install -g pm2

# Avvia backend
pm2 start dist/server/index.js --name vergen-api

# Setup Nginx per frontend
sudo apt install nginx
sudo nano /etc/nginx/sites-available/vergen

# Configurazione Nginx (esempio):
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/vergen-browser/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Attiva configurazione
sudo ln -s /etc/nginx/sites-available/vergen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Aggiorna Stripe Webhook

Una volta in produzione, aggiorna l'URL webhook su Stripe Dashboard:
- Vecchio: `http://localhost:3000/api/webhooks/stripe`
- Nuovo: `https://your-api-domain.com/api/webhooks/stripe`

---

## 7. Test Completo

### Test 1: Registrazione

1. Vai sulla homepage
2. Clicca "Inizia Ora"
3. Compila form registrazione
4. Verifica redirect a dashboard

### Test 2: Abbonamento

1. Dalla dashboard, clicca "Rinnova Abbonamento"
2. Completa pagamento su Stripe (usa carta test: `4242 4242 4242 4242`)
3. Verifica redirect a dashboard con conferma
4. Verifica stato abbonamento "Attivo"

### Test 3: Navigazione Proxy

1. Clicca "Apri Browser"
2. Inserisci URL: `ifconfig.me`
3. Clicca "Vai"
4. Verifica che mostri IP del VPS Canada, non il tuo

### Test 4: Storico

1. Torna a Dashboard
2. Verifica "Storico Navigazione" mostri sessione precedente
3. Controlla data, URL, e tempo caricamento

### Test 5: Gestione Abbonamento

1. Dashboard > "Gestisci Abbonamento"
2. Verifica redirect a portale Stripe
3. Testa cancellazione abbonamento (opzionale)

---

## Checklist Finale

- [ ] Database Supabase configurato ✅
- [ ] Stripe configurato con prodotto e webhook
- [ ] VPS proxy Linux setup con Squid
- [ ] Backend avviato e raggiungibile
- [ ] Frontend avviato e raggiungibile
- [ ] Registrazione funzionante
- [ ] Login funzionante
- [ ] Pagamento Stripe funzionante
- [ ] Proxy navigation funzionante
- [ ] IP mostrato è quello del VPS Canada
- [ ] Storico salva sessioni
- [ ] Dashboard mostra dati corretti

---

## Troubleshooting Comuni

### Problema: Proxy non si connette

**Soluzione:**
```bash
# Verifica Squid sia avviato
sudo systemctl status squid

# Verifica firewall
sudo ufw status

# Test proxy locale
curl -x http://localhost:3128 https://google.com

# Logs
sudo tail -f /var/log/squid/access.log
```

### Problema: Webhook Stripe non funziona

**Soluzione:**
- URL webhook deve essere HTTPS in produzione
- Verifica `STRIPE_WEBHOOK_SECRET` in `.env`
- Test locale con Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Controlla logs backend per errori

### Problema: "Token non valido"

**Soluzione:**
- Verifica `JWT_SECRET` sia lo stesso tra backend e token generato
- Token dura 7 giorni, rifai login
- Cancella localStorage: `localStorage.clear()`

### Problema: "Abbonamento scaduto" anche se pagato

**Soluzione:**
- Verifica su Stripe Dashboard che subscription sia `active`
- Controlla tabella `subscriptions` su Supabase
- Verifica webhook sia stato ricevuto (tabella `stripe_events`)
- Trigger manuale webhook da Stripe Dashboard

---

## Supporto

Per ulteriore supporto:
- Email: support@vergenbrowser.com
- Documentazione: README.md
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Congratulazioni! VerGen Browser è pronto! 🎉🇨🇦**
