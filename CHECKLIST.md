# VerGen Browser - Checklist Setup VPS

Stampa questa checklist e spunta ogni passo completato.

---

## Pre-Requisiti

- [ ] VPS Ubuntu acquistato (IP: ________________)
- [ ] Accesso SSH funzionante
- [ ] Account Supabase (già configurato ✅)
- [ ] Codice progetto sul computer locale
- [ ] Account GitHub (opzionale ma consigliato)

---

## Fase 1: Preparazione Locale (10 minuti)

### GitHub Setup (Consigliato)

- [ ] Inizializza Git nel progetto: `git init`
- [ ] Commit iniziale: `git add . && git commit -m "Initial"`
- [ ] Crea repository su GitHub.com
- [ ] Push codice: `git push -u origin main`
- [ ] Annotare URL repository: ________________________________

### Alternativa: Upload Manuale

- [ ] Comprimere progetto: `tar -czf vergen-browser.tar.gz .`
- [ ] Pronto per upload via SCP

---

## Fase 2: Stripe Setup (20 minuti)

- [ ] Accedi a https://dashboard.stripe.com
- [ ] Vai in **Prodotti** > **+ Nuovo Prodotto**
- [ ] Nome: "Browser Proxy Mensile"
- [ ] Prezzo: €0,50
- [ ] Tipo: Ricorrente, Mensile
- [ ] Salva e copia Price ID: price_____________________
- [ ] Vai in **Developers > API Keys**
- [ ] Copia Publishable key: pk_____________________
- [ ] Copia Secret key: sk_____________________
- [ ] Vai in **Developers > Webhooks**
- [ ] Clicca **+ Add endpoint**
- [ ] URL: http://TUO_IP/api/webhooks/stripe
- [ ] Eventi selezionati:
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
- [ ] Salva e copia Signing secret: whsec_____________________

---

## Fase 3: Setup VPS (30 minuti)

### Connessione

- [ ] SSH nella VPS: `ssh root@TUO_IP`
- [ ] Password/chiave funzionante

### Setup Automatico (RACCOMANDATO)

- [ ] Download script:
  ```bash
  wget https://raw.githubusercontent.com/TUO_USERNAME/vergen-browser/main/FULL_VPS_SETUP.sh
  ```

  Oppure:

  ```bash
  git clone https://github.com/TUO_USERNAME/vergen-browser.git
  cd vergen-browser
  bash FULL_VPS_SETUP.sh
  ```

- [ ] Esegui script: `sudo bash FULL_VPS_SETUP.sh`

### Domande Script

- [ ] "Hai un dominio?" → Risposto (y/n)
- [ ] "Inserisci dominio" → Inserito (se hai dominio)
- [ ] "URL repository" → Inserito URL GitHub

### Verifica Output Script

- [ ] ✓ Squid Proxy installato
- [ ] ✓ Node.js installato
- [ ] ✓ Nginx installato
- [ ] ✓ Firewall configurato
- [ ] ✓ Progetto clonato
- [ ] ✓ .env creato
- [ ] ✓ Nginx configurato
- [ ] ✓ Build completato
- [ ] ✓ Backend avviato con PM2

---

## Fase 4: Configurazione .env (5 minuti)

- [ ] Connetti alla VPS
- [ ] Apri .env: `nano /opt/vergen-browser/.env`
- [ ] Aggiorna chiavi Stripe:
  - [ ] STRIPE_PUBLIC_KEY=pk_____
  - [ ] STRIPE_SECRET_KEY=sk_____
  - [ ] STRIPE_PRICE_ID=price_____
  - [ ] STRIPE_WEBHOOK_SECRET=whsec_____
- [ ] Salva (CTRL+X, Y, Enter)
- [ ] Riavvia backend: `pm2 restart vergen-api`

---

## Fase 5: Test Applicazione (15 minuti)

### Test Servizi

- [ ] Squid attivo: `sudo systemctl status squid`
- [ ] Backend attivo: `pm2 status`
- [ ] Nginx attivo: `sudo systemctl status nginx`

### Test Proxy Squid

- [ ] Test comando: `curl -x http://127.0.0.1:3128 https://google.com`
- [ ] Output ricevuto senza errori

### Test Backend API

- [ ] Health check: `curl http://localhost:3000/api/health`
- [ ] Risposta JSON ricevuta con "status":"healthy"

### Test Frontend

- [ ] Apri browser su: http://TUO_IP
- [ ] Homepage VerGen Browser caricata
- [ ] Pulsanti visibili e funzionanti

### Test Registrazione

- [ ] Clicca "Inizia Ora" o "Registrati"
- [ ] Compila form registrazione
  - Username: ________________
  - Password: ________________
- [ ] Registrazione completata
- [ ] Redirect a Dashboard

### Test Login

- [ ] Logout
- [ ] Clicca "Login"
- [ ] Inserisci credenziali
- [ ] Login riuscito
- [ ] Dashboard visibile

