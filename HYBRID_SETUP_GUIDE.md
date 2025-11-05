# VerGen Browser - Setup Ibrido (VPS + Vercel/Netlify)

**Configurazione Ottimale**: Backend + Squid Proxy sulla VPS, Frontend su Vercel/Netlify

---

## 🏗️ Architettura

```
┌──────────────────────────────┐
│   Vercel/Netlify (Global)    │
│   Frontend React (dist/)     │
│   CDN Globale + HTTPS        │
└────────────┬─────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────┐
│   TUA VPS (Canada)           │
│                              │
│  ┌────────────────────────┐ │
│  │ Nginx (porta 80/443)   │ │
│  │ Reverse Proxy          │ │
│  │ Solo per /api          │ │
│  └───────┬────────────────┘ │
│          ↓                   │
│  ┌────────────────────────┐ │
│  │ Backend Node.js :3000  │ │
│  │ Express API            │ │
│  └───────┬────────────────┘ │
│          ↓                   │
│  ┌────────────────────────┐ │
│  │ Squid Proxy :3128      │ │
│  │ IP Canadese 🇨🇦        │ │
│  └────────────────────────┘ │
└──────────────────────────────┘

Database: Supabase Cloud ☁️
Payments: Stripe Cloud ☁️
```

---

## ✅ Vantaggi di Questo Setup

- ✅ **Frontend su CDN globale** (velocissimo ovunque)
- ✅ **HTTPS automatico** su Vercel/Netlify
- ✅ **Deploy automatico** da Git
- ✅ **Backend in Canada** (IP canadese per proxy)
- ✅ **Costi ridotti** (Vercel/Netlify gratis)
- ✅ **Scalabilità** (frontend scala automaticamente)

---

## 📋 Setup in 3 Parti

### Parte 1: VPS (Backend + Proxy)
### Parte 2: Vercel/Netlify (Frontend)
### Parte 3: Configurazione Finale

---

# PARTE 1: Setup VPS (Backend + Proxy)

## Passo 1.1: Connetti alla VPS

```bash
ssh root@TUO_IP_VPS
```

## Passo 1.2: Esegui Script Backend

Creo uno script specifico per solo backend + proxy:

```bash
# Crea file script
nano setup-backend-only.sh
```

Incolla questo contenuto:

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "VerGen Browser - Backend + Proxy Setup"
echo "=========================================="

# Aggiorna sistema
apt update && apt upgrade -y
apt install -y curl wget git ufw nginx certbot python3-certbot-nginx

# Installa Squid
apt install -y squid
cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

cat > /etc/squid/squid.conf << 'EOF'
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

# Installa Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# Clone progetto
read -p "URL repository GitHub: " REPO_URL
cd /opt
git clone "$REPO_URL" vergen-browser
cd vergen-browser

# Installa dipendenze e build backend
npm install
npm run build:server

# Configura .env
cat > .env << 'ENVEOF'
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU

JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

STRIPE_PUBLIC_KEY=pk_test_CHANGE_THIS
STRIPE_SECRET_KEY=sk_test_CHANGE_THIS
STRIPE_PRICE_ID=price_CHANGE_THIS
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_THIS

PROXY_VPS_HOST=127.0.0.1
PROXY_VPS_PORT=3128

NODE_ENV=production
PORT=3000
APP_URL=https://your-frontend.vercel.app
ENVEOF

# Avvia backend con PM2
pm2 start dist/server/index.js --name vergen-api
pm2 startup
pm2 save

# Configura Nginx per API
read -p "Hai un dominio per l'API? (y/n): " HAS_DOMAIN

if [ "$HAS_DOMAIN" = "y" ]; then
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
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/vergen-api /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx

    # Setup SSL
    certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos --email admin@"$API_DOMAIN" || echo "Setup SSL manualmente"

    echo ""
    echo "✅ API disponibile su: https://$API_DOMAIN"
else
    echo ""
    echo "⚠️  Senza dominio, usa IP VPS per API"
    echo "   API URL: http://$(curl -s ifconfig.me):3000"
fi

