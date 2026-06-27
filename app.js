document.addEventListener("DOMContentLoaded", () => {
    // Carica il database JSON globale
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            initApp(data);
        })
        .catch(err => console.error("Errore di inizializzazione dati:", err));
});

function initApp(data) {
    const navContainer = document.getElementById('main-nav');
    
    // Build delle voci menu originali ed esatte
    data.navigation.forEach((item, index) => {
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.innerText = item.label;
        if(index === 0) link.className = 'active';
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            renderView(item.id, data);
        });
        navContainer.appendChild(link);
    });

    // Iniezione globale fissa dei dati del Diario dell'Emigrante
    const diarioContainer = document.getElementById('diario-container');
    data.diario_emigrante.forEach(d => {
        diarioContainer.innerHTML += `
            <div class="diario-card">
                <p>"${d.text}"</p>
                <div class="diario-author">— ${d.author}</div>
                <div class="diario-context">${d.context}</div>
                <div class="diario-context" style="color:var(--color-amber);">${d.date}</div>
            </div>
        `;
    });

    // Carica la Home view di default
    renderView('home', data);
}

function renderView(viewId, data) {
    const mainContainer = document.getElementById('view-container');
    
    // Reset classe animazione per triggerare l'effetto a ogni cambio pagina
    mainContainer.classList.remove('view-animate');
    void mainContainer.offsetWidth; // Trigger reflow
    mainContainer.classList.add('view-animate');

    if (viewId === 'home') {
        let statsHTML = '';
        data.home.stats.forEach(s => {
            statsHTML += `
                <div class="stat-box">
                    <h3>${s.value}</h3>
                    <p>${s.label}</p>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container hero-home">
                <h1>${data.home.title}</h1>
                <p class="desc">${data.home.description}</p>
                <div class="stats-row">${statsHTML}</div>
                
                <div class="origine-blocco">
                    <div>
                        <span class="tag-mini">${data.home.origine.tag}</span>
                        <h2 style="font-family:var(--font-serif); margin:15px 0; font-size:2.2rem;">${data.home.origine.title}</h2>
                        <p style="color:var(--color-text-muted);">${data.home.origine.text}</p>
                    </div>
                    <div>
                        <img src="${data.home.origine.image}" class="origine-img" alt="Dolorino">
                    </div>
                </div>

                <div style="text-align:center; margin-top:100px;">
                    <h2 class="page-title">${data.home.cammino_intro.title}</h2>
                    <p style="max-width:700px; margin:20px auto; color:var(--color-text-muted);">${data.home.cammino_intro.text}</p>
                </div>
            </section>
        `;
    } 
    
    else if (viewId === 'chi-siamo') {
        mainContainer.innerHTML = `
            <section class="container">
                <h1 class="page-title">${data.chi_siamo.title}</h1>
                <p class="page-subtitle">${data.chi_siamo.subtitle}</p>
                <div class="line-divider"></div>

                <div class="founder-block">
                    <div>
                        <img src="${data.chi_siamo.founder.image}" class="founder-img" alt="${data.chi_siamo.founder.name}">
                    </div>
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:2.5rem;">${data.chi_siamo.founder.name}</h2>
                        <h4 style="color:var(--color-amber); margin-bottom:20px;">${data.chi_siamo.founder.role}</h4>
                        <p style="color:var(--color-text-muted); font-size:0.95rem;">${data.chi_siamo.founder.bio}</p>
                    </div>
                </div>

                <div class="association-box">
                    <h2 style="font-family:var(--font-serif); font-size:2rem; margin-bottom:20px;">${data.chi_siamo.association.title}</h2>
                    <p style="color:var(--color-text-muted); max-width:900px; margin:0 auto;">${data.chi_siamo.association.text}</p>
                </div>
            </section>
        `;
    } 
    
    else if (viewId === 'i-nostri-minatori') {
        mainContainer.innerHTML = `
            <section class="container" style="text-align:center;">
                <h1 class="page-title">${data.i_nostri_minatori.title}</h1>
                <p class="page-subtitle">${data.i_nostri_minatori.subtitle}</p>
                <div class="line-divider"></div>
                <p style="max-width:700px; margin: 0 auto 40px auto; color:var(--color-text-muted);">${data.i_nostri_minatori.text}</p>
                <img src="${data.i_nostri_minatori.placeholder_image}" style="max-width:100%; border-radius:8px; filter:grayscale(100%); opacity:0.7;" alt="Minatori">
            </section>
        `;
    } 
    
    else if (viewId === 'eventi') {
        let eventiHTML = '';
        data.eventi.forEach(e => {
            eventiHTML += `
                <div class="timeline-card">
                    <span class="timeline-date">${e.date}</span>
                    <div class="timeline-location">${e.location}</div>
                    <h3 style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:10px;">${e.title}</h3>
                    <p style="color:var(--color-text-muted); font-size:0.95rem;">${e.description}</p>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <h1 class="page-title">Eventi & Iniziative</h1>
                <p class="page-subtitle">Il cammino cronologico della memoria</p>
                <div class="line-divider"></div>
                <div class="timeline-container">${eventiHTML}</div>
            </section>
        `;
    } 
    
    else if (viewId === 'curiosi-di-carbone') {
        let blogHTML = '';
        data.curiosi_di_carbone.articles.forEach(a => {
            blogHTML += `
                <div class="blog-card">
                    <div>
                        <div class="blog-meta">${a.date} | da ${a.author}</div>
                        <h3 style="font-family:var(--font-serif); margin-bottom:15px; font-size:1.3rem; line-height:1.3;">${a.title}</h3>
                        <p style="color:var(--color-text-muted); font-size:0.9rem;">${a.excerpt}</p>
                    </div>
                    <a href="#" style="color:var(--color-amber); text-decoration:none; font-weight:700; font-size:0.85rem; margin-top:20px; display:inline-block;">LEGGI ARTICOLO →</a>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <h1 class="page-title">${data.curiosi_di_carbone.title}</h1>
                <p class="page-subtitle">${data.curiosi_di_carbone.subtitle}</p>
                <div class="line-divider"></div>
                <p style="max-width:800px; text-align:center; margin:0 auto 60px auto; color:var(--color-text-muted);">${data.curiosi_di_carbone.description}</p>
                <div class="blog-grid">${blogHTML}</div>
            </section>
        `;
    }
}