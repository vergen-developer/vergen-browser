# 🚀 INIZIA ADESSO - 3 Comandi

**Username GitHub**: vergen-developer
**Frontend Bolt**: https://vergen-browser-proxy-7yzs.bolt.host/
**VPS IP**: 192.99.145.87

---

## 📝 Decisione Repository

**SCEGLI UNA OPZIONE:**

### ✅ Opzione A: Repository PUBBLICA (Più Semplice)

**Pro**: Setup più veloce, nessuna configurazione SSH
**Contro**: Codice visibile (ma .env con chiavi è protetto)

```bash
# 1. Push su GitHub
git init
git add .
git commit -m "Initial commit - VerGen Browser"
git remote add origin https://github.com/vergen-developer/vergen-browser.git
git push -u origin main
```

Poi vai allo **Step VPS** sotto.

---

### 🔒 Opzione B: Repository PRIVATA (Più Sicura)

**Pro**: Codice non pubblico
**Contro**: Setup SSH richiesto (5 min extra)

```bash
# 1. Push su GitHub (stesso comando)
git init
git add .
git commit -m "Initial commit - VerGen Browser"
git remote add origin https://github.com/vergen-developer/vergen-browser.git
git push -u origin main

# 2. Configura SSH sulla VPS
ssh root@192.99.145.87
ssh-keygen -t ed25519 -C "vps@vergen"
# Premi Enter 3 volte

cat ~/.ssh/id_ed25519.pub
# Copia tutto

# 3. Su GitHub: Settings > SSH and GPG keys > New SSH key
# Incolla e salva

# 4. Test
ssh -T git@github.com
# Deve dire: "Hi vergen-developer!"
```

---

## 🖥️ Step VPS (25 min)

```bash
# Connetti VPS
ssh root@192.99.145.87

# Download script
wget https://raw.githubusercontent.com/vergen-developer/vergen-browser/main/VPS_BACKEND_ONLY.sh

# Esegui
sudo bash VPS_BACKEND_ONLY.sh
```

**Lo script chiederà:**

1. **URL repository**:
   - Pubblica: `https://github.com/vergen-developer/vergen-browser.git`
   - Privata: `git@github.com:vergen-developer/vergen-browser.git`

2. **Esporre porta 3000?**: `y`

3. **Dominio API?**: `n`

**Risultato**: Backend + Proxy installati! ✅

---

## 🎨 Step Bolt (1 min)

**Su questo progetto Bolt, modifica `.env`:**

Cambia:
```env
VITE_API_URL=http://localhost:3000
```

In:
```env
VITE_API_URL=http://192.99.145.87:3000
```

Salva - Bolt ricarica automaticamente! ✅

---

## ✅ Test Veloce

Console browser (F12) su Bolt:

```javascript
fetch('http://192.99.145.87:3000/api/health')
  .then(r => r.json())
  .then(console.log)
```

Vedi `{status: "healthy"}`? **PERFETTO!** 🎉

---

## 💳 Stripe (10 min)

```bash
ssh root@192.99.145.87
nano /opt/vergen-browser/.env
```

Aggiungi chiavi Stripe reali, poi:

```bash
pm2 restart vergen-api
```

---

## 📚 Documentazione Completa

- **SETUP_RAPIDO.md** - Guida dettagliata
- **BOLT_FRONTEND_PRONTO.md** - Info Bolt
- **SETUP_BOLT_FRONTEND.md** - Guida completa

---

## 💡 Raccomandazione

**Usa Repository PUBBLICA** se:
- È il tuo primo setup
- Vuoi andare veloce
- Il codice non contiene segreti (il .env è protetto)

**Usa Repository PRIVATA** se:
- Hai esperienza con SSH
- Vuoi massima privacy
- Non ti preoccupano 5 minuti extra

**Nota**: Le chiavi Stripe e JWT sono nel file `.env` che NON viene mai committato (è nel `.gitignore`)!

---

## 🎯 Tempo Totale

- Opzione A (Pubblica): **31 minuti**
- Opzione B (Privata): **36 minuti** (5 min setup SSH)

---

**Scegli l'opzione e inizia! 🚀🇨🇦**
