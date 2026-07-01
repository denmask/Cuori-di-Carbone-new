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

// Ricerca potenziata e flessibile per evitare mismatch di tipo (stringa/numero/slug)
function findArticleById(id) {
    if (!globalData || !globalData.curiosi_di_carbone || !globalData.curiosi_di_carbone.sezioni) return null;
    
    // Puliamo l'id ricevuto per il confronto
    const cleanId = String(id).toLowerCase().trim().replace('article-', '');

    for (let sezione of globalData.curiosi_di_carbone.sezioni) {
        if (!sezione.articoli) continue;
        
        const found = sezione.articoli.find(art => {
            if (!art) return false;
            const artId = String(art.id).toLowerCase().trim();
            
            // 1. Confronto diretto ID (es. "santa-barbara-latisana-2025" o "1")
            if (artId === cleanId) return true;
            
            // 2. Fallback di sicurezza: Generiamo uno slug automatico dal titolo se l'ID differisce
            if (art.title) {
                const titleSlug = art.title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                if (titleSlug === cleanId) return true;
            }
            return false;
        });
        
        if (found) return found;
    }
    return null;
}

// Ricerca del minatore in evidenza tramite slug per la pagina di dettaglio dedicata
function findMinatoreBySlug(slug) {
    if (!globalData || !globalData.i_nostri_minatori) return null;
    const mData = globalData.i_nostri_minatori;
    const cleanSlug = String(slug).toLowerCase().trim().replace('minatore-', '');

    if (mData.minatore_del_giorno && mData.minatore_del_giorno.dettaglio) {
        const dett = mData.minatore_del_giorno.dettaglio;
        if (dett.slug && dett.slug.toLowerCase() === cleanSlug) return dett;
    }
    return null;
}

function initThemeManager() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// FUNZIONE DI SICUREZZA PER I PERCORSI DELLE IMMAGINI (INTELLIGENTE)
function fixImagePath(path) {
    if (!path) return '';
    
    // Se è già un URL assoluto web, lo lasciamo intatto
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Puliamo il testo da spazi bianchi extra
    let cleanPath = path.trim();
    
    // Rimuoviamo eventuali prefissi relativi già presenti
    if (cleanPath.startsWith('./')) cleanPath = cleanPath.slice(2);
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

    // Se il percorso non contiene esplicitamente la parola "images/", la aggiungiamo all'inizio.
    // Questo risolve il bug dei file che iniziano con caratteri speciali (es. "_DSC6481bis.jpg")
    if (!cleanPath.toLowerCase().startsWith('images/')) {
        cleanPath = 'images/' + cleanPath;
    }

    // Percorso relativo: funziona sia su GitHub Pages che su Live Server locale
    return './' + cleanPath;
}

function buildApplication(data) {
    const navContainer = document.getElementById('main-nav');
    if (navContainer) {
        navContainer.innerHTML = ''; 
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
    }

    const diarioContainer = document.getElementById('diario-container');
    if (diarioContainer) {
        diarioContainer.innerHTML = ''; 
        data.diario_emigrante.forEach(item => {
            const card = document.createElement('div');
            card.className = 'diario-card';
            card.innerHTML = `
                <p>${item.text}</p>
                <div class="diario-author">— ${item.author}</div>
                <div class="diario-context">${item.context}</div>
                <div class="diario-meta">${item.date}${item.location ? ' - ' + item.location : ''}</div>
            `;
            diarioContainer.appendChild(card);
        });
    }

    const diarioExtra = document.getElementById('diario-extra-text');
    if (diarioExtra && data.home && data.home.diario_extra_text) {
        diarioExtra.innerText = data.home.diario_extra_text;
    }

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

    // Rispettiamo l'eventuale hash iniziale presente all'apertura della pagina
    const initialHash = window.location.hash.slice(1);
    if (!initialHash || initialHash === 'home') {
        executeRouter('home', data);
    }
}