echo ""
echo "=========================================="
echo "✅ Backend Setup Completato!"
echo "=========================================="
echo ""
echo "Servizi attivi:"
echo "  • Squid Proxy: localhost:3128"
echo "  • Backend API: localhost:3000"
echo "  • PM2 Status: pm2 status"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Modifica /opt/vergen-browser/.env con chiavi Stripe"
echo "  2. Riavvia: pm2 restart vergen-api"
echo "  3. Usa questo URL per frontend: https://$API_DOMAIN (o http://IP:3000)"
echo ""
```

Salva (CTRL+X, Y, Enter) e esegui:

```bash
chmod +x setup-backend-only.sh
sudo bash setup-backend-only.sh
```

## Passo 1.3: Configura Stripe

```bash
nano /opt/vergen-browser/.env
```

Modifica le variabili Stripe con valori reali, poi:

```bash
pm2 restart vergen-api
```

## Passo 1.4: Verifica Backend Funzionante

```bash
# Test health check
curl http://localhost:3000/api/health

# Dovrebbe rispondere con JSON status
```

## Passo 1.5: Annota URL API

Se hai configurato dominio:
```
API_URL=https://api.vergen browser.com
```

Se usi solo IP:
```
API_URL=http://TUO_IP_VPS:3000
```

**⚠️ IMPORTANTE**: Se usi IP senza dominio, devi esporre porta 3000:
```bash
sudo ufw allow 3000/tcp
```

---

# PARTE 2: Deploy Frontend su Vercel/Netlify

## Opzione A: Vercel (Consigliato)

### Passo 2A.1: Push su GitHub

Sul tuo computer locale:

```bash
cd /path/to/vergen-browser
git add .
git commit -m "Frontend deploy"
git push origin main
```

### Passo 2A.2: Deploy su Vercel

1. Vai su https://vercel.com
2. Click **Add New** > **Project**
3. **Import Git Repository** > Seleziona il tuo repo
4. **Configure Project**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Environment Variables** - Aggiungi:
   ```
   VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU
   VITE_API_URL=https://api.vergen browser.com
   ```

   **O se usi IP VPS**:
   ```
   VITE_API_URL=http://TUO_IP_VPS:3000
   ```

6. Click **Deploy**

7. Aspetta 2-3 minuti per build

8. **Vercel ti darà un URL**: `https://vergen-browser-xxx.vercel.app`

### Passo 2A.3: Dominio Personalizzato (Opzionale)

1. Su Vercel, vai in **Settings** > **Domains**
2. Aggiungi il tuo dominio (es: `vergen browser.com`)
3. Configura DNS come indicato da Vercel
4. HTTPS automatico in 1-2 minuti

---

## Opzione B: Netlify

### Passo 2B.1: Push su GitHub

(Stesso di sopra)

### Passo 2B.2: Deploy su Netlify

1. Vai su https://netlify.com
2. Click **Add new site** > **Import an existing project**
3. **Connect to Git provider** > GitHub
4. Seleziona repository
5. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_URL=https://api.vergen browser.com
   ```

7. Click **Deploy**

8. **Netlify ti darà un URL**: `https://vergen-browser-xxx.netlify.app`

### Passo 2B.3: Dominio Personalizzato (Opzionale)

1. Su Netlify, vai in **Domain settings**
2. Click **Add custom domain**
3. Segui istruzioni DNS

---

# PARTE 3: Configurazione Finale

## Passo 3.1: Aggiorna APP_URL sul Backend

Sulla VPS:

```bash
nano /opt/vergen-browser/.env
```

Modifica:
```env
APP_URL=https://vergen-browser-xxx.vercel.app
```

O se hai dominio personalizzato:
```env
APP_URL=https://vergen browser.com
```

Riavvia backend:
```bash
pm2 restart vergen-api
```

## Passo 3.2: Configura CORS

Il backend è già configurato per accettare richieste dal tuo frontend, ma verifica in `server/index.ts` che:

```typescript
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));
```

Se APP_URL è settato correttamente in .env, funzionerà automaticamente.

## Passo 3.3: Aggiorna Stripe Webhook

1. Vai su Stripe Dashboard > Developers > Webhooks
2. Clicca sul tuo webhook
3. Click **Update details**
4. Endpoint URL: `https://api.vergen browser.com/api/webhooks/stripe`
   (O `http://TUO_IP_VPS:3000/api/webhooks/stripe` se usi IP)
5. Salva

## Passo 3.4: Test CORS (Importante!)

Se usi **IP VPS senza dominio**, potresti avere problemi CORS perché frontend è HTTPS (Vercel) e backend è HTTP.

**Soluzione**: Usa un dominio con SSL anche per API, oppure usa tunnel come ngrok temporaneamente.

