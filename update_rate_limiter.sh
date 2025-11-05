#!/bin/bash

# Script per aggiornare il rate limiter su VPS
cd /opt/vergen-browser

# Backup
cp server/index.ts server/index.ts.backup.$(date +%Y%m%d_%H%M%S)

# Usa sed per sostituire il blocco del rate limiter
sed -i '/const limiter = rateLimit({/,/app.use(.\/api\/., limiter);/c\
const authLimiter = rateLimit({\
  windowMs: 15 * 60 * 1000,\
  max: 10,\
  skipSuccessfulRequests: true,\
  message: '\''Troppi tentativi di login, riprova tra 15 minuti'\'',\
  standardHeaders: true,\
  legacyHeaders: false,\
});\
\
const apiLimiter = rateLimit({\
  windowMs: 15 * 60 * 1000,\
  max: 100,\
  message: '\''Troppe richieste, riprova tra 15 minuti'\'',\
  standardHeaders: true,\
  legacyHeaders: false,\
});\
\
app.use('\''/api/auth/login'\'', authLimiter);\
app.use('\''/api/auth/register'\'', authLimiter);\
app.use('\''/api/'\'', apiLimiter);' server/index.ts

# Ricompila
npm run build:server

# Riavvia
pm2 restart vergen-api

# Mostra log
pm2 logs vergen-api --lines 20