function executeRouter(viewId, data) {
    // Caso speciale: il link "Contattaci" punta al footer, non è una vista del router
    if (viewId === 'contatti') {
        const contattiEl = document.getElementById('contatti');
        if (contattiEl) contattiEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const mainContainer = document.getElementById('view-container');
    if (!mainContainer) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Inseriamo un blocco try/catch generale per intercettare crash improvvisi
    try {
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

            const cammino = data.home.cammino;
            let tappeHTML = '';
            if (cammino && Array.isArray(cammino.tappe)) {
                cammino.tappe.forEach(tappa => {
                    let imagesHTML = '';
                    if (Array.isArray(tappa.images) && tappa.images.length > 0) {
                        let imgs = '';
                        tappa.images.forEach(img => {
                            imgs += `<img src="${fixImagePath(img)}" alt="${tappa.title}">`;
                        });
                        imagesHTML = `<div class="tappa-images-grid count-${tappa.images.length}">${imgs}</div>`;
                    }
                    tappeHTML += `
                        <div class="tappa-item">
                            <div class="tappa-dot"></div>
                            <div class="tappa-row">
                                <div class="tappa-content">
                                    <div class="tappa-date">${tappa.date}</div>
                                    <div class="tappa-card">
                                        <h3>${tappa.title}</h3>
                                        <p>${tappa.text}</p>
                                        ${tappa.location ? `<div class="tappa-location">${tappa.location}</div>` : ''}
                                    </div>
                                </div>
                                ${imagesHTML ? `<div class="tappa-media">${imagesHTML}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            const curiosi = data.home.curiosi_preview;
            let curiosiArticoliHTML = '';
            if (curiosi && Array.isArray(curiosi.articoli)) {
                curiosi.articoli.forEach(art => {
                    curiosiArticoliHTML += `
                        <div class="curiosi-preview-card">
                            <div class="curiosi-preview-img" style="background-image: url('${fixImagePath(art.image)}');"></div>
                            <a href="${art.link}" class="curiosi-preview-title">${art.title}</a>
                            <div class="curiosi-preview-meta">${art.author}<br>${art.date}</div>
                            <p class="curiosi-preview-excerpt">${art.excerpt}</p>
                        </div>
                    `;
                });
            }

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

                ${cammino ? `
                <section class="cammino-section">
                    <div class="container">
                        <div class="section-header-center">
                            <div class="line-divider"></div>
                            <h2>${cammino.title}</h2>
                            <p class="cammino-label">${cammino.label}</p>
                            <p class="cammino-intro">${cammino.intro}</p>
                        </div>
                        <div class="tappe-timeline">
                            ${tappeHTML}
                        </div>
                        <div class="cammino-cta-buttons">
                            <a href="${cammino.cta.btn_eventi_link}" class="btn-cammino btn-cammino-outline">${cammino.cta.btn_eventi}</a>
                            <a href="${cammino.cta.btn_collabora_link}" class="btn-cammino btn-cammino-filled">${cammino.cta.btn_collabora}</a>
                        </div>
                    </div>
                </section>
                ` : ''}

                ${curiosi ? `
                <section class="curiosi-preview-section">
                    <div class="container">
                        <div class="section-header-center">
                            <h2>${curiosi.title_1}<br>${curiosi.title_2}</h2>
                            <div class="line-divider"></div>
                            <p class="curiosi-preview-intro">${curiosi.text}</p>
                        </div>
                        <div class="curiosi-preview-grid">
                            ${curiosiArticoliHTML}
                        </div>
                        <div class="curiosi-preview-blog-btn">
                            <a href="${curiosi.btn_blog_link}" class="btn-vai-al-blog">${curiosi.btn_blog}</a>
                        </div>
                    </div>
                </section>
                ` : ''}
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
                    
                    <a href="${mData.minatore_del_giorno.dettaglio ? '#minatore-' + mData.minatore_del_giorno.dettaglio.slug : '#'}" class="minatore-day-card minatore-day-card-link">
                        <div class="minatore-day-img-box" style="background-image: url('${fixImagePath(mData.minatore_del_giorno.image)}'); background-size: cover; background-position: center; min-height: 220px;"></div>
                        <div class="minatore-day-content">
                            <span class="badge-day">${mData.minatore_del_giorno.label}</span>
                            <h2>${mData.minatore_del_giorno.name}</h2>
                            <div class="origin-tag">${mData.minatore_del_giorno.origin}</div>
                            <p style="font-size:0.95rem; line-height:1.6;">${mData.minatore_del_giorno.text}</p>
                            ${mData.minatore_del_giorno.dettaglio ? '<span class="blog-readmore-btn">Leggi la sua storia</span>' : ''}
                        </div>
                    </a>

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
                                <a href="#curiosi-di-carbone" class="btn-evt ${btnClass}">${cat.button_text}</a>
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
        // Pagina di dettaglio/biografia completa di un minatore (es. Mario Todeschi)
        else if (String(viewId).startsWith('minatore-') || findMinatoreBySlug(viewId)) {
            const dett = findMinatoreBySlug(viewId);

            if (!dett) {
                mainContainer.innerHTML = '<section class="container"><h1>Minatore non trovato</h1><p>Verifica la corrispondenza dello slug nel file data.json</p></section>';
                return;
            }

            let inBreveHTML = '';
            if (Array.isArray(dett.in_breve)) {
                dett.in_breve.forEach(voce => {
                    inBreveHTML += `<li>${voce}</li>`;
                });
            }

            let cronologiaHTML = '';
            if (Array.isArray(dett.cronologia)) {
                dett.cronologia.forEach(tappa => {
                    cronologiaHTML += `
                        <div class="cronologia-item">
                            <span class="cronologia-periodo">${tappa.periodo}</span>
                            <span class="cronologia-testo">${tappa.testo}</span>
                        </div>
                    `;
                });
            }

            let biografiaHTML = '';
            if (Array.isArray(dett.biografia)) {
                dett.biografia.forEach(par => {
                    biografiaHTML += `<p>${par}</p>`;
                });
            }

            let testimonianzaHTML = '';
            if (Array.isArray(dett.testimonianza)) {
                dett.testimonianza.forEach(par => {
                    testimonianzaHTML += `<p>${par}</p>`;
                });
            }

            mainContainer.innerHTML = `
                <section class="container minatore-dettaglio-page">
                    <a href="#i-nostri-minatori" class="article-back-link">← Torna a I Nostri Minatori</a>

                    <div class="minatore-dett-header">
                        <span class="article-full-category">${dett.breadcrumb || ''}</span>
                        <h1>${dett.nome || ''}</h1>
                        ${dett.citazione ? `<p class="minatore-dett-citazione">${dett.citazione}</p>` : ''}
                    </div>

                    <div class="minatore-dett-grid">
                        <div class="minatore-dett-media">
                            ${dett.immagine ? `<img src="${fixImagePath(dett.immagine)}" alt="${dett.nome || ''}" class="minatore-dett-img">` : ''}
                            ${dett.didascalia_immagine ? `<p class="minatore-dett-caption">${dett.didascalia_immagine}</p>` : ''}
                            ${inBreveHTML ? `
                                <div class="minatore-dett-box-white">
                                    <div class="minatore-dett-box-label">In breve</div>
                                    <ul class="minatore-dett-inbreve-list">${inBreveHTML}</ul>
                                </div>
                            ` : ''}
                        </div>
                        <div class="minatore-dett-bio">
                            ${biografiaHTML}
                        </div>
                    </div>

                    ${cronologiaHTML ? `
                        <div class="minatore-dett-box-white minatore-dett-cronologia">
                            <div class="minatore-dett-box-label">Cronologia</div>
                            ${cronologiaHTML}
                        </div>
                    ` : ''}

                    ${testimonianzaHTML ? `
                        <div class="article-full-section minatore-dett-testimonianza">
                            <h2>${dett.testimonianza_titolo || 'La testimonianza'}</h2>
                            ${testimonianzaHTML}
                            ${dett.citazione_finale ? `
                                <div class="minatore-dett-quote-box">
                                    <p>${dett.citazione_finale}</p>
                                    ${dett.citazione_finale_autore ? `<div class="minatore-dett-quote-author">${dett.citazione_finale_autore}</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <div class="article-full-footer">
                        <a href="#i-nostri-minatori" class="btn-back-articles">Torna a I Nostri Minatori</a>
                    </div>
                </section>
            `;
        }
        // Intercettiamo i click sui singoli articoli in modo sicuro
        else if (String(viewId).startsWith('article-') || findArticleById(viewId)) {
            const articleId = String(viewId).replace('article-', '');
            const article = findArticleById(articleId);
            
            if (!article) {
                mainContainer.innerHTML = '<section class="container"><h1>Articolo non trovato</h1><p>Verifica la corrispondenza dell\'ID nel file data.json</p></section>';
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

            // Validazione rigorosa per evitare crash se i blocchi JSON sono malformati o mancano di sezioni
            if (article.content && Array.isArray(article.content.sections)) {
                contentHTML += `<p class="article-full-intro">${article.content.intro || ''}</p>`;
                
                article.content.sections.forEach(section => {
                    if (!section) return;
                    contentHTML += `
                        <div class="article-full-section">
                            <h2>${section.heading || ''}</h2>
                            <p>${section.text || ''}</p>
                    `;
                    
                    if (Array.isArray(section.images)) {
                        section.images.forEach(img => {
                            if (img) {
                                contentHTML += `<img src="${fixImagePath(img)}" alt="${section.heading || ''}" class="article-full-img">`;
                            }
                        });
                        if (section.images.length > 0 && section.images_caption) {
                            contentHTML += `<p class="article-full-img-caption">${section.images_caption}</p>`;
                        }
                    }
                    
                    contentHTML += `</div>`;
                });
            } else {
                contentHTML += `<p class="article-full-text">${article.content || article.excerpt || 'Contenuto in fase di caricamento...'}</p>`;
            }

            contentHTML += `
                    <div class="article-full-footer">
                        <a href="#curiosi-di-carbone" class="btn-back-articles">Torna ai Curiosi di Carbone</a>
                    </div>
                </section>
            `;

            mainContainer.innerHTML = contentHTML;
        }
    } catch (routeError) {
        console.error("Crash protetto nel router JavaScript:", routeError);
        mainContainer.innerHTML = `<section class="container"><h1>Errore nel caricamento della pagina</h1><p>Dettagli tecnici: ${routeError.message}</p></section>`;
    }
}