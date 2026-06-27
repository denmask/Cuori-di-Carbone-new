# Cuori di Carbone - Redesign Architetturale Front-End SPA

Questo pacchetto contiene il codice sorgente per il completo rifacimento dell'esperienza utente digitale del progetto storico **Cuori di Carbone**.

## 🛠️ Architettura e Pagine Configurate
La navigazione rispetta l'alberatura delle sezioni ufficiali del portale:
1. **Home:** Introduzione, contatori delle statistiche estratti dagli screen, blocco narrativo della famiglia ed eventi introduttivi.
2. **Chi Siamo:** Focus biografico completo su *Andrea Campagnolo* (Ideatore e curatore) e la collaborazione strutturale con l'A.I.E.M.
3. **I Nostri Minatori:** Vetrina dell'archivio storico d'identificazione.
4. **Eventi:** Timeline completa con date reali e tappe, inclusi l'inaugurazione del 2025, Radio Spazio e gli incontri letterari del 2026.
5. **Curiosi di Carbone:** Lo spazio blog interattivo completo di articoli redazionali estratti dai materiali forniti.

## 🎞️ Gestione dei File Multimediali e Immagini
Tutti i riferimenti ai file visivi caricati sono già stati mappati e integrati nel file `data.json`:
- Logo principale istituzionale: `image_7c586a.jpg`
- Foto storica di Dolorino Campagnolo: `image_7c5811.png`
- Ritratto del curatore Andrea Campagnolo: `image_7c5cc6.jpg`
- Placeholder d'archivio minatori: `image_7c5469.png`

## 🚀 Istruzioni per l'Esecuzione Rapida
Per testare localmente l'applicazione mantenendo attive le funzioni asincrone del router:
1. Posiziona `index.html`, `style.css`, `app.js` e `data.json` nella stessa cartella.
2. Assicurati che le immagini indicate siano incluse nella medesima directory.
3. Esegui il progetto tramite un piccolo web server locale (ad esempio usando l'estensione **Live Server** su VS Code o digitando `python -m http.server` nella shell dei comandi).