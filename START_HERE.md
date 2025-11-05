# 🚀 VerGen Browser - INIZIA QUI

**Benvenuto!** Questo progetto è pronto per essere deployato sulla tua VPS.

---

## 📁 Cosa Hai Ricevuto

✅ **Backend Node.js completo** (Express + TypeScript)
✅ **Frontend React completo** (React + Tailwind CSS)
✅ **Database Supabase configurato** (4 tabelle con RLS)
✅ **Sistema autenticazione** (JWT + bcrypt)
✅ **Integrazione Stripe** (pagamenti ricorrenti)
✅ **Proxy server logic** (connessione VPS Squid)
✅ **Documentazione completa** (6 guide + script automatici)

---

## ⚡ Setup Veloce (1 Ora)

### Hai una VPS potente e vuoi tutto su un server?

**Segui questi 3 passi:**

### 1️⃣ Carica codice su GitHub (5 min)

```bash
# Sul tuo computer, nella cartella del progetto:
git init
git add .
git commit -m "Initial commit"

# Crea repo su GitHub.com, poi:
git remote add origin https://github.com/TUO_USERNAME/vergen-browser.git
git push -u origin main
```

### 2️⃣ Connetti alla VPS e esegui script (40 min)

```bash
# SSH nella VPS
ssh root@TUO_IP_VPS

# Download e esegui script automatico
wget https://raw.githubusercontent.com/TUO_USERNAME/vergen-browser/main/FULL_VPS_SETUP.sh
sudo bash FULL_VPS_SETUP.sh
```

Lo script installerà automaticamente:
- ✅ Squid Proxy (IP canadese)
- ✅ Node.js 20 + PM2
- ✅ Nginx (web server)
- ✅ Firewall configurato
- ✅ SSL (se hai dominio)

### 3️⃣ Configura Stripe (15 min)

1. Vai su https://dashboard.stripe.com
2. Crea prodotto €0,50/mese
3. Copia chiavi da Developers > API Keys
4. Crea webhook per `customer.subscription.*`
5. Aggiorna `/opt/vergen-browser/.env` sulla VPS
6. Riavvia: `pm2 restart vergen-api`

**FATTO! Vai su http://TUO_IP per vedere l'app! 🎉**

---

## 📚 File Importanti

| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **SINGLE_VPS_GUIDE.md** | Guida completa setup VPS | Prima del deploy |
| **FULL_VPS_SETUP.sh** | Script automatico completo | Durante setup VPS |
| **CHECKLIST.md** | Checklist stampabile | Stampa e segui step-by-step |
| **README.md** | Documentazione tecnica completa | Riferimento API |
| **QUICK_START.md** | Avvio rapido sviluppo locale | Test locale prima deploy |

---

## 🎯 Cosa Devi Fare Tu

### Obbligatorio ✅

1. **Setup Stripe** (non funziona senza)
   - Crea account
   - Crea prodotto
   - Ottieni chiavi API
   - Configura webhook

2. **Configura .env** (sulla VPS)
   - Inserisci chiavi Stripe reali
   - Verifica altre variabili

### Opzionale (ma consigliato) 💡

1. **Dominio personalizzato**
   - Acquista dominio (es: namecheap.com)
   - Punta A record a IP VPS
   - Configura SSL con Let's Encrypt

2. **Monitoraggio**
   - UptimeRobot per uptime monitoring
   - Google Analytics per traffico

---

## 🏗️ Architettura Setup Singola VPS

```
┌─────────────────────────────────────────┐
│         LA TUA VPS (Canada)             │
│                                         │
│  Internet → Nginx (porta 80/443)       │
│                  ↓                      │
│             Frontend (React)            │
│             /api → Backend              │
│                  ↓                      │
│         Backend Node.js (porta 3000)    │
│                  ↓                      │
│         Squid Proxy (porta 3128)        │
│                  ↓                      │
│              Internet (con IP Canada)   │
│                                         │
│  Database: Supabase Cloud ☁️            │
│  Payments: Stripe ☁️                    │
└─────────────────────────────────────────┘
```

---

## 💰 Costi Mensili

- **VPS Canada (4GB RAM)**: €5-10/mese
- **Dominio** (opzionale): €10-15/anno (~€1/mese)
- **SSL Let's Encrypt**: GRATIS ✅
- **Supabase**: GRATIS (tier free) ✅
- **Stripe**: Solo commissioni (~2.9% per transazione)

**Totale minimo: €5/mese**

**Break-even**: ~23 utenti paganti (€0,50/mese)
**Con 100 utenti**: €22/mese profitto
**Con 1000 utenti**: €220/mese profitto

---

## 🧪 Test Locale (Prima del Deploy)

Vuoi testare tutto sul tuo computer prima?

