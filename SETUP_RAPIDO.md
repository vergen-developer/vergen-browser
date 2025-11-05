# 🚀 Setup Rapido - I Tuoi Dati

**Frontend Bolt**: https://vergen-browser-proxy-7yzs.bolt.host/
**VPS IP**: 192.99.145.87

---

## ⚡ Setup in 3 Comandi (30 minuti)

### Step 1: Push su GitHub (5 min)

```bash
# Nella cartella del progetto
git init
git add .
git commit -m "Initial commit - VerGen Browser"
git remote add origin https://github.com/vergen-developer/vergen-browser.git
git push -u origin main
```

**Repository Pubblica o Privata?**

✅ **PUBBLICA** (CONSIGLIATO):
- Script funziona subito senza configurazione
- Clone diretto sulla VPS con `git clone`
- Il .env con chiavi sensibili NON viene committato (è nel .gitignore)

⚠️ **PRIVATA** (serve configurazione SSH):
- Codice non visibile pubblicamente
- Serve aggiungere SSH key della VPS su GitHub
- Vedi istruzioni sotto

**Se scegli repository PRIVATA, fai questo PRIMA dello script VPS:**

```bash
# 1. SSH nella VPS
ssh root@192.99.145.87

# 2. Genera SSH key
ssh-keygen -t ed25519 -C "vps@vergen"
# Premi Enter 3 volte (nessuna password)

# 3. Mostra la chiave pubblica
cat ~/.ssh/id_ed25519.pub
# Copia tutto l'output

# 4. Su GitHub:
# Settings > SSH and GPG keys > New SSH key
# Incolla la chiave e salva

# 5. Test connessione
ssh -T git@github.com
# Dovrebbe dire: "Hi vergen-developer!"
```

Poi quando lo script chiede "URL repository", usa:
```
git@github.com:vergen-developer/vergen-browser.git
```

---

### Step 2: Setup VPS Backend (25 min)

```bash
# Connetti alla VPS
ssh root@192.99.145.87

# Esegui script automatico
wget https://raw.githubusercontent.com/vergen-developer/vergen-browser/main/VPS_BACKEND_ONLY.sh
sudo bash VPS_BACKEND_ONLY.sh
```

**Lo script chiederà:**

1. **URL repository GitHub**:
   - Se PUBBLICA: `https://github.com/vergen-developer/vergen-browser.git`
   - Se PRIVATA: `git@github.com:vergen-developer/vergen-browser.git`
2. **Esporre porta 3000?**: Rispondi `y` (sì)
3. **Hai un dominio per API?**: Rispondi `n` (per ora usiamo IP)

**Output**:
- ✅ Squid Proxy installato e attivo
- ✅ Backend Node.js compilato
- ✅ PM2 avviato
- ✅ .env creato con `APP_URL=https://vergen-browser-proxy-7yzs.bolt.host`

---

### Step 3: Aggiorna .env su Bolt (1 min)

**Qui su Bolt.new, modifica il file `.env`:**

Cambia questa riga:
```env
VITE_API_URL=http://localhost:3000
```

In:
```env
VITE_API_URL=http://192.99.145.87:3000
```

**Salva** - Bolt ricaricherà automaticamente!

---

## ✅ Test Completo

### Test 1: Backend VPS Attivo

Sulla VPS:
```bash
curl http://localhost:3000/api/health
```

**Risposta attesa:**
```json
{"status":"healthy","timestamp":"2025-11-05..."}
```

### Test 2: Backend Raggiungibile da Internet

Dal tuo computer:
```bash
curl http://192.99.145.87:3000/api/health
```

Stessa risposta attesa.

### Test 3: Frontend Bolt Comunica con Backend

Su Bolt.new, apri Console (F12) e scrivi:

```javascript
fetch('http://192.99.145.87:3000/api/health')
  .then(r => r.json())
  .then(console.log)
```

Se vedi l'oggetto JSON = **PERFETTO!** ✅

### Test 4: Registrazione Utente

1. Su Bolt preview, clicca "Registrati"
2. Compila form
3. Registrazione dovrebbe funzionare
4. Se errore CORS, vedi fix sotto

---

## 🔧 Fix CORS (se necessario)

Se vedi errore CORS in console:

```
Access to fetch at 'http://192.99.145.87:3000/api/register'
from origin 'https://vergen-browser-proxy-7yzs.bolt.host'
has been blocked by CORS policy
```

**Fix sulla VPS:**

```bash
ssh root@192.99.145.87
nano /opt/vergen-browser/.env
```

Verifica che `APP_URL` sia corretto:
```env
APP_URL=https://vergen-browser-proxy-7yzs.bolt.host
```

Riavvia:
```bash
pm2 restart vergen-api
```

Se persiste, apri `server/index.ts` e cambia temporaneamente CORS:

```bash
nano /opt/vergen-browser/server/index.ts
```

Trova `app.use(cors({...}))` e cambia in:
```typescript
app.use(cors({
  origin: '*', // Temporaneo per test
  credentials: true,
}));
```

Ricompila e riavvia:
```bash
cd /opt/vergen-browser
npm run build:server
pm2 restart vergen-api
```

---

## 🎯 Configurazione Stripe

Sulla VPS:

```bash
ssh root@192.99.145.87
nano /opt/vergen-browser/.env
```

Sostituisci con chiavi reali:

```env
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**Come ottenerle:**

1. Vai su https://dashboard.stripe.com
2. **Prodotti** > Crea "Browser Proxy" €0,50/mese
3. **Developers > API Keys** > Copia chiavi
4. **Developers > Webhooks** > Aggiungi:
   - URL: `http://192.99.145.87:3000/api/webhooks/stripe`
   - Eventi: `customer.subscription.*`

Riavvia backend:
```bash
pm2 restart vergen-api
```

---

## 📋 Checklist Veloce

**VPS Backend**:
- [ ] Script eseguito
- [ ] PM2 status = online
- [ ] Porta 3000 aperta nel firewall
- [ ] API risponde su http://192.99.145.87:3000/api/health

**Frontend Bolt**:
- [ ] .env aggiornato con VITE_API_URL=http://192.99.145.87:3000
- [ ] Preview ricaricato
- [ ] Console senza errori

**Stripe**:
- [ ] Account creato
- [ ] Prodotto creato
- [ ] Chiavi copiate in .env VPS
- [ ] Webhook configurato

**Test**:
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Dashboard carica
- [ ] Browser proxy funziona

---

## 🆘 Troubleshooting

### Backend non risponde

```bash
ssh root@192.99.145.87
pm2 logs vergen-api
pm2 restart vergen-api
```

### Firewall blocca porta 3000

```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

### Squid non attivo

```bash
sudo systemctl status squid
sudo systemctl restart squid
```

---

## 🎓 Comandi Utili

```bash
# SSH VPS
ssh root@192.99.145.87

# Logs backend
pm2 logs vergen-api

# Restart backend
pm2 restart vergen-api

# Status
pm2 status

# Test API locale
curl http://localhost:3000/api/health

# Test Squid
curl -x http://127.0.0.1:3128 https://google.com

# Aggiorna codice
cd /opt/vergen-browser
git pull
npm run build:server
pm2 restart vergen-api
```

---

## 📊 URL Finali

**Frontend**: https://vergen-browser-proxy-7yzs.bolt.host/
**Backend API**: http://192.99.145.87:3000
**Database**: https://app.supabase.com (già configurato)
**Stripe**: https://dashboard.stripe.com

---

## 💡 Prossimi Passi (Opzionali)

### 1. Dominio per API (Consigliato)

Invece di IP, usa dominio tipo `api.vergen browser.com`:

1. Compra dominio
2. DNS record A: `api` → `192.99.145.87`
3. SSL con Let's Encrypt:
   ```bash
   ssh root@192.99.145.87
   sudo certbot --nginx -d api.tuo-dominio.com
   ```
4. Aggiorna .env Bolt:
   ```env
   VITE_API_URL=https://api.tuo-dominio.com
   ```

**Vantaggi:**
- ✅ HTTPS (sicuro)
- ✅ Nessun problema CORS
- ✅ URL professionale

### 2. Monitoraggio

Setup monitoring con UptimeRobot:
- URL: http://192.99.145.87:3000/api/health
- Check ogni 5 minuti

---

## 💰 Costi

- **Bolt.new**: GRATIS ✅
- **Supabase**: GRATIS ✅
- **VPS 192.99.145.87**: Già pagata
- **Stripe**: Solo commissioni transazioni

**Costo totale: €0/mese** (solo VPS già pagata)

---

## 🎉 FATTO!

**Tempo totale: 31 minuti**

1. Push GitHub (5 min)
2. Setup VPS (25 min)
3. Aggiorna Bolt (1 min)

**Dopo questi 3 step hai:**
- ✅ Frontend live su Bolt
- ✅ Backend + Proxy su VPS Canada
- ✅ Database Supabase
- ✅ Tutto configurato

**Manca solo**: Configurare Stripe (10 min)

---

**Inizia subito! 🚀🇨🇦**
