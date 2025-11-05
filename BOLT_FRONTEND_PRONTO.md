# 🎉 Frontend su Bolt.new - GIÀ PRONTO!

**Il frontend è già live su Bolt.new!** Devi solo configurare il backend sulla VPS.

---

## ✅ Cosa Funziona Già su Bolt.new

- ✅ **Frontend React completo** (già deployato)
- ✅ **Database Supabase** (già configurato nel .env)
- ✅ **HTTPS automatico** (dominio bolt.new)
- ✅ **URL pubblico** (condivisibile)
- ✅ **100% gratis** per sempre

---

## 🎯 Cosa Devi Fare (Solo Backend VPS)

### Step Unico: Setup VPS Backend (30 minuti)

```bash
# 1. Push progetto su GitHub (dal tuo computer locale)
cd /path/to/vergen-browser
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO_USERNAME/vergen-browser.git
git push -u origin main

# 2. Connetti alla VPS
ssh root@TUO_IP_VPS

# 3. Esegui script automatico
wget https://raw.githubusercontent.com/TUO_USERNAME/vergen-browser/main/VPS_BACKEND_ONLY.sh
sudo bash VPS_BACKEND_ONLY.sh
```

**Lo script installerà:**
- ✅ Squid Proxy (porta 3128)
- ✅ Node.js + Backend API (porta 3000)
- ✅ Nginx (opzionale per dominio)
- ✅ Firewall configurato

---

## 🔧 Configurazione Post-Setup

### 1. Ottieni URL API VPS

**Opzione A** - Con dominio (CONSIGLIATO):
```
https://api.tuo-dominio.com
```

**Opzione B** - Con IP:
```
http://TUO_IP_VPS:3000
```

### 2. Aggiorna .env su Bolt.new

**Nel tuo progetto su Bolt.new, modifica il file `.env`:**

```env
# Cambia questa riga con l'URL della tua VPS
VITE_API_URL=https://api.tuo-dominio.com

# Oppure se usi IP:
VITE_API_URL=http://TUO_IP_VPS:3000
```

**Salva il file** - Bolt.new ricaricherà automaticamente!

### 3. Aggiorna APP_URL sulla VPS

```bash
# SSH nella VPS
ssh root@TUO_IP_VPS

# Modifica .env backend
nano /opt/vergen-browser/.env
```

**Trova il tuo URL Bolt.new** (guarda barra indirizzi browser):
- Esempio: `https://bolt.new/~/abc123`
- Oppure il dominio pubblico assegnato

**Aggiorna questa riga:**
```env
APP_URL=https://tuo-url.bolt.new
```

**Salva e riavvia:**
```bash
pm2 restart vergen-api
```

### 4. Configura Stripe

```bash
# Sulla VPS
nano /opt/vergen-browser/.env
```

