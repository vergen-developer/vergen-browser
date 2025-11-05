# 🚀 Setup Ibrido - Guida Rapida

**Backend + Proxy sulla VPS** | **Frontend su Vercel/Netlify**

---

## ⚡ In 3 Passi (60 minuti totali)

### ✅ Passo 1: VPS Backend (30 min)

```bash
# 1. SSH nella VPS
ssh root@TUO_IP_VPS

# 2. Download script
wget https://github.com/vergen-developer/vergen-browser/blob/aaa9df9bf79901071c972656eb55812db3074c2b/VPS_BACKEND_ONLY.sh

# 3. Esegui
sudo bash VPS_BACKEND_ONLY.sh
```

**Lo script chiederà:**
- URL repository GitHub
- Se hai dominio per API
- Se vuoi esporre porta 3000

**Output**: Backend + Squid installati e funzionanti

---

### ✅ Passo 2: Vercel/Netlify Frontend (20 min)

#### Su Vercel:

1. Vai su https://vercel.com
2. **New Project** > Importa da GitHub
3. Seleziona repository `vergen-browser`
4. **Framework**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU
   VITE_API_URL=https://api.tuo-dominio.com
   ```

   **O se usi IP VPS senza dominio:**
   ```
   VITE_API_URL=http://TUO_IP_VPS:3000
   ```

8. Click **Deploy**
9. Aspetta 2-3 minuti
10. **URL Frontend**: `https://vergen-browser-xxx.vercel.app`

#### Su Netlify:

Stessi passi, solo su https://netlify.com

---

### ✅ Passo 3: Configurazione Finale (10 min)

```bash
# 1. SSH nella VPS
ssh root@TUO_IP_VPS

# 2. Modifica .env
nano /opt/vergen-browser/.env
```

**Aggiorna queste righe:**

```env
# Inserisci chiavi Stripe reali
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Inserisci URL frontend Vercel/Netlify
APP_URL=https://vergen-browser-xxx.vercel.app
```

Salva (CTRL+X, Y, Enter)

```bash
# 3. Riavvia backend
pm2 restart vergen-api

# 4. Verifica funzionante
pm2 logs vergen-api
```

---

## 🎯 Verifica Tutto Funzioni

### Test 1: Backend API

```bash
curl https://api.tuo-dominio.com/api/health
# Oppure
curl http://TUO_IP_VPS:3000/api/health

# Risposta attesa:
# {"status":"healthy","timestamp":"..."}
```

### Test 2: Frontend

Apri browser: `https://vergen-browser-xxx.vercel.app`

Dovresti vedere homepage VerGen Browser

### Test 3: Registrazione

1. Click "Registrati"
2. Compila form
3. Se funziona = tutto OK! ✅
4. Se errore CORS = vedi sotto

---

## 🔧 Fix CORS (se necessario)

Se vedi errore CORS in console browser:

```bash
# Sulla VPS
nano /opt/vergen-browser/.env

# Verifica APP_URL sia corretto
APP_URL=https://vergen-browser-xxx.vercel.app

pm2 restart vergen-api
```

Se ancora non funziona, controlla `server/index.ts` abbia:

```typescript
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true,
}));
```

---

## 📋 Checklist Completa

### VPS Backend
- [ ] Script eseguito senza errori
- [ ] Squid attivo: `sudo systemctl status squid`
- [ ] Backend attivo: `pm2 status`
- [ ] API risponde: `curl http://localhost:3000/api/health`
- [ ] .env configurato con Stripe
- [ ] APP_URL aggiornato con URL Vercel

### Frontend Vercel/Netlify
- [ ] Progetto importato da GitHub
- [ ] Variabili ambiente aggiunte
- [ ] Build completato senza errori
- [ ] URL frontend funzionante
- [ ] Homepage carica correttamente

### Stripe
- [ ] Account creato
- [ ] Prodotto €0,50/mese creato
- [ ] Chiavi copiate in .env VPS
- [ ] Webhook configurato con URL API

### Test Finale
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Dashboard visibile
- [ ] Browser interface apre
- [ ] Proxy mostra IP VPS Canada

---

## 🌐 URL da Annotare

**Frontend**:
- Vercel/Netlify: ________________________________

**Backend API**:
- URL: ________________________________
- IP VPS: ________________________________

**Database**: https://app.supabase.com
**Stripe**: https://dashboard.stripe.com

---

## 💰 Costi Mensili

- **VPS Canada**: €5-10/mese
- **Vercel**: GRATIS (fino 100GB bandwidth)
- **Netlify**: GRATIS (fino 100GB bandwidth)
- **Supabase**: GRATIS
- **Stripe**: Solo commissioni

**Totale: €5-10/mese** 🎉

---

## 🚀 Deploy Automatico

### Frontend (Vercel/Netlify)
Ogni push su `main` = deploy automatico! ✅

### Backend (VPS)

Script aggiornamento:

```bash
# Sulla VPS
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

Per aggiornare backend:
```bash
/opt/vergen-browser/update.sh
```

---

## 🆘 Troubleshooting Veloce

### Backend non risponde
```bash
pm2 logs vergen-api
pm2 restart vergen-api
```

### Frontend errore 404 su /api
- Verifica VITE_API_URL sia corretto in Vercel/Netlify
- Redeploy frontend

### CORS Error
```bash
# VPS
nano /opt/vergen-browser/.env
# Verifica APP_URL
pm2 restart vergen-api
```

### Stripe webhook non funziona
- Verifica URL webhook: `https://api.tuo-dominio.com/api/webhooks/stripe`
- Deve essere HTTPS in produzione!

---

## 🎓 Comandi Utili

```bash
# VPS - Backend
pm2 logs vergen-api      # Logs real-time
pm2 restart vergen-api   # Riavvia
pm2 status               # Status
pm2 stop vergen-api      # Stop

# VPS - Squid
sudo systemctl status squid
sudo tail -f /var/log/squid/access.log

# VPS - Nginx (se configurato)
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# Test API
curl https://api.tuo-dominio.com/api/health

# Aggiorna backend
/opt/vergen-browser/update.sh
```

---

## ✅ Setup Completato!

**Frontend**: CDN globale Vercel/Netlify (velocissimo)
**Backend**: VPS Canada (vicino al proxy)
**Proxy**: Squid sulla VPS (IP canadese 🇨🇦)

**Costi**: €5-10/mese
**Deploy**: Automatico per frontend, script per backend
**Performance**: Ottimale per utenti globali

---

**Congratulazioni! Applicazione online! 🚀🇨🇦**

Per supporto dettagliato: [HYBRID_SETUP_GUIDE.md](HYBRID_SETUP_GUIDE.md)
