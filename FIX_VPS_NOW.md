# 🚨 FIX URGENTE VPS - Esegui Questi Comandi

Il server non parte perché il codice su GitHub ha errori TypeScript. Li ho fixati! Devi aggiornare il codice sulla VPS.

---

## ⚡ Soluzione Rapida (2 minandi)

**Sulla VPS, esegui questi comandi uno per uno:**

```bash
# 1. Vai nella cartella progetto
cd /opt/vergen-browser

# 2. Pull codice aggiornato (CON I FIX!)
sudo git pull origin main

# 3. Rebuilda il server
sudo npm run build:server

# 4. Crea package.json per CommonJS
echo '{"type":"commonjs"}' | sudo tee dist/server/package.json > /dev/null

# 5. Fix .env - Aggiungi variabili server
sudo bash -c 'cat >> .env << EOF

# Server Variables (without VITE_ prefix)
SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU
EOF'

# 6. Genera JWT secret vero
JWT_SECRET=$(openssl rand -hex 32)
sudo sed -i "s|JWT_SECRET=\$(openssl rand -hex 32)|JWT_SECRET=$JWT_SECRET|g" .env

# 7. Avvia server con PM2
sudo pm2 start dist/server/index.js --name vergen-api --time

# 8. Salva configurazione
sudo pm2 save

# 9. Test
sleep 2
curl http://localhost:3000/api/health
```

---

## ✅ Output Atteso

Se tutto funziona, vedrai:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T...",
  "uptime": 2.123
}
```

---

## 🔍 Se PM2 Dice "Already Running"

```bash
# Stop e riavvia
sudo pm2 stop vergen-api
sudo pm2 delete vergen-api
sudo pm2 start dist/server/index.js --name vergen-api --time
sudo pm2 save
```

---

## 📊 Verifica PM2

```bash
sudo pm2 status
sudo pm2 logs vergen-api --lines 20
```

---

## 🎯 Dopo il Fix

1. ✅ Backend funzionante su `http://192.99.145.87:3000`
2. ✅ Aggiorna `.env` su Bolt con: `VITE_API_URL=http://192.99.145.87:3000`
3. ✅ Testa login su Bolt con `admin` / `admin123`

---

## 💡 Cosa Ho Fixato

1. **JWT Type Error**: Rimosso process.env.JWT_EXPIRES_IN che causava errore TypeScript
2. **Stripe API Version**: Aggiornato a `2025-10-29.clover`
3. **Database Config**: Aggiunto fallback per variabili senza prefisso `VITE_`
4. **CommonJS Setup**: Creato package.json per dist/server

---

## 🚨 Se Continua a Non Funzionare

```bash
# Logs dettagliati
sudo pm2 logs vergen-api --err --lines 50

# Test manuale
cd /opt/vergen-browser
node dist/server/index.js
# Premi Ctrl+C dopo aver visto l'output
```

---

## 📞 Prossimo Step

Dopo che il backend funziona:

1. Su Bolt.new, modifica `.env`:
   ```env
   VITE_API_URL=http://192.99.145.87:3000
   ```

2. Ricarica Bolt.new

3. Testa login:
   - Username: `admin`
   - Password: `admin123`

---

**INIZIA CON IL COMANDO 1!** 🚀
