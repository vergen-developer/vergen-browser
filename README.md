# VerGen Browser - Browser Proxy Application

**VerGen Browser** è un'applicazione web completa che consente agli utenti di navigare su siti web attraverso un server proxy VPS situato in Canada. Questa soluzione offre la possibilità di accedere a contenuti web con un IP canadese senza installare VPN sul dispositivo.

## Caratteristiche Principali

- **Browser Proxy Interface**: Interfaccia browser simile a quella di un browser reale con navigazione tramite proxy
- **IP Canadese**: Tutte le richieste passano attraverso un server proxy VPS in Canada (Beauharnois, QC)
- **Sistema di Autenticazione**: JWT token-based authentication con bcrypt per sicurezza password
- **Pagamenti Stripe**: Sistema di abbonamento mensile (€0,50/mese) con rinnovo automatico
- **Dashboard Utente**: Gestione account, abbonamento, e storico navigazione
- **Sicurezza Avanzata**: SSRF protection, rate limiting, URL validation, Helmet.js
- **Database Supabase**: PostgreSQL gestito con Row Level Security (RLS)

---

## Stack Tecnologico

### Frontend
- **React 18** con TypeScript
- **Vite** per build ultra-veloce
- **Tailwind CSS** per styling
- **Lucide React** per icone
- **Axios** per HTTP requests

### Backend
- **Node.js** con Express
- **TypeScript** per type safety
- **JWT** per autenticazione
- **bcrypt** per hashing password
- **Stripe** per pagamenti ricorrenti
- **Axios** + proxy agents per connessioni VPS

### Database
- **Supabase** (PostgreSQL)
- Row Level Security (RLS) abilitato
- 4 tabelle: users, subscriptions, proxy_sessions, stripe_events

### Proxy Server (VPS Linux)
- **Ubuntu 25.04** su VPS in Canada
- **Squid Proxy** o **Nginx** reverse proxy
- Porta: 3128 (Squid) o 8080 (Nginx)

---

## Architettura del Sistema

```
┌─────────────┐
│   Browser   │
│  (React)    │
└─────┬───────┘
      │ HTTP Request + JWT
      ▼
┌─────────────────┐
│  Express API    │
│  (Node.js)      │
│  - Verifica JWT │
│  - Valida URL   │
│  - Check Sub    │
└─────┬───────────┘
      │ HTTP via Proxy Agent
      ▼
┌───────────────────┐
│  VPS Proxy Server │
│  (Canada)         │
│  - Squid/Nginx    │
└─────┬─────────────┘
      │ Fetch con IP Canada
      ▼
┌───────────────┐
│  Sito Target  │
│  (vede IP CA) │
└───────────────┘
```

### Flusso di Navigazione

1. Utente inserisce URL nel browser interface
2. Frontend invia POST `/api/proxy` con JWT token
3. Backend verifica token, abbonamento attivo, e sicurezza URL
4. Backend connette a VPS proxy in Canada tramite HTTP/HTTPS proxy agents
5. VPS proxy richiede la pagina usando suo IP canadese
6. Sito web vede IP del VPS Canada, NON IP utente reale
7. VPS ritorna HTML al backend
8. Backend ritorna HTML al frontend
9. Frontend visualizza contenuto in iframe

---

## Installazione e Setup

### Prerequisiti

- Node.js 18+ e npm
- Account Supabase (già configurato)
- Account Stripe (per pagamenti)
- VPS Linux Ubuntu 25.04 in Canada (per proxy server)

### 1. Clone e Installazione Dipendenze

```bash
git clone <repository-url>
cd vergen-browser
npm install
```

### 2. Configurazione Variabili Ambiente

Copia `.env.example` in `.env` e configura:

```env
# Database Supabase (già configurato)
VITE_SUPABASE_URL=https://qxxfwoxtxscryithamlo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# JWT Authentication
JWT_SECRET=your_random_secret_key_min_32_chars_CHANGE_THIS_IN_PRODUCTION
JWT_EXPIRES_IN=7d

# Stripe (ottieni da https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_1Axxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# VPS Proxy Server
PROXY_VPS_HOST=your-vps-ip-or-hostname.com
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=optional_username
PROXY_AUTH_PASS=optional_password

# App Config
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
```

### 3. Setup Stripe

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com/)
2. Crea un nuovo prodotto "Browser Proxy Mensile" a €0,50/mese
3. Copia il `price_id` (es: `price_1Axxxxxxxxx`)
4. Vai in Developers > API Keys e copia le chiavi
5. Vai in Developers > Webhooks e crea un nuovo endpoint:
   - URL: `https://your-api-domain.com/api/webhooks/stripe`
   - Eventi da ascoltare:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
6. Copia il webhook secret

### 4. Configurazione Database

