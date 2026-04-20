# BubuBay Kleinanzeigen — Frontend Fehler-Lektionen

## 12.04.2026 — Debugging-Marathon bubuanzeigen.de

### Fehler 1: lucide-react Icons nicht importiert
- **Was:** `Package is not defined` — Dashboard nutzte `Package`, `Clock`, `CheckCircle` etc. als Variablen (lucide-react Icons) ohne Import
- **Fix:** Alle lucide Icons durch Emojis ersetzen: '📦', '⏰', '✅', '⚠️', '💰'
- **Regel:** **NIEMALS lucide-react nutzen!** Crasht mit React 18/19 Navigation. Immer Emojis.

### Fehler 2: Vite `allowedHosts` nicht gesetzt
- **Was:** Cloudflare Tunnel → Vite Dev Server → 403 "This host is not allowed"
- **Symptom:** Sah aus wie 502 Bad Gateway, war aber 403 Forbidden
- **Fix:** `server.allowedHosts: ['bubuanzeigen.de', 'www.bubuanzeigen.de', '.cfargotunnel.com']`
- **Regel:** Bei Cloudflare Tunnel IMMER `allowedHosts` setzen!

### Fehler 3: React 19 createRoot Callbacks in React 18
- **Was:** `onCaughtError`, `onUncaughtError`, `onRecoverableError` sind React 19 Features
- **Fix:** Nur `ReactDOM.createRoot(document.getElementById('root')).render(<App />)` ohne Optionen
- **Regel:** createRoot-Optionen an React-Version anpassen

### Fehler 4: useEffect benutzt aber nicht importiert
- **Was:** `sed` entfernte `useEffect` aus Import aber nicht aus Code
- **Fix:** Jede Seite prüfen: verwendete Hooks müssen importiert sein
- **Regel:** Nach sed/Replace-Operationen IMMER import vs usage prüfen

### Fehler 5: axios >= 1.x `destroy` ist keine Funktion
- **Was:** axios 1.x CancelToken/destroy API inkompatibel mit Vite HMR
- **Fix:** `axios@0.27.2` installieren
- **Regel:** axios Version pinnen, >= 1.x vermeiden wenn möglich

### Fehler 6: Falsches Debugging — an React statt Infra
- **Was:** Stundenlang React/Tailwind/Router-Versionen gewürfelt, dabei war es Vite allowedHosts
- **Lektion:** **INFRA ZUERST!** curl lokal → Port check → Tunnel check → erst dann App debuggen
- **Regel:** Bei Domain-Problemen: 1) curl localhost, 2) curl Domain, 3) Error-Message LESEN, 4) erst dann Code debuggen

---

## Stabile Stack-Konfiguration (getestet & funktioniert)

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.26.0",
  "axios": "0.27.2",
  "tailwindcss": "^4.1.0",
  "@tailwindcss/vite": "^4.1.0",
  "@vitejs/plugin-react": "^4.3.0",
  "vite": "^5.4.0"
}
```

## Server-Setup

- **Frontend:** Vite Dev Server (nicht build!) auf Port 3001
- **Backend:** FastAPI/uvicorn auf Port 8001
- **Tunnel:** Cloudflare Tunnel → localhost:3001 (Vite proxy leitet /api an 8001)
- **WICHTIG:** Vite Dev Server nutzen, nicht `vite build` → `allowedHosts` nur im Dev Server

## Vite Config Template

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: { '/api': 'http://localhost:8001' },
    allowedHosts: ['bubuanzeigen.de', 'www.bubuanzeigen.de', '.cfargotunnel.com']
  }
})
```

## JSX-Regeln

- **Emojis in Strings:** `{loading ? '⏳' : '📥'}` nicht `{loading ? ⏳ : 📥}`
- **Keine lucide-react:** Emojis nutzen
- **react-router-dom v6:** `from "react-router-dom"` NICHT `from "react-router"`
- **Kein StrictMode:** `<App />` nicht `<React.StrictMode><App /></React.StrictMode>`
- **ErrorBoundary pro Route** für isolierte Fehlermeldungen

## Debugging-Reihenfolge (MERKEN!)

1. `curl -I http://localhost:PORT` — läuft der Dienst?
2. `curl -I https://domain.de` — was sagt der externe Request?
3. **Error-Message LESEN** — 403 ≠ 502 ≠ 500
4. `tail -20 logdatei` — was sagt der Server?
5. Erst dann: Code/Versionen/Imports prüfen
6. **Binäre Isolation:** Seiten einzeln aktivieren um Täter zu finden