**Soluzione migliore**: Dominio per API con Cloudflare (gratis) o Let's Encrypt.

---

# Test Completo

## 1. Test Frontend

Vai su: `https://vergen-browser-xxx.vercel.app`

Dovresti vedere homepage VerGen Browser.

## 2. Test Registrazione

1. Click "Registrati"
2. Compila form
3. Se errore CORS, vedi sezione Troubleshooting

## 3. Test API da Browser Console

Su frontend, apri Console (F12) e scrivi:

```javascript
fetch('https://api.vergen browser.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Dovresti vedere: `{status: "healthy", ...}`

## 4. Test Login e Proxy

1. Login
2. Vai a Browser Interface
3. Inserisci URL: `ifconfig.me`
4. Clicca "Vai"
5. Dovrebbe mostrare IP della VPS Canada

---

# Troubleshooting

## Problema: CORS Error

**Sintomo**: Console mostra errore CORS

**Causa**: Backend non accetta richieste da frontend URL

**Soluzione**:

```bash
# Sulla VPS
nano /opt/vergen-browser/.env

# Verifica APP_URL sia corretto
APP_URL=https://vergen-browser-xxx.vercel.app

# Riavvia
pm2 restart vergen-api
```

Se persiste, aggiungi wildcard CORS temporaneamente:

```bash
nano /opt/vergen-browser/server/index.ts
```

Trova la riga `cors({...})` e cambia in:

```typescript
app.use(cors({
  origin: '*', // SOLO PER TEST!
  credentials: true,
}));
```

Rebuild e riavvia:
```bash
cd /opt/vergen-browser
npm run build:server
pm2 restart vergen-api
```

## Problema: 502 Bad Gateway

**Causa**: Backend non raggiungibile

**Soluzione**:

```bash
# Verifica backend attivo
pm2 status

# Verifica logs
pm2 logs vergen-api

# Riavvia
pm2 restart vergen-api
```

## Problema: API non risponde

**Causa**: Firewall blocca porta o backend down

**Soluzione**:

```bash
# Se usi IP:porta, assicurati porta sia aperta
sudo ufw allow 3000/tcp

# Verifica Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

# Deploy Automatico

## Auto-Deploy Backend

Ogni volta che pushes su GitHub:

```bash
# Sulla VPS, crea script update
nano /opt/vergen-browser/update.sh
```

Contenuto:

```bash
#!/bin/bash
cd /opt/vergen-browser
git pull
npm install
npm run build:server
pm2 restart vergen-api
echo "✅ Backend aggiornato!"
```

Rendi eseguibile:
```bash
chmod +x /opt/vergen-browser/update.sh
```

Per aggiornare:
```bash
/opt/vergen-browser/update.sh
```

## Auto-Deploy Frontend

Vercel/Netlify deployano automaticamente ogni push su `main`!

---

# Vantaggi di Questo Setup

✅ **Performance**
- Frontend su CDN globale (latenza minima)
- Backend vicino al proxy (latenza minima per proxy)

✅ **Sicurezza**
- HTTPS automatico su frontend
- SSL opzionale su backend
- CORS configurabile

✅ **Costi**
- Vercel/Netlify: GRATIS (fino a buon traffico)
- VPS: €5-10/mese
- Totale: **€5-10/mese**

✅ **Scalabilità**
- Frontend scala automaticamente
- Backend scala con VPS potenza

✅ **Deploy**
- Frontend: push su Git = deploy automatico
- Backend: script update semplice

---

# Checklist Finale

- [ ] ✅ VPS con backend + Squid funzionante
- [ ] ✅ Frontend deployato su Vercel/Netlify
- [ ] ✅ Variabili ambiente configurate
- [ ] ✅ CORS configurato correttamente
- [ ] ✅ Stripe webhook aggiornato
- [ ] ✅ Test registrazione funzionante
- [ ] ✅ Test login funzionante
- [ ] ✅ Test proxy funzionante
- [ ] ✅ Dominio configurato (opzionale)

---

# URL Finali

Annota qui i tuoi URL:

**Frontend**:
- URL Vercel/Netlify: ________________________________
- Dominio personalizzato: ________________________________

**Backend API**:
- URL API: ________________________________
- IP VPS: ________________________________

**Database**: https://app.supabase.com
**Stripe**: https://dashboard.stripe.com

---

**Setup completato! Frontend su CDN globale, Backend + Proxy in Canada! 🚀🇨🇦**