Il database è già configurato su Supabase con le seguenti tabelle:
- `users` - Utenti registrati
- `subscriptions` - Abbonamenti attivi
- `proxy_sessions` - Storico navigazione
- `stripe_events` - Log eventi Stripe

Nessuna azione necessaria, tutto già fatto!

---

## Configurazione Server Proxy VPS (Linux Ubuntu 25.04)

### Setup Squid Proxy su VPS Canada

Esegui questi comandi sul tuo VPS Ubuntu:

```bash
# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Squid
sudo apt install squid -y

# Backup config originale
sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

# Edita configurazione
sudo nano /etc/squid/squid.conf
```

Aggiungi queste righe in `/etc/squid/squid.conf`:

```conf
# Porta proxy
http_port 3128

# Cache directory
cache_dir ufs /var/spool/squid 100 16 256

# Access logs
access_log /var/log/squid/access.log squid

# Hostname visibile
visible_hostname VerGen Browser-proxy

# ACL per backend (sostituisci con IP del tuo backend)
acl backend_server src YOUR_BACKEND_SERVER_IP

# Permetti accesso solo dal backend
http_access allow backend_server
http_access deny all

# Forward anonimo (opzionale)
forwarded_for off
request_header_access Allow allow all
request_header_access Authorization allow all
request_header_access Proxy-Authorization allow all
```

Salva e avvia Squid:

```bash
# Inizializza cache
sudo squid -z

# Avvia Squid
sudo systemctl start squid

# Abilita avvio automatico
sudo systemctl enable squid

# Verifica status
sudo systemctl status squid

# Test proxy localmente
curl -x http://localhost:3128 https://www.google.com
```

### Configurazione Firewall

```bash
# Apri porta 3128 solo per IP backend
sudo ufw allow from YOUR_BACKEND_IP to any port 3128
sudo ufw enable
```

### Monitoraggio Logs

```bash
# Segui i logs in real-time
sudo tail -f /var/log/squid/access.log

# Controlla errori
sudo tail -f /var/log/squid/cache.log
```

---

## Sviluppo Locale

### Avvio Completo (Frontend + Backend)

```bash
# Avvia frontend e backend insieme
npm run dev:full
```

Questo comando usa `concurrently` per avviare:
- Frontend su `http://localhost:5173`
- Backend API su `http://localhost:3000`

### Solo Frontend

```bash
npm run dev
```

### Solo Backend

```bash
npm run dev:server
```

### Type Checking

```bash
npm run typecheck
```

---

## Build e Deploy

### Build Frontend

```bash
npm run build
```

Questo crea la build ottimizzata in `dist/`

### Build Backend

```bash
npm run build:server
```

Questo compila TypeScript in JavaScript in `dist/server/`

### Avvio Produzione Backend

```bash
npm run start:server
```

---

## Deploy Raccomandato

### Frontend
- **Netlify** o **Vercel**
- Deploy automatico da Git
- Variabili ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

### Backend
- **Railway**, **Heroku**, o VPS
- Porta: 3000 (o $PORT dinamico)
- Variabili ambiente: tutte quelle in `.env`

### VPS Proxy
- Ubuntu 25.04 in Canada (es: OVH Beauharnois)
- 4 vCore, 8GB RAM, 75GB SSD
- IP statico pubblico
- Squid installato e configurato

---

## Endpoint API

### Autenticazione

#### POST `/api/auth/register`
Registra un nuovo utente

**Body:**
```json
{
  "username": "john_doe",
  "password": "securepass123",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrazione completata",
  "userId": "uuid"
}
```

#### POST `/api/auth/login`
Login utente

**Body:**
```json
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "expiresIn": "7d",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/auth/me`
Ottieni dati utente corrente

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00Z",
    "last_login": "2025-01-05T10:30:00Z"
  }
}
```

---

### Pagamenti

#### POST `/api/payment/create-checkout`
Crea sessione checkout Stripe

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/xxxxx"
}
```

#### POST `/api/webhooks/stripe`
Webhook Stripe (chiamato da Stripe, non dall'utente)

**Body:** Stripe event JSON

**Response:**
```json
{
  "received": true
}
```

---

### Abbonamento

#### GET `/api/subscription/status`
Verifica stato abbonamento

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "active": true,
  "expiresAt": "2025-02-01T00:00:00Z",
  "daysLeft": 27,
  "stripeId": "sub_xxxxx",
  "status": "active"
}
```

#### POST `/api/subscription/cancel`
Cancella abbonamento

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cancelled": true,
  "message": "Abbonamento cancellato con successo"
}
```

#### GET `/api/subscription/portal`
Ottieni link portale Stripe per gestione abbonamento

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/xxxxx"
}
```

---

### Proxy

#### POST `/api/proxy`
Naviga tramite proxy

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "html": "<html>...</html>",
  "status": 200,
  "location": "Canada 🇨🇦",
  "loadTime": 1250,
  "headers": {...}
}
```

