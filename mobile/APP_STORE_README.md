# BubuBay — App Store Submission Guide

## Was Bubu bereits erledigt hat ✅

- **App Icons** generiert (alle Größen: 48–1024px) → `assets/icons/`
- **`app.json`** konfiguriert mit Bundle ID `de.bububay.app`, dark mode, deutsche Domain
- **`eas.json`** erstellt (EAS Build Config für development / preview / production)
- **Icon-Assets** aktualisiert: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`

---

## Was Chef selbst tun muss 👨‍💻

### 1. Apple Developer Account
- Registrierung unter: https://developer.apple.com/programs/
- Kosten: **99 USD/Jahr**
- Bundle ID `de.bububay.app` im Apple Developer Portal anlegen

### 2. EAS CLI installieren & einloggen
```bash
npm install -g eas-cli
eas login
```
→ Expo-Account anlegen falls nötig: https://expo.dev

### 3. Expo Projekt verknüpfen
```bash
cd /Users/miniagent/Projects/bububay-mobile
eas init
```

### 4. iOS Build starten (TestFlight / App Store)
```bash
# Produktions-Build für App Store:
eas build --platform ios --profile production

# Vorher: Signing-Zertifikat einrichten (EAS fragt automatisch)
```

### 5. App Store Connect vorbereiten
1. https://appstoreconnect.apple.com aufrufen
2. "Neue App" erstellen
3. Bundle ID: `de.bububay.app`
4. Screenshots vorbereiten (mind. 6,5" iPhone)
5. App-Beschreibung, Keywords, Kategorie ausfüllen

### 6. Build einreichen
```bash
eas submit --platform ios --profile production
```
Oder manuell via App Store Connect → Build hochladen → Review einreichen.

### 7. Android (Google Play) — optional
```bash
eas build --platform android --profile production
eas submit --platform android
```
→ Google Play Developer Account nötig: https://play.google.com/console ($25 einmalig)

---

## App-Details für Einreichung

| Feld | Wert |
|------|------|
| App Name | BubuBay |
| Bundle ID | de.bububay.app |
| Version | 1.0.0 |
| API Backend | https://www.bububay.de |
| Dark Mode | Ja |
| Tablet Support | Nein (iOS) |

---

## Nützliche Links

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Google Play Console](https://play.google.com/console)
