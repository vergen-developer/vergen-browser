# 🚀 Setup con Bolt.new Frontend

**Configurazione Ottimale**: Backend + Proxy sulla VPS, **Frontend su Bolt.new**

---

## ✅ Vantaggi di Bolt.new per Frontend

- ✅ **Già qui!** Non serve configurare nulla
- ✅ **HTTPS automatico** con dominio bolt.new
- ✅ **Deploy istantaneo** (già fatto!)
- ✅ **Modifiche live** (edit e vedi subito)
- ✅ **100% GRATIS** per sempre
- ✅ **URL pulito** (es: vergen-browser-abc123.bolt.new)

---

## 🎯 Setup in 2 Passi (30 minuti)

### ✅ Passo 1: Setup VPS Backend (25 min)

```bash
# 1. Push su GitHub (dal tuo computer)
cd /path/to/vergen-browser
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO_USERNAME/vergen-browser.git
git push -u origin main

# 2. SSH nella VPS
ssh root@TUO_IP_VPS

# 3. Esegui script automatico
wget https://raw.githubusercontent.com/TUO_USERNAME/vergen-browser/main/VPS_BACKEND_ONLY.sh
sudo bash VPS_BACKEND_ONLY.sh
```

**Lo script chiederà:**
- URL repository GitHub
- Se hai dominio per API (raccomandato)
- Se vuoi SSL

**Output**: Backend + Squid installati sulla VPS ✅

---

### ✅ Passo 2: Configura Frontend su Bolt.new (5 min)

**Il frontend è già su Bolt.new!** Devi solo aggiornare la configurazione.

#### 2.1: Aggiorna file .env locale (questo progetto)

Crea/modifica `.env` nella root del progetto Bolt:

```env
# Database Supabase (già configurato)
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU

# API Backend sulla tua VPS
VITE_API_URL=https://api.tuo-dominio.com
```

**O se usi IP VPS senza dominio:**
```env
VITE_API_URL=http://TUO_IP_VPS:3000
```

**⚠️ IMPORTANTE per IP senza dominio:**

Se usi `http://IP:3000`, avrai problemi CORS perché Bolt usa HTTPS.

**Soluzione 1** (CONSIGLIATA): Usa un dominio con SSL per l'API
**Soluzione 2**: Usa Cloudflare Tunnel (gratis)
**Soluzione 3**: Backend accetta qualsiasi origin (solo per test)

#### 2.2: Aggiorna src/lib/api.ts

Il file già usa `import.meta.env.VITE_API_URL`, quindi funzionerà automaticamente!

Verifica che `src/lib/api.ts` abbia:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

✅ È già corretto!

---

### ✅ Passo 3: Aggiorna Backend con URL Bolt (2 min)

```bash
# SSH nella VPS
ssh root@TUO_IP_VPS

# Modifica .env
nano /opt/vergen-browser/.env
```

**Aggiorna questa riga con URL Bolt.new:**

```env
# URL Frontend Bolt.new
APP_URL=https://vergen-browser-abc123.bolt.new
```

**Come trovare il tuo URL Bolt.new?**
Guarda la barra indirizzi del browser mentre sei su Bolt! È qualcosa come:
- `https://bolt.new/~/abc123`
- Oppure il dominio pubblico che Bolt ti assegna

```bash
# Salva e riavvia backend
pm2 restart vergen-api
```

---

### ✅ Passo 4: Configura Stripe (10 min)

```bash
# Sulla VPS
nano /opt/vergen-browser/.env
```

**Aggiungi chiavi Stripe reali:**

```env
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**Come ottenere chiavi Stripe:**

1. Vai su https://dashboard.stripe.com
2. **Prodotti** > Crea prodotto "Browser Proxy" €0,50/mese
3. Copia `PRICE_ID`
4. **Developers > API Keys** > Copia `PUBLISHABLE_KEY` e `SECRET_KEY`
5. **Developers > Webhooks** > Aggiungi endpoint:
   - URL: `https://api.tuo-dominio.com/api/webhooks/stripe`
   - Eventi: `customer.subscription.*`
   - Copia `SIGNING_SECRET`

```bash
# Riavvia
pm2 restart vergen-api
```

---

## 🎉 FATTO! Testa l'App

### Test 1: Frontend su Bolt

Il frontend è già live su Bolt.new! Apri il preview.

### Test 2: Connessione Backend

Apri Console del browser (F12) su Bolt e scrivi:

```javascript
fetch(import.meta.env.VITE_API_URL + '/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Risposta attesa:**
```json
{"status":"healthy","timestamp":"..."}
```

### Test 3: Registrazione

1. Click "Registrati"
2. Compila form
3. Se funziona = tutto OK! ✅
4. Se errore CORS = vedi sotto

---

## 🔧 Fix CORS (se necessario)

### Problema: "CORS policy" error in console

**Causa**: Backend non accetta richieste da Bolt.new

**Soluzione 1** (Veloce):

```bash
# Sulla VPS
nano /opt/vergen-browser/.env

# Verifica APP_URL sia corretto con URL Bolt
APP_URL=https://tuo-url.bolt.new

pm2 restart vergen-api
```

**Soluzione 2** (Se usi IP senza SSL):

Il problema è mixing HTTPS (Bolt) con HTTP (tuo backend).

**Fix temporaneo**: CORS wildcard

```bash
# Sulla VPS
nano /opt/vergen-browser/server/index.ts
```

Trova `app.use(cors({...}))` e cambia in:

```typescript
app.use(cors({
  origin: '*', // ⚠️ SOLO PER TEST
  credentials: true,
}));
```

```bash
cd /opt/vergen-browser
npm run build:server
pm2 restart vergen-api
```

**Fix permanente**: Usa dominio con SSL per API (consigliato)

---

## 🌐 Setup Dominio API (Consigliato)

### Perché serve un dominio per API?

- ✅ Evita problemi CORS
- ✅ HTTPS funzionante
- ✅ URL professionale
- ✅ Webhook Stripe funziona

### Come configurare (10 min):

1. **Acquista dominio** (€10/anno)
   - Namecheap, Cloudflare, etc.

2. **Configura DNS**:
   ```
   Tipo: A
   Nome: api
   Valore: IP_TUA_VPS
   TTL: Auto
   ```

3. **SSL sulla VPS**:
   ```bash
   ssh root@TUO_IP_VPS
   sudo certbot --nginx -d api.tuo-dominio.com
   ```

4. **Aggiorna .env Bolt**:
   ```env
   VITE_API_URL=https://api.tuo-dominio.com
   ```

5. **Aggiorna .env VPS**:
   ```bash
   nano /opt/vergen-browser/.env
   APP_URL=https://tuo-url.bolt.new
   pm2 restart vergen-api
   ```

**FATTO! Ora tutto usa HTTPS! 🔒**

---

## 📊 Architettura Finale

```
User Browser
    ↓ HTTPS
Bolt.new (Frontend React)
    ↓ HTTPS
api.tuo-dominio.com (o IP:3000)
    ↓
TUA VPS Canada
    ├── Nginx :80/443
    ├── Backend Node.js :3000
    └── Squid Proxy :3128
        ↓
    Internet 🇨🇦

Database: Supabase ☁️
Payments: Stripe ☁️
```

---

## 💰 Costi

- **Bolt.new Frontend**: GRATIS ✅
- **Supabase**: GRATIS ✅
- **VPS Canada**: €5-10/mese
- **Dominio** (opzionale): €10/anno (~€1/mese)
- **Stripe**: Solo commissioni

**Totale minimo: €5/mese**
**Con dominio: €6/mese**

---

## 🚀 Deploy e Aggiornamenti

### Frontend (Bolt.new)

**Modifiche live!** Ogni volta che editi su Bolt, vedi il risultato immediatamente.

Per salvare modifiche:
- Bolt salva automaticamente
- Nessun build/deploy manuale necessario

### Backend (VPS)

Quando aggiorni codice backend:

```bash
# Sul tuo computer
git add .
git commit -m "Update backend"
git push

# Sulla VPS
ssh root@TUO_IP_VPS
cd /opt/vergen-browser
git pull
npm run build:server
pm2 restart vergen-api
```

**O usa script automatico:**

```bash
# Sulla VPS, crea script
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

```bash
chmod +x /opt/vergen-browser/update.sh

# Per aggiornare:
/opt/vergen-browser/update.sh
```

---

## ✅ Checklist Completa

### VPS Backend
- [ ] Script VPS_BACKEND_ONLY.sh eseguito
- [ ] Squid attivo: `sudo systemctl status squid`
- [ ] Backend attivo: `pm2 status`
- [ ] API risponde: `curl http://localhost:3000/api/health`
- [ ] .env configurato con Stripe
- [ ] APP_URL aggiornato con URL Bolt

### Frontend Bolt.new
- [ ] .env locale aggiornato con VITE_API_URL
- [ ] Frontend carica correttamente
- [ ] Console browser senza errori CORS
- [ ] URL Bolt.new annotato

### Stripe
- [ ] Account creato
- [ ] Prodotto €0,50/mese creato
- [ ] Chiavi copiate in .env VPS
- [ ] Webhook configurato

### Test Finale
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Dashboard visibile
- [ ] Browser interface apre
- [ ] Proxy mostra IP Canada

---

## 🎯 URL da Annotare

**Frontend Bolt.new**: ________________________________

**Backend API**: ________________________________

**IP VPS**: ________________________________

**Database Supabase**: https://app.supabase.com

**Stripe Dashboard**: https://dashboard.stripe.com

---

## 🆘 Troubleshooting

### Frontend non comunica con backend

**Verifica .env locale:**
```bash
cat .env
# Deve avere VITE_API_URL corretto
```

**Verifica in browser console:**
```javascript
console.log(import.meta.env.VITE_API_URL)
```

### CORS Error

Vedi sezione "Fix CORS" sopra.

### Backend non risponde

```bash
# Sulla VPS
pm2 logs vergen-api
pm2 restart vergen-api
```

### Proxy non funziona

```bash
# Sulla VPS
sudo systemctl status squid
curl -x http://127.0.0.1:3128 https://google.com
```

---

## 💡 Tips

### Tip 1: Usa Dominio per API

Evita 90% dei problemi CORS e permette HTTPS completo.

### Tip 2: Test Locale Prima

Prima di modificare su Bolt, testa in locale:
```bash
npm run dev:full
```

### Tip 3: Monitora Logs

Tieni aperto terminale con logs:
```bash
pm2 logs vergen-api --lines 50
```

### Tip 4: Backup .env

Salva .env VPS sul tuo computer:
```bash
scp root@TUO_IP:/opt/vergen-browser/.env ./backup.env
```

---

## 🎉 Vantaggi di Bolt.new

✅ **Zero configurazione** frontend
✅ **Edit live** e vedi risultati subito
✅ **HTTPS automatico** con dominio bolt.new
✅ **Condivisione facile** con URL pubblico
✅ **100% gratis** per sempre
✅ **Già pronto** (sei già qui!)

---

## 📈 Prossimi Passi

1. **Oggi**: Setup VPS backend
2. **Domani**: Test completo e fix bugs
3. **Questa settimana**: Dominio API + SSL
4. **Prossimo mese**: Marketing e utenti!

---

## 🎓 Comandi Rapidi

```bash
# VPS - Backend
pm2 logs vergen-api      # Logs
pm2 restart vergen-api   # Riavvia
pm2 status               # Status

# VPS - Squid
sudo systemctl status squid
sudo tail -f /var/log/squid/access.log

# VPS - Test API
curl http://localhost:3000/api/health

# VPS - Aggiorna backend
cd /opt/vergen-browser && git pull && npm run build:server && pm2 restart vergen-api
```

---

**Configurazione perfetta: Bolt.new (frontend) + VPS Canada (backend+proxy)! 🚀🇨🇦**

**Tempo setup totale: 30 minuti**
**Costi: €5-6/mese**
**Performance: Ottimali**

**Inizia subito con lo script VPS!**
