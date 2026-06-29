let globalData = null;

document.addEventListener("DOMContentLoaded", () => {
    initThemeManager();

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error("File data.json non trovato.");
            return response.json();
        })
        .then(data => {
            globalData = data;
            buildApplication(data);
            handleRouting();
        })
        .catch(err => console.error("Errore caricamento dati:", err));
});

window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.slice(1) || 'home';
    if (globalData) {
        executeRouter(hash, globalData);
    }
}

function findArticleById(id) {
    if (!globalData) return null;
    for (let sezione of globalData.curiosi_di_carbone.sezioni) {
        const found = sezione.articoli.find(art => art.id === id);
        if (found) return found;
    }
    return null;
}

function initThemeManager() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', currentTheme);

    toggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Funzione fondamentale per correggere i percorsi su GitHub Pages e Mobile
function fixImagePath(path) {
    if (!path) return '';
    // Se inizia già con ./ o con http, va bene così
    if (path.startsWith('./') || path.startsWith('http')) return path;
    // Rimuove lo slash iniziale se presente per evitare conflitti con la sottocartella di GitHub
    if (path.startsWith('/')) path = path.slice(1);
    // Forza il percorso relativo locale pulito
    return './' + path;
}

function buildApplication(data) {
    const navContainer = document.getElementById('main-nav');
    navContainer.innerHTML = ''; // Svuota per evitare duplicati
    
    data.navigation.forEach((menuItem, index) => {
        const link = document.createElement('a');
        link.href = `#${menuItem.id}`;
        link.innerText = menuItem.label;
        if (index === 0) link.className = 'active';
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            executeRouter(menuItem.id, data);
        });
        navContainer.appendChild(link);
    });

    const diarioContainer = document.getElementById('diario-container');
    diarioContainer.innerHTML = ''; // Svuota per evitare duplicati
    data.diario_emigrante.forEach(item => {
        const card = document.createElement('div');
        card.className = 'diario-card';
        card.innerHTML = `
            <p>"${item.text}"</p>
            <div class="diario-author">— ${item.author}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">${item.context} (${item.date})</div>
        `;
        diarioContainer.appendChild(card);
    });

    document.querySelectorAll('.footer-links-nav a').forEach(footerLink => {
        footerLink.addEventListener('click', (e) => {
            const targetId = footerLink.getAttribute('href').replace('#', '');
            const matchingNav = Array.from(document.querySelectorAll('.nav-menu a')).find(a => a.getAttribute('href') === `#${targetId}`);
            if (matchingNav) {
                document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
                matchingNav.classList.add('active');
            }
            executeRouter(targetId, data);
        });
    });

    executeRouter('home', data);
}

