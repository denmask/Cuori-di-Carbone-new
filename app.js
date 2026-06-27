document.addEventListener("DOMContentLoaded", () => {
    // Caricamento dei dati asincroni dal file JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nel caricamento del file JSON dei contenuti");
            }
            return response.json();
        })
        .then(data => {
            initSiteContent(data);
        })
        .catch(error => console.error("Impossibile popolare l'interfaccia:", error));
});

function initSiteContent(data) {
    // 1. Popola i Metadati della Hero
    document.getElementById('site-subtitle').innerText = data.site_metadata.subtitle;
    document.getElementById('site-description').innerText = data.site_metadata.description;

    // 2. Generazione delle Statistiche Chiave
    const statsContainer = document.getElementById('stats-container');
    data.stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
        `;
        statsContainer.appendChild(statCard);
    });

    // 3. Generazione dei Minatori in Evidenza (Cards)
    const minatoriContainer = document.getElementById('minatori-container');
    data.minatori_highlights.forEach(m => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-wrap">
                <span class="card-badge">${m.regione}</span>
                <img src="${m.immagine}" alt="${m.nome}">
            </div>
            <div class="card-body">
                <h3>${m.nome}</h3>
                <p>${m.storia_breve}</p>
            </div>
        `;
        minatoriContainer.appendChild(card);
    });

    // 4. Generazione della Timeline del Cammino
    const timelineContainer = document.getElementById('timeline-container');
    data.timeline_eventi.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const item = document.createElement('div');
        item.className = `timeline-item ${side}`;
        item.innerHTML = `
            <div class="timeline-content">
                <span class="date">${event.data}</span>
                <h3>${event.titolo}</h3>
                <span style="font-size:0.85rem; color:#ff9f0a; display:block; margin: 4px 0 10px 0;">${event.luogo}</span>
                <p style="color:#aeaeb2; font-size:0.95rem;">${event.descrizione}</p>
            </div>
        `;
        timelineContainer.appendChild(item);
    });

    // 5. Generazione delle Testimonianze
    const testiContainer = document.getElementById('testimonianze-container');
    data.testimonianze_extra.forEach(t => {
        const tCard = document.createElement('div');
        tCard.className = 'test-card';
        tCard.innerHTML = `
            <p>"${t.testo}"</p>
            <div class="author">${t.autore}</div>
            <div class="role">${t.ruolo}</div>
        `;
        testiContainer.appendChild(tCard);
    });
}