### Test Dashboard

- [ ] Nome utente visualizzato
- [ ] Stato abbonamento mostrato (scaduto inizialmente)
- [ ] Storico vuoto visibile

### Test Browser Interface

- [ ] Clicca "Apri Browser"
- [ ] Browser interface caricato
- [ ] Barra URL visibile
- [ ] Indicatore "Connesso da Canada 🇨🇦" presente

### Test Navigazione Proxy

- [ ] Inserisci URL: `ifconfig.me`
- [ ] Clicca "Vai"
- [ ] Pagina caricata (se abbonamento attivo) o errore mostrato
- [ ] IP mostrato è quello della VPS Canada

### Test Pagamento

- [ ] Dashboard > "Rinnova Abbonamento"
- [ ] Redirect a pagina pagamento
- [ ] Prezzo €0,50 visibile
- [ ] Pulsante "Sottoscrivi con Stripe" presente
- [ ] Click pulsante
- [ ] Redirect a Stripe Checkout

**Nota**: Per test completo pagamento, usa carta test Stripe: `4242 4242 4242 4242`

---

## Fase 6: Setup SSL (10 minuti) - Opzionale

**Solo se hai un dominio:**

- [ ] Dominio puntato a IP VPS
- [ ] DNS propagato (test: `ping tuo-dominio.com`)
- [ ] Installa Certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Ottieni certificato: `sudo certbot --nginx -d tuo-dominio.com`
- [ ] Certificato ottenuto e installato
- [ ] Test HTTPS: https://tuo-dominio.com
- [ ] Aggiorna .env APP_URL a HTTPS
- [ ] Riavvia backend: `pm2 restart vergen-api`
- [ ] Aggiorna Stripe webhook URL a HTTPS

---

## Fase 7: Verifica Finale (5 minuti)

### Checklist Funzionalità

- [ ] ✅ Homepage carica
- [ ] ✅ Registrazione funziona
- [ ] ✅ Login funziona
- [ ] ✅ Dashboard mostra dati
- [ ] ✅ Browser interface apre
- [ ] ✅ Proxy mostra IP VPS
- [ ] ✅ Backend API risponde
- [ ] ✅ Squid proxy funziona
- [ ] ✅ Nginx serve file
- [ ] ✅ SSL attivo (se configurato)

### Logs Puliti

- [ ] Backend logs: `pm2 logs vergen-api` (nessun errore)
- [ ] Nginx logs: `sudo tail /var/log/nginx/error.log` (nessun errore)
- [ ] Squid logs: `sudo tail /var/log/squid/access.log` (richieste visibili)

---

## Fase 8: Documentazione (5 minuti)

### Salva Informazioni Importanti

- [ ] **IP VPS**: ________________________________
- [ ] **Dominio** (se presente): ________________________________
- [ ] **URL App**: ________________________________
- [ ] **Username Test**: ________________________________
- [ ] **Password Test**: ________________________________
- [ ] **Stripe Dashboard**: https://dashboard.stripe.com

### Backup Locale

- [ ] Backup .env: `scp root@TUO_IP:/opt/vergen-browser/.env ./backup.env`
- [ ] Annotato Stripe keys in posto sicuro (password manager)

---

## Comandi Utili da Ricordare

```bash
# Backend
pm2 logs vergen-api      # Logs
pm2 restart vergen-api   # Riavvia

# Nginx
sudo systemctl restart nginx    # Riavvia
sudo tail -f /var/log/nginx/error.log  # Logs

# Squid
sudo systemctl restart squid    # Riavvia
sudo tail -f /var/log/squid/access.log # Logs

# Aggiorna codice
cd /opt/vergen-browser
git pull
npm run build
npm run build:server
pm2 restart vergen-api
```

---

## Problemi Comuni

### ❌ Backend non si avvia

```bash
pm2 logs vergen-api
# Controlla errori nei logs
```

### ❌ 502 Bad Gateway

```bash
pm2 status
# Verifica backend sia attivo
sudo nginx -t
# Verifica config Nginx
```

### ❌ Proxy non funziona

```bash
curl -x http://127.0.0.1:3128 https://google.com
# Test proxy diretto
sudo systemctl status squid
# Verifica Squid attivo
```

---

## ✅ Setup Completato!

- [ ] **Tutti i check passati**
- [ ] **Applicazione accessibile**
- [ ] **Test utente completato**
- [ ] **Backup salvato**
- [ ] **Documentazione letta**

---

## Prossimi Passi

- [ ] Marketing e acquisizione utenti
- [ ] Monitoraggio uptime (UptimeRobot)
- [ ] Analytics (Google Analytics)
- [ ] Privacy Policy e Terms pubblicati
- [ ] Social media setup

---

**Congratulazioni! VerGen Browser è online! 🚀🇨🇦**

Data completamento: ________________

Note aggiuntive:
_________________________________________
_________________________________________
_________________________________________
