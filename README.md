# Cuori di Carbone - Redesign Concept Frontend

Questo archivio contiene l'intera struttura di Redesign Frontend del sito culturale ed emotivo **"Cuori di Carbone"**, dedicato alla memoria storica dei minatori emigrati in Belgio.

## 🌟 Caratteristiche del Redesign
- **Estetica Immersiva:** Palette colori scura (Antracite/Fumo) ispirata al carbone e alle miniere sotterranee, accesa da punti luce color Ambra (`#ff9f0a`) che ricordano la fiammella della lanterna del minatore e la speranza.
- **Architettura Data-Driven:** Tutti i testi, i dati, le statistiche dell'archivio (es. 480+ minatori, 125+ storie), le testimonianze originali e i link alle immagini sono centralizzati nel file `data.json`. Il file JavaScript (`app.js`) effettua il parsing e modella la UI dinamicamente.
- **Micro-interazioni e Animazioni:** Effetto Zoom e transizione da Bianco/Nero a Colori fluidi sulle Card dei Minatori al passaggio del mouse. Timeline interattiva per ripercorrere gli eventi (convegno del 15 maggio 2025, Santa Barbara, ecc.).

## 📂 Struttura del Progetto
```text
├── index.html          # Struttura semantica della Landing Page
├── style.css           # Fogli di stile, animazioni e CSS Responsive
├── app.js              # Logica JS per l'iniezione dinamica dei dati
├── data.json           # Database completo dei contenuti e delle storie
└── README.md           # Questa documentazione