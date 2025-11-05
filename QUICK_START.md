# VerGen Browser - Quick Start

Guida rapida per avviare VerGen Browser in pochi minuti.

---

## In 5 Minuti

### 1. Installa Dipendenze

```bash
npm install
```

### 2. Configura .env

```bash
cp .env.example .env
# Edita .env con i tuoi valori
```

Valori minimi richiesti:
- `JWT_SECRET` - Stringa random 32+ caratteri
- `STRIPE_*` - Chiavi da Stripe Dashboard
- `PROXY_VPS_HOST` - IP del tuo VPS proxy

### 3. Avvia Applicazione

```bash
npm run dev:full
```

Apri http://localhost:5173

---

## Setup VPS Proxy (1 Comando)

Sul tuo VPS Ubuntu in Canada:

```bash
wget https://raw.githubusercontent.com/your-repo/vergen-browser/main/VPS_PROXY_SETUP.sh
sudo bash VPS_PROXY_SETUP.sh
```

Inserisci IP del backend quando richiesto.

---

## Test Rapido

### 1. Registra Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

Salva il token ricevuto.

### 3. Test Proxy

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://ifconfig.me"}'
```

Dovresti vedere l'IP del VPS Canada!

---

## Stripe Setup Veloce

1. Crea account su https://dashboard.stripe.com
2. Prodotti > + Nuovo > €0,50/mese ricorrente
3. Copia `price_id`
4. Developers > API Keys > Copia chiavi
5. Developers > Webhooks > Aggiungi endpoint:
   - URL: `https://your-api.com/api/webhooks/stripe`
   - Eventi: `customer.subscription.*`
   - Copia webhook secret

---

## Deploy Rapido

### Frontend (Netlify)

```bash
npm run build
# Carica dist/ su Netlify
```

Variabili ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

### Backend (Railway)

1. Connetti GitHub repo su railway.app
2. Aggiungi tutte le variabili .env
3. Deploy automatico

---

## Comandi Utili

```bash
# Sviluppo completo
npm run dev:full

# Solo frontend
npm run dev

# Solo backend
npm run dev:server

# Build produzione
npm run build
npm run build:server

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Verifica Setup

- [ ] Database Supabase funzionante
- [ ] Stripe configurato
- [ ] VPS proxy attivo: `curl -x http://VPS_IP:3128 https://google.com`
- [ ] Backend risponde: `curl http://localhost:3000/api/health`
- [ ] Frontend visibile: http://localhost:5173
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Proxy navigation funziona

---

## Prossimi Passi

1. Leggi [SETUP_GUIDE.md](SETUP_GUIDE.md) per setup completo
2. Leggi [README.md](README.md) per documentazione API
3. Configura Stripe webhook per produzione
4. Deploy su Railway + Netlify
5. Testa con utenti reali

---

## Supporto

- **Documentazione completa**: [README.md](README.md)
- **Setup dettagliato**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Script VPS**: [VPS_PROXY_SETUP.sh](VPS_PROXY_SETUP.sh)

---

**Buon lavoro! 🚀🇨🇦**