**Aggiungi chiavi Stripe reali:**
```env
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Riavvia:**
```bash
pm2 restart vergen-api
```

---

## 🎉 FATTO! Testa l'App

### Test 1: Apri Bolt.new Preview

Il frontend dovrebbe essere già visibile nel preview di Bolt!

### Test 2: Verifica Connessione Backend

Apri Console (F12) nel preview e scrivi:

```javascript
fetch(import.meta.env.VITE_API_URL + '/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Risposta attesa:**
```json
{"status":"healthy","timestamp":"2025-11-05T..."}
```

### Test 3: Registrazione Completa

1. Click "Registrati"
2. Compila form
3. Controlla console per errori
4. Se funziona = **PERFETTO!** ✅

---

## 🔧 Fix Problemi Comuni

### Problema: CORS Error

**Sintomo**: Console mostra "CORS policy" error

**Causa**: APP_URL nel backend non corrisponde al tuo URL Bolt

**Fix**:
```bash
# Sulla VPS
nano /opt/vergen-browser/.env
# Verifica APP_URL sia corretto
APP_URL=https://tuo-url.bolt.new
pm2 restart vergen-api
```

### Problema: "Network Error" o "Failed to fetch"

**Causa 1**: VITE_API_URL non configurato

**Fix**: Verifica `.env` su Bolt abbia:
```env
VITE_API_URL=https://api.tuo-dominio.com
```

**Causa 2**: Backend non attivo

**Fix sulla VPS**:
```bash
pm2 status
pm2 logs vergen-api
pm2 restart vergen-api
```

### Problema: Mixed Content (HTTP/HTTPS)

**Sintomo**: Bolt (HTTPS) non può chiamare backend (HTTP)

**Causa**: Backend usa HTTP, Bolt usa HTTPS

**Fix**: Usa dominio con SSL per backend, oppure:

**Temporaneo** - CORS wildcard sulla VPS:
```bash
nano /opt/vergen-browser/server/index.ts
```

Cambia:
```typescript
app.use(cors({
  origin: '*', // Solo per test!
  credentials: true,
}));
```

```bash
npm run build:server
pm2 restart vergen-api
```

**Permanente** - Setup SSL:
```bash
sudo certbot --nginx -d api.tuo-dominio.com
```

---

## 📊 Architettura Finale

```
User Browser
    ↓ HTTPS
Bolt.new Frontend
    ↓ HTTPS (se API ha dominio) o HTTP
TUA VPS Canada
    ├── Backend API :3000
    └── Squid Proxy :3128
        ↓
    Internet 🇨🇦

Database: Supabase ☁️
Payments: Stripe ☁️
```

---

## 💰 Costi Totali

- **Bolt.new**: GRATIS ✅
- **Supabase**: GRATIS ✅
- **VPS Canada**: €5-10/mese
- **Dominio** (opzionale): €1/mese

**Totale: €5-10/mese** (solo VPS!)

---

## 🚀 Workflow di Sviluppo

### Frontend (Bolt.new)

**Modifiche live!** Ogni modifica su Bolt è visibile immediatamente.

1. Modifica file su Bolt
2. Bolt salva automaticamente
3. Preview si aggiorna automaticamente
4. Nessun build manuale necessario

### Backend (VPS)

Quando modifichi codice backend:

```bash
# Sul tuo computer
git push

# Sulla VPS
ssh root@TUO_IP_VPS
cd /opt/vergen-browser
git pull
npm run build:server
pm2 restart vergen-api
```

---

## ✅ Checklist Veloce

**Frontend Bolt.new** (già fatto ✅):
- [x] React app completo
- [x] Supabase configurato
- [x] HTTPS attivo
- [x] URL pubblico

**Da fare**:
- [ ] Setup VPS backend (30 min)
- [ ] Aggiorna VITE_API_URL su Bolt (1 min)
- [ ] Aggiorna APP_URL sulla VPS (1 min)
- [ ] Configura Stripe (10 min)
- [ ] Test completo (5 min)

**Tempo totale: 47 minuti**

---

## 📝 URL da Annotare

**Frontend Bolt.new**: ________________________________
(Guarda barra indirizzi browser)

**Backend VPS API**: ________________________________
(URL configurato durante setup VPS)

**IP VPS**: ________________________________

**Supabase**: https://app.supabase.com

**Stripe**: https://dashboard.stripe.com

---

## 🎓 Comandi Utili VPS

```bash
# Logs backend
pm2 logs vergen-api

# Restart backend
pm2 restart vergen-api

# Status
pm2 status

# Test API locale
curl http://localhost:3000/api/health

# Aggiorna backend
cd /opt/vergen-browser
git pull && npm run build:server && pm2 restart vergen-api
```

---

## 💡 Tips Pro

### Tip 1: Usa Dominio per API

Evita problemi CORS e permette HTTPS.

**Setup veloce con Cloudflare** (gratis):
1. Aggiungi dominio su Cloudflare
2. DNS record A: `api` → `IP_VPS`
3. SSL automatico Cloudflare

### Tip 2: Monitor Backend

Tieni aperto terminale con logs:
```bash
pm2 logs vergen-api --lines 100
```

### Tip 3: Test Locale Prima

Prima di modificare su Bolt, testa localmente:
```bash
npm run dev:full
```

### Tip 4: Condividi Facilmente

URL Bolt.new è pubblico! Condividilo per demo:
- Con investitori
- Con beta tester
- Con amici

---

## 🎯 Prossimi Passi

**Oggi** (30 min):
- [ ] Setup VPS backend
- [ ] Aggiorna .env
- [ ] Test completo

**Questa settimana**:
- [ ] Dominio API (opzionale)
- [ ] SSL configurato
- [ ] Stripe testato

**Prossimo mese**:
- [ ] Marketing
- [ ] Primi utenti paganti
- [ ] Iterazioni basate su feedback

---

## 🎉 Vantaggi Configurazione Bolt.new

✅ **Zero configurazione frontend** (già fatto!)
✅ **Edit e vedi subito** (live reload)
✅ **HTTPS automatico** (sicuro)
✅ **URL condivisibile** (per demo)
✅ **Gratis per sempre**
✅ **Performance ottimali** (CDN globale)

---

**Configurazione perfetta! Frontend pronto, manca solo backend VPS! 🚀🇨🇦**

**Inizia con:** [SETUP_BOLT_FRONTEND.md](SETUP_BOLT_FRONTEND.md)

**Script VPS:** `VPS_BACKEND_ONLY.sh`

**Tempo: 30 minuti al backend | Costi: €5-10/mese**