**Errori:**
- 400: URL non valido o pericoloso (SSRF protection)
- 403: Abbonamento non attivo
- 502: Sito non raggiungibile
- 504: Timeout connessione

#### GET `/api/proxy/history?limit=50&offset=0`
Ottieni storico navigazione

**Headers:**
```
Authorization: Bearer <token>
```

**Query params:**
- `limit` (default: 50) - Numero risultati
- `offset` (default: 0) - Offset paginazione

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "url_visited": "https://example.com",
      "timestamp": "2025-01-05T10:30:00Z",
      "load_time_ms": 1250,
      "ip_location": "Canada 🇨🇦"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### GET `/api/proxy/history/:id`
Ottieni dettagli sessione specifica

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "url_visited": "https://example.com",
    "timestamp": "2025-01-05T10:30:00Z",
    "load_time_ms": 1250,
    "ip_location": "Canada 🇨🇦"
  }
}
```

---

## Sicurezza

### Protezioni Implementate

1. **SSRF Protection**
   - Blocco localhost e 127.0.0.1
   - Blocco IP privati (10.x, 192.168.x, 172.16-31.x)
   - Blocco protocolli pericolosi (solo HTTP/HTTPS)

2. **Rate Limiting**
   - 100 richieste/ora per IP
   - Applica a tutti endpoint `/api/*`

3. **Autenticazione Sicura**
   - Password bcrypt con 12 salt rounds
   - JWT token con scadenza 7 giorni
   - Header Authorization Bearer token

4. **Helmet.js**
   - Header HTTP sicuri
   - Protezione XSS
   - Content Security Policy

5. **CORS Configurato**
   - Solo domini trusted
   - Credentials abilitati

6. **URL Validation**
   - Validazione rigorosa URL
   - Sanitizzazione input

---

## Test

### Test API con cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234","email":"test@example.com"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234"}'

# Proxy (sostituisci TOKEN)
curl -X POST http://localhost:3000/api/proxy \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## Troubleshooting

### Errore: "Abbonamento non attivo"

- Verifica su Stripe che l'abbonamento sia `active`
- Controlla `subscriptions` table su Supabase
- Verifica `expires_at` sia futura

### Errore: "Token non valido"

- Token scaduto (7 giorni)
- JWT_SECRET non corretto
- Login necessario

### Proxy non funziona

- Verifica VPS proxy sia online: `ping PROXY_VPS_HOST`
- Test Squid: `curl -x http://PROXY_IP:3128 https://google.com`
- Controlla logs Squid: `sudo tail -f /var/log/squid/access.log`
- Verifica firewall VPS permetta connessioni da backend

### Stripe webhook non riceve eventi

- Webhook URL deve essere HTTPS in produzione
- Verifica URL in Stripe Dashboard > Webhooks
- Test con Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Struttura Progetto

```
vergen-browser/
├── server/
│   ├── config/
│   │   ├── database.ts        # Supabase client
│   │   └── stripe.ts          # Stripe client
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   └── security.ts        # URL validation, SSRF protection
│   ├── routes/
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── payment.ts         # Stripe checkout & webhooks
│   │   ├── subscription.ts    # Subscription management
│   │   └── proxy.ts           # Proxy navigation
│   └── index.ts               # Express app setup
├── src/
│   ├── components/
│   │   ├── Homepage.tsx       # Landing page
│   │   ├── Login.tsx          # Login form
│   │   ├── Register.tsx       # Registration form
│   │   ├── Dashboard.tsx      # User dashboard
│   │   ├── BrowserInterface.tsx  # Main proxy browser
│   │   ├── Payment.tsx        # Stripe payment page
│   │   └── Router.tsx         # Client-side routing
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── lib/
│   │   └── api.ts             # Axios instance with interceptors
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
├── tsconfig.server.json
└── README.md                  # This file
```

---

## Performance

### Ottimizzazioni Implementate

- Vite per build ultra-veloce
- Code splitting automatico
- Lazy loading componenti
- Axios con timeout 30s
- Cache Squid proxy (100MB)
- Connection pooling Supabase
- JWT stateless (no DB lookup)

---

## Roadmap Futuro

- [ ] Multiple proxy locations (US, EU, Asia)
- [ ] Browser extensions support
- [ ] Cookie persistence
- [ ] Session storage
- [ ] Dark mode
- [ ] Download files via proxy
- [ ] WebSocket support
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Usage analytics

---

## Supporto

Per supporto contatta: support@vergenbrowser.com

---

## Licenza

Proprietario - Tutti i diritti riservati

---

## Crediti

Sviluppato con:
- React + TypeScript
- Node.js + Express
- Supabase (PostgreSQL)
- Stripe Billing
- Squid Proxy
- Tailwind CSS

---

**VerGen Browser** - Naviga il Web Senza Confini 🇨🇦