function executeRouter(viewId, data) {
    const mainContainer = document.getElementById('view-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (viewId === 'home') {
        let statsHTML = '';
        data.home.stats.forEach(s => {
            statsHTML += `
                <div class="stat-item-box">
                    <div class="num-val">${s.value}</div>
                    <div class="lbl-txt">${s.label}</div>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <div class="hero-home-section">
                    <h1>${data.home.title}</h1>
                    <p>${data.home.description}</p>
                </div>
                <div class="stats-row-grid">${statsHTML}</div>
                
                <div class="founder-block" style="margin-top:70px;">
                    <div>
                        <img src="${fixImagePath(data.home.origine.image)}" class="founder-img" alt="Origine">
                    </div>
                    <div>
                        <span style="color:var(--color-amber); font-size:0.8rem; font-weight:700; letter-spacing:1px;">${data.home.origine.tag}</span>
                        <h2 style="font-size:2rem; margin:10px 0;">${data.home.origine.title}</h2>
                        <p style="color:var(--color-text-muted); font-size:0.95rem;">${data.home.origine.text}</p>
                    </div>
                </div>
            </section>
        `;
    } 
    else if (viewId === 'chi-siamo') {
        mainContainer.innerHTML = `
            <section class="container">
                <h1 style="font-size:3rem; margin-bottom:10px;">${data.chi_siamo.title}</h1>
                <p style="color:var(--color-amber); font-weight:600; margin-bottom:30px;">${data.chi_siamo.subtitle}</p>
                
                <div class="founder-block">
                    <div>
                        <img src="${fixImagePath(data.chi_siamo.founder.image)}" class="founder-img" alt="Andrea">
                    </div>
                    <div>
                        <h2 style="font-size:2rem; margin-bottom:5px;">${data.chi_siamo.founder.name}</h2>
                        <h4 style="color:var(--color-text-muted); margin-bottom:15px;">${data.chi_siamo.founder.role}</h4>
                        <p style="color:var(--color-text-muted); font-size:0.95rem;">${data.chi_siamo.founder.bio}</p>
                    </div>
                </div>

                <div class="association-box">
                    <h2 style="font-size:1.8rem; margin-bottom:15px;">${data.chi_siamo.association.title}</h2>
                    <p style="color:var(--color-text-muted); font-size:0.95rem;">${data.chi_siamo.association.text}</p>
                </div>
            </section>
        `;
    } 
    else if (viewId === 'i-nostri-minatori') {
        const mData = data.i_nostri_minatori;
        let regioniHTML = '';
        mData.statistiche.regioni.forEach(r => {
            regioniHTML += `<div class="region-tag-pill">${r.nome} <span>(${r.conteggio})</span></div>`;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <h1 style="font-size:3rem; text-align:center; margin-bottom:40px;">${mData.title}</h1>
                
                <div class="minatore-day-card">
                    <div class="minatore-day-img-box" style="background-image: url('${fixImagePath(mData.minatore_del_giorno.image)}'); background-size: cover; background-position: center; min-height: 220px;"></div>
                    <div class="minatore-day-content">
                        <span class="badge-day">${mData.minatore_del_giorno.label}</span>
                        <h2>${mData.minatore_del_giorno.name}</h2>
                        <div class="origin-tag">${mData.minatore_del_giorno.origin}</div>
                        <p style="font-size:0.95rem; line-height:1.6;">${mData.minatore_del_giorno.text}</p>
                    </div>
                </div>

                <div style="text-align:center; margin:50px 0;">
                    <h2>${mData.subtitle}</h2>
                    <p style="max-width:700px; margin:15px auto; color:var(--color-text-muted);">${mData.intro_text}</p>
                </div>

                <div class="stats-panel-white">
                    <div style="font-size:0.8rem; font-weight:700; opacity:0.8;">MINATORI ATTUALMENTE RITROVATI</div>
                    <div class="big-counter">${mData.statistiche.totale}</div>
                    <div style="margin-bottom:20px; font-size:0.9rem;">Identificati: <strong>${mData.statistiche.identificati}</strong> | Non identificati: <strong>${mData.statistiche.non_identificati}</strong></div>
                    <div class="regions-flex-wrap">${regioniHTML}</div>
                </div>

                <div style="text-align:center; margin-top:50px;">
                    <p style="max-width:700px; margin:0 auto 30px auto; color:var(--color-text-muted);">${mData.sub_text}</p>
                    <div class="map-visualization-box">
                        <img src="${fixImagePath(mData.mappa_immagine)}" alt="Mappa">
                    </div>
                </div>
            </section>
        `;
    } 
    else if (viewId === 'eventi') {
        const ePage = data.eventi_page;
        let catesHTML = '';
        
        ePage.categorie.forEach((cat, index) => {
            const isReversed = index % 2 !== 0 ? 'reversed' : '';
            const btnClass = cat.button_type === 'green' ? 'btn-evt-green' : 'btn-evt-dark';
            
            catesHTML += `
                <div class="evento-row-item ${isReversed}">
                    <div class="evento-text-col">
                        <h2>${cat.title}</h2>
                        <p>${cat.text}</p>
                        <div>
                            <a href="#" class="btn-evt ${btnClass}">${cat.button_text}</a>
                        </div>
                    </div>
                    <div class="evento-image-col">
                        <img src="${fixImagePath(cat.image)}" alt="${cat.title}">
                    </div>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <div class="eventi-intro-head">
                    <h1>${ePage.title}</h1>
                    <p>${ePage.description}</p>
                </div>
                <div class="eventi-alternating-container">
                    ${catesHTML}
                </div>
            </section>
        `;
    } 
    else if (viewId === 'curiosi-di-carbone') {
        const cData = data.curiosi_di_carbone;
        let sezioniHTML = '';

        cData.sezioni.forEach(sezione => {
            let articoliHTML = '';
            sezione.articoli.forEach(art => {
                articoliHTML += `
                    <div class="blog-card">
                        <div>
                            <div class="blog-card-meta">${art.date} — di ${art.author}</div>
                            <h3>${art.title}</h3>
                            <p>${art.excerpt}</p>
                        </div>
                        <a href="#article-${art.id}" class="blog-readmore-btn">Leggi di più</a>
                    </div>
                `;
            });

            // Fallback di sicurezza se nel JSON si usa 'titolo_sezione' o 'title_sezione'
            const visualTitle = sezione.titolo_sezione || sezione.title_sezione || "Sezione";

            sezioniHTML += `
                <div class="blog-group-wrapper">
                    <div class="blog-group-header">
                        <h2>${visualTitle}</h2>
                        <p>${sezione.sottotitolo_sezione || ''}</p>
                    </div>
                    <div class="blog-grid">
                        ${articoliHTML}
                    </div>
                </div>
            `;
        });

        mainContainer.innerHTML = `
            <section class="container">
                <div class="blog-section-title-block">
                    <div class="sub">${cData.subtitle}</div>
                    <h1>${cData.title}</h1>
                    <p class="disclaimer">${cData.description}</p>
                </div>
                ${sezioniHTML}
            </section>
        `;
    }
    else if (viewId.startsWith('article-') || findArticleById(viewId)) {
        const articleId = viewId.replace('article-', '');
        const article = findArticleById(articleId);
        
        if (!article) {
            mainContainer.innerHTML = '<section class="container"><h1>Articolo non trovato</h1></section>';
            return;
        }

        let contentHTML = `
            <section class="container article-full-page">
                <a href="#curiosi-di-carbone" class="article-back-link">← Torna ai Curiosi di Carbone</a>
                
                <div class="article-full-header">
                    <span class="article-full-category">${article.category || 'Articolo'}</span>
                    <h1>${article.title}</h1>
                    <div class="article-full-meta">
                        <span>${article.date}</span>
                        <span>di ${article.author}</span>
                    </div>
                </div>
        `;

        if (article.image) {
            contentHTML += `<img src="${fixImagePath(article.image)}" class="article-full-cover" alt="${article.title}">`;
        }

        if (article.content && article.content.sections) {
            contentHTML += `<p class="article-full-intro">${article.content.intro}</p>`;
            
            article.content.sections.forEach(section => {
                contentHTML += `
                    <div class="article-full-section">
                        <h2>${section.heading}</h2>
                        <p>${section.text}</p>
                `;
                
                if (section.images && section.images.length > 0) {
                    section.images.forEach(img => {
                        contentHTML += `<img src="${fixImagePath(img)}" alt="${section.heading}" class="article-full-img">`;
                    });
                }
                
                contentHTML += `</div>`;
            });
        } else {
            contentHTML += `<p class="article-full-text">${article.excerpt || 'Contenuto completo dell\'articolo'}</p>`;
        }

        contentHTML += `
                <div class="article-full-footer">
                    <a href="#curiosi-di-carbone" class="btn-back-articles">Torna ai Curiosi di Carbone</a>
                </div>
            </section>
        `;

        mainContainer.innerHTML = contentHTML;
    }
}