# VerGen Browser - Struttura Progetto

## Panoramica Directory

```
vergen-browser/
├── server/                      # Backend Node.js + Express
│   ├── config/
│   │   ├── database.ts         # Supabase client configuration
│   │   └── stripe.ts           # Stripe client configuration
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   └── security.ts         # URL validation, SSRF protection
│   ├── routes/
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── payment.ts          # Stripe payment & webhooks
│   │   ├── subscription.ts     # Subscription management
│   │   └── proxy.ts            # Main proxy navigation logic
│   └── index.ts                # Express app entry point
│
├── src/                         # Frontend React + TypeScript
│   ├── components/
│   │   ├── Homepage.tsx        # Landing page
│   │   ├── Login.tsx           # Login form
│   │   ├── Register.tsx        # Registration form
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── BrowserInterface.tsx # Main browser proxy UI
│   │   ├── Payment.tsx         # Stripe checkout page
│   │   └── Router.tsx          # Client-side routing logic
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global auth state management
│   ├── lib/
│   │   └── api.ts              # Axios instance with interceptors
│   ├── App.tsx                 # Root React component
│   ├── main.tsx                # React app entry point
│   └── index.css               # Global Tailwind styles
│
├── supabase/
│   └── migrations/             # Database migration files
│
├── dist/                        # Production build output
│   ├── index.html
│   └── assets/
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment template
├── README.md                    # Complete documentation
├── SETUP_GUIDE.md              # Step-by-step setup instructions
├── QUICK_START.md              # Fast setup guide
├── PROJECT_STRUCTURE.md        # This file
├── VPS_PROXY_SETUP.sh          # Automated VPS proxy setup script
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config (root)
├── tsconfig.app.json           # TypeScript config (frontend)
├── tsconfig.server.json        # TypeScript config (backend)
├── vite.config.ts              # Vite bundler config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── eslint.config.js            # ESLint config
```

---

## File Principali

### Backend

#### `server/index.ts`
Entry point del server Express. Configura middleware, routes, CORS, Helmet, rate limiting.

#### `server/routes/auth.ts`
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `GET /api/auth/me` - Info utente corrente

#### `server/routes/proxy.ts`
- `POST /api/proxy` - Naviga tramite proxy VPS
- `GET /api/proxy/history` - Storico navigazione
- `GET /api/proxy/history/:id` - Dettagli sessione

#### `server/routes/payment.ts`
- `POST /api/payment/create-checkout` - Crea sessione Stripe
- `POST /api/webhooks/stripe` - Webhook Stripe

#### `server/routes/subscription.ts`
- `GET /api/subscription/status` - Verifica abbonamento
- `POST /api/subscription/cancel` - Cancella abbonamento
- `GET /api/subscription/portal` - Portale Stripe

#### `server/middleware/auth.ts`
Middleware JWT per autenticazione. Verifica token e aggiunge `req.user`.

#### `server/middleware/security.ts`
Validazione URL e protezione SSRF. Blocca localhost, IP privati, protocolli pericolosi.

---

### Frontend

#### `src/App.tsx`
Componente root. Gestisce routing e autenticazione globale.

#### `src/components/Homepage.tsx`
Landing page con hero section, features, pricing, footer.

#### `src/components/Login.tsx`
Form login con validazione e gestione errori.

#### `src/components/Register.tsx`
Form registrazione con validazione password e termini.

#### `src/components/Dashboard.tsx`
Dashboard utente con:
- Info account
- Stato abbonamento
- Storico navigazione
- Gestione abbonamento

#### `src/components/BrowserInterface.tsx`
Interfaccia browser principale con:
- Barra navigazione (back, forward, reload)
- Input URL
- Indicatore connessione Canada
- Iframe per contenuto
- Gestione errori
- Menu utente

#### `src/components/Payment.tsx`
Pagina checkout Stripe con:
- Pricing card
- Lista features
- Metodi pagamento
- Redirect a Stripe

#### `src/contexts/AuthContext.tsx`
Context React per stato autenticazione globale:
- `user` - Utente corrente
- `token` - JWT token
- `login()` - Funzione login
- `register()` - Funzione registrazione
- `logout()` - Funzione logout

#### `src/lib/api.ts`
Istanza Axios configurata con:
- Base URL API
- Interceptor per aggiungere JWT token
- Headers automatici

---

## Flusso Dati

### Registrazione Utente

```
User Input (Register.tsx)
    ↓
AuthContext.register()
    ↓
POST /api/auth/register
    ↓
Hash password con bcrypt
    ↓
Inserisci in users table (Supabase)
    ↓
Crea subscription record (status: expired)
    ↓
Login automatico
    ↓
Genera JWT token
    ↓
Salva in localStorage
    ↓
Redirect a Dashboard
```

### Navigazione Proxy

```
User Input URL (BrowserInterface.tsx)
    ↓
POST /api/proxy con JWT token
    ↓
Verifica token (middleware/auth.ts)
    ↓
Verifica abbonamento attivo
    ↓
Valida URL (middleware/security.ts)
    ↓
Connetti a VPS proxy via HTTP/HTTPS agent
    ↓
VPS Squid fetcha pagina con IP Canada
    ↓
Ritorna HTML al backend
    ↓
Salva sessione in proxy_sessions table
    ↓
Ritorna HTML al frontend
    ↓
Render in iframe (BrowserInterface.tsx)
```

### Pagamento Stripe

```
User click "Sottoscrivi" (Payment.tsx)
    ↓
POST /api/payment/create-checkout
    ↓
Stripe.checkout.sessions.create()
    ↓
Redirect a Stripe Checkout
    ↓
User completa pagamento
    ↓
Stripe invia webhook a /api/webhooks/stripe
    ↓
Verifica signature webhook
    ↓
Salva evento in stripe_events table
    ↓
Aggiorna subscriptions table (status: active)
    ↓
User redirect a dashboard con conferma
```

---

## Database Schema

### Table: users

| Campo         | Tipo        | Descrizione                    |
|---------------|-------------|--------------------------------|
| id            | uuid        | Primary key                    |
| username      | text        | Username unico                 |
| email         | text        | Email (opzionale)              |
| password_hash | text        | Password bcrypt hashed         |
| created_at    | timestamptz | Data creazione                 |
| last_login    | timestamptz | Ultimo login                   |
| active        | boolean     | Account attivo                 |

### Table: subscriptions

| Campo                   | Tipo        | Descrizione                    |
|-------------------------|-------------|--------------------------------|
| id                      | uuid        | Primary key                    |
| user_id                 | uuid        | FK a users                     |
| stripe_subscription_id  | text        | ID subscription Stripe         |
| stripe_customer_id      | text        | ID customer Stripe             |
| status                  | text        | active/expired/cancelled       |
| expires_at              | timestamptz | Data scadenza                  |
| created_at              | timestamptz | Data creazione                 |
| updated_at              | timestamptz | Ultimo aggiornamento           |

### Table: proxy_sessions

| Campo         | Tipo        | Descrizione                    |
|---------------|-------------|--------------------------------|
| id            | uuid        | Primary key                    |
| user_id       | uuid        | FK a users                     |
| url_visited   | text        | URL visitato                   |
| ip_location   | text        | Location proxy (Canada 🇨🇦)    |
| timestamp     | timestamptz | Data sessione                  |
| load_time_ms  | integer     | Tempo caricamento (ms)         |

### Table: stripe_events

| Campo         | Tipo        | Descrizione                    |
|---------------|-------------|--------------------------------|
| id            | uuid        | Primary key                    |
| event_type    | text        | Tipo evento Stripe             |
| event_id      | text        | ID evento Stripe (unique)      |
| user_id       | uuid        | FK a users (nullable)          |
| data          | jsonb       | Payload completo evento        |
| processed_at  | timestamptz | Data elaborazione              |

---

## Variabili Ambiente

### Frontend (VITE_*)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=http://localhost:3000/api
```

### Backend

```env
# Database
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# JWT
JWT_SECRET=secret_min_32_chars
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_PUBLIC_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# VPS Proxy
PROXY_VPS_HOST=123.456.789.xxx
PROXY_VPS_PORT=3128
PROXY_AUTH_USER=
PROXY_AUTH_PASS=

# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:5173
```

---

## Script NPM

```bash
# Sviluppo
npm run dev              # Solo frontend (Vite)
npm run dev:server       # Solo backend (tsx watch)
npm run dev:full         # Frontend + Backend (concurrently)

# Build
npm run build            # Build frontend (dist/)
npm run build:server     # Build backend (dist/server/)

# Produzione
npm run start:server     # Avvia backend compilato

# Quality
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint
```

---

## Sicurezza

### Protezioni Implementate

1. **JWT Authentication**
   - Token sicuri con scadenza 7 giorni
   - Secret key configurabile
   - Middleware su tutti endpoint protetti

2. **SSRF Protection**
   - Blocco localhost/127.0.0.1
   - Blocco IP privati
   - Whitelist protocolli (solo HTTP/HTTPS)

3. **Rate Limiting**
   - 100 req/ora per IP
   - Su tutti endpoint /api/*

4. **Helmet.js**
   - Header HTTP sicuri
   - XSS protection
   - Content Security Policy

5. **CORS**
   - Solo domini trusted
   - Credentials enabled

6. **Password Security**
   - Bcrypt con 12 salt rounds
   - Nessuna password in chiaro
   - Validazione lunghezza minima

7. **Row Level Security (RLS)**
   - Abilitato su tutte le tabelle
   - Users vedono solo propri dati
   - Policies restrittive

---

## Performance

### Ottimizzazioni Frontend

- Vite per build ultra-veloce
- Code splitting automatico
- Lazy loading componenti
- Tree shaking
- Minification + Gzip

### Ottimizzazioni Backend

- Connection pooling Supabase
- JWT stateless (no DB lookup)
- Axios con timeout 30s
- Rate limiting
- Caching Squid proxy (100MB)

---

## Monitoraggio

### Logs Backend

```bash
# Produzione con PM2
pm2 logs vergen-api

# Sviluppo
# Console logs automatici
```

### Logs Squid Proxy

```bash
# Access logs
sudo tail -f /var/log/squid/access.log

# Error logs
sudo tail -f /var/log/squid/cache.log
```

### Database Queries

Accedi a Supabase Dashboard per:
- Query SQL Editor
- Table Editor
- Logs in real-time
- Performance insights

---

## Testing

### Test Manuali

Usa gli endpoint cURL nel README.md per testare ogni funzionalità.

### Test Automatici (TODO)

Future implementazioni:
- Unit tests (Jest + React Testing Library)
- Integration tests (Supertest per API)
- E2E tests (Playwright)

---

## Deploy Architecture (Produzione)

```
┌─────────────┐
│  Netlify    │ ← Frontend React
│  (CDN)      │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  Railway    │ ← Backend Node.js
│  (EU/US)    │
└──────┬──────┘
       │ HTTP via Proxy Agent
       ▼
┌─────────────┐
│  VPS Squid  │ ← Proxy Server
│  (Canada)   │
└──────┬──────┘
       │ Fetch con IP Canada
       ▼
┌─────────────┐
│  Internet   │ ← Siti target
└─────────────┘

External Services:
- Supabase (PostgreSQL)
- Stripe (Payments)
```

---

## Manutenzione

### Aggiornamenti Dipendenze

```bash
# Verifica outdated
npm outdated

# Aggiorna tutto
npm update

# Aggiorna major versions
npm install package@latest
```

### Backup Database

Supabase fa backup automatici. Per backup manuale:
1. Supabase Dashboard > Database > Backups
2. Esporta SQL dump

### Rinnovo SSL (VPS)

```bash
# Let's Encrypt certbot (auto-renewal)
sudo certbot renew --dry-run
```

---

**Documentazione completa per sviluppatori** 🚀