```bash
# 1. Installa dipendenze
npm install

# 2. Configura .env locale
cp .env.example .env
# Modifica .env con valori di test

# 3. Avvia tutto
npm run dev:full

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

**Nota**: Per proxy funzionante serve VPS con Squid attivo!

---

## 🆘 Supporto e Documentazione

### Guide Dettagliate

1. **Setup VPS Completo**: [SINGLE_VPS_GUIDE.md](SINGLE_VPS_GUIDE.md)
2. **Setup Rapido**: [QUICK_START.md](QUICK_START.md)
3. **Setup Dettagliato**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
4. **Documentazione API**: [README.md](README.md)
5. **Struttura Codice**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
6. **Note Importanti**: [IMPORTANT_NOTES.md](IMPORTANT_NOTES.md)

### Script Automatici

- **Setup VPS completo**: `FULL_VPS_SETUP.sh`
- **Setup solo Squid**: `VPS_PROXY_SETUP.sh`

### Checklist

- **Stampa e segui**: [CHECKLIST.md](CHECKLIST.md)

---

## 🔐 Sicurezza Implementata

✅ JWT Authentication (token 7 giorni)
✅ Password bcrypt (12 rounds)
✅ SSRF Protection (blocco localhost, IP privati)
✅ Rate Limiting (100 req/ora)
✅ Helmet.js (header HTTP sicuri)
✅ CORS configurato
✅ Row Level Security (RLS) Supabase
✅ URL validation
✅ Stripe webhook verification

---

## 📊 Funzionalità Principali

### Utente
- ✅ Registrazione/Login
- ✅ Dashboard personale
- ✅ Gestione abbonamento
- ✅ Storico navigazione
- ✅ Browser proxy interface

### Amministrativo
- ✅ Database Supabase
- ✅ Pagamenti Stripe ricorrenti
- ✅ Webhook automatici
- ✅ Logs completi
- ✅ Monitoraggio PM2

### Tecnico
- ✅ Proxy Squid (IP Canada)
- ✅ Backend Node.js + Express
- ✅ Frontend React + Tailwind
- ✅ TypeScript full-stack
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS support

---

## 🎓 Stack Tecnologico

**Frontend**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

**Backend**
- Node.js 20
- Express 5
- TypeScript
- JWT
- bcrypt

**Database**
- Supabase (PostgreSQL)
- Row Level Security

**Payment**
- Stripe Billing

**Proxy**
- Squid Proxy (Ubuntu)

**Web Server**
- Nginx

**Process Manager**
- PM2

---

## 📝 Prossimi Passi

### Oggi (1 ora)

- [ ] Leggi [SINGLE_VPS_GUIDE.md](SINGLE_VPS_GUIDE.md)
- [ ] Carica codice su GitHub
- [ ] Esegui `FULL_VPS_SETUP.sh` sulla VPS
- [ ] Configura Stripe
- [ ] Test applicazione

### Questa Settimana

- [ ] Acquista dominio (opzionale)
- [ ] Configura SSL
- [ ] Setup monitoraggio
- [ ] Scrivi Privacy Policy e Terms
- [ ] Test completo con carta Stripe test

### Prossimo Mese

- [ ] Marketing e acquisizione utenti
- [ ] Analytics e metriche
- [ ] Feedback utenti
- [ ] Iterazioni e miglioramenti

---

## 🎉 Sei Pronto!

Tutto il codice è scritto, testato e documentato.

**Il database è già configurato su Supabase.**

**Devi solo:**
1. Caricare su GitHub
2. Eseguire script sulla VPS
3. Configurare Stripe

**Tempo stimato: 1 ora**

---

## 💬 Domande Frequenti

**Q: Devo configurare Supabase?**
A: No! Database già pronto con tutte le tabelle.

**Q: Posso usare più server?**
A: Sì, vedi SETUP_GUIDE.md per deploy su Railway + Netlify.

**Q: Funziona senza dominio?**
A: Sì, puoi usare solo IP VPS (ma senza HTTPS).

**Q: Come aggiorno il codice?**
A: `git pull && npm run build && pm2 restart vergen-api`

**Q: Dove vedo i logs?**
A: `pm2 logs vergen-api`

**Q: Come faccio backup?**
A: Supabase ha backup automatici. Per .env: `scp root@IP:/opt/vergen-browser/.env ./backup`

---

## 🚨 Importante

**NON committare MAI `.env` su Git!**
È già in `.gitignore` ma verifica prima di pushare.

**Chiavi Stripe sono SEGRETE!**
Non condividerle mai. Usa solo in `.env` sulla VPS.

---

**Buona fortuna con VerGen Browser! 🚀🇨🇦**

Hai domande? Vedi la documentazione completa.
