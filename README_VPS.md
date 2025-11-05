# 🚀 VerGen Browser - Setup VPS Completato al 95%

Hai già fatto quasi tutto! Manca solo aggiornare il codice sulla VPS.

---

## ⚡ AZIONE IMMEDIATA

**Il tuo server VPS non parte perché il codice su GitHub aveva errori TypeScript.**

**HO FIXATO TUTTO!** Devi solo aggiornare il codice sulla VPS.

---

## 📋 Situazione Attuale

### ✅ Completato
- [x] Squid Proxy installato e attivo (porta 3128)
- [x] Node.js 20 installato
- [x] PM2 installato
- [x] Repository clonato in `/opt/vergen-browser`
- [x] Dependencies installate
- [x] Firewall configurato (porte 22, 80, 443, 3000)
- [x] PM2 startup configurato
- [x] File `.env` creato

### ❌ Da Completare
- [ ] Pull codice aggiornato con fix TypeScript
- [ ] Build server compilato
- [ ] Server avviato con PM2

---

## 🔧 Comandi da Eseguire sulla VPS

**Copia e incolla questi comandi UNO PER UNO:**

```bash
# 1. Entra nella cartella
cd /opt/vergen-browser

# 2. Pull codice con FIX
sudo git pull origin main

# 3. Build server
sudo npm run build:server

# 4. CommonJS setup
echo '{"type":"commonjs"}' | sudo tee dist/server/package.json > /dev/null

# 5. Fix .env - aggiungi variabili server
sudo bash -c 'cat >> .env << "ENVEOF"

# Server Environment Variables (no VITE_ prefix)
SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU
ENVEOF'

# 6. Fix JWT_SECRET (genera vero random)
JWT_REAL=$(openssl rand -hex 32)
sudo sed -i "s|JWT_SECRET=\$(openssl rand -hex 32)|JWT_SECRET=$JWT_REAL|g" .env

# 7. Avvia PM2
sudo pm2 start dist/server/index.js --name vergen-api --time

# 8. Salva PM2
sudo pm2 save

# 9. TEST!
sleep 3
curl http://localhost:3000/api/health
```

---

## ✅ Output Atteso

```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T13:45:00.000Z",
  "uptime": 3.123
}
```

**Se vedi questo, PERFETTO! ✅**

---

## 🎯 Dopo il Test

### 1. Aggiorna Bolt.new

Nel file `.env` su Bolt.new, cambia:

```env
VITE_API_URL=http://192.99.145.87:3000
```

### 2. Testa Login

- Apri: https://vergen-browser-proxy-7yzs.bolt.host
- Clicca "Login"
- Username: `admin`
- Password: `admin123`

**Dovrebbe funzionare!** 🎉

---

## 🔍 Troubleshooting

### Se PM2 dice "script not found"

```bash
cd /opt/vergen-browser
ls -la dist/server/index.js
# Se non esiste, rebuild:
sudo npm run build:server
```

### Se curl fallisce

```bash
# Verifica PM2
sudo pm2 status
sudo pm2 logs vergen-api --lines 30

# Restart PM2
sudo pm2 restart vergen-api
```

### Se continua a non funzionare

```bash
# Test manuale (per vedere errori)
cd /opt/vergen-browser
sudo node dist/server/index.js
# Leggi l'errore, premi Ctrl+C
```

---

## 📊 Verifica Completa

```bash
# 1. Squid attivo?
sudo systemctl status squid | grep Active

# 2. PM2 running?
sudo pm2 status

# 3. Server risponde?
curl http://localhost:3000/api/health

# 4. Porta 3000 aperta?
sudo netstat -tlnp | grep 3000

# 5. Firewall OK?
sudo ufw status | grep 3000
```

---

## 🎉 Cosa Succederà

1. ✅ Backend API funzionante su porta 3000
2. ✅ Squid Proxy su porta 3128
3. ✅ PM2 tiene il server online
4. ✅ Auto-restart al reboot VPS
5. ✅ Login/Register funzionanti
6. ✅ Database Supabase connesso
7. ✅ Browser Proxy pronto (appena configuri frontend)

---

## 📁 File di Supporto

- **FIX_VPS_NOW.md** - Istruzioni dettagliate per il fix
- **VPS_UPDATE_CODE.sh** - Script automatico (opzionale)
- **SETUP_RAPIDO.md** - Guida completa originale
- **ACCOUNT_TEST.md** - Credenziali account test

---

## 🚀 Pronto?

**Esegui i comandi sopra sulla VPS e il gioco è fatto!**

Tempo stimato: **2 minuti** ⏱️

---

**INIZIA ADESSO!** 🇨🇦
