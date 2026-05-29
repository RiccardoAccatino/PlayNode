/**
 * file: dashboard.js (REFACTORED CON CONTROLLO AUTORIZZAZIONE)
 * Gestisce l'interfaccia principale dopo il login
 * Verifica i permessi per ogni pagina
 */

import * as playerModule from './player.js';
import * as localeModule from './locale.js';
import * as platformModule from './admin-platform.js';
import * as adminGameModule from './admin-game.js';

/**
 * Renderizza la dashboard principale dell'applicazione dopo il login.
 * Gestisce il controllo degli accessi basato sui ruoli e dinamicamente costruisce
 * l'interfaccia utente con navigazione, sidebar e contenuto delle pagine.
 *
 * @param {Object} userData - Oggetto contenente i dati dell'utente autenticato
 *                            Deve contenere almeno le proprietà: id, name, initials, role
 * @returns {void}
 */
export function renderDashboard(userData) {

    // 1. ADATTIAMO I RUOLI REALI DEL DATABASE ALLA LOGICA DEL DESIGN
    // Mappiamo i ruoli restituiti dal backend ai ruoli utilizzati nell'interfaccia
    let mappedRole = 'player';
    if (userData.role === 'Gestore') mappedRole = 'locale';
    if (userData.role === 'AdminPiattaforma') mappedRole = 'platform';
    if (userData.role === 'AdminGioco') mappedRole = 'admin-game';

    // 2. DEFINISCI I PERMESSI PER RUOLO
    // Definisce quali ruoli hanno accesso a quali sezioni dell'applicazione
    const ROLE_PERMISSIONS = {
        player: ['player'],                           // Solo accesso alla sezione player
        locale: ['locale'],                           // Solo accesso alla sezione locale
        platform: ['platform'],                       // Solo accesso alla sezione platform
        'admin-game': ['admin-game', 'platform']      // Admin gioco può vedere anche platform
    };

    /**
     * Verifica se l'utente corrente ha accesso a un ruolo specifico.
     *
     * @param {string} requiredRole - Il ruolo richiesto per accedere a una funzione
     * @returns {boolean} true se l'utente ha accesso, false altrimenti
     */
    function hasAccess(requiredRole) {
        const allowedRoles = ROLE_PERMISSIONS[mappedRole] || [];
        return allowedRoles.includes(requiredRole);
    }

    // 3. CONFIGURAZIONE DEI MENU CON CONTROLLO PERMESSI
    // Definisce la struttura dei menu e delle pagine per ogni ruolo
    const ROLES = {
        player: {
            nav: ['Dashboard', 'Giochi', 'Tornei', 'Profilo'], // Menu orizzontale superiore
            sidebar: null,                                       // Nessuna sidebar per i giocatori
            pages: {
                'Dashboard': () => hasAccess('player') ? playerModule.playerDashboard() : unauthorizedPage(),
                'Giochi': () => hasAccess('player') ? playerModule.playerGames() : unauthorizedPage(),
                'Tornei': () => hasAccess('player') ? playerModule.playerTournaments() : unauthorizedPage(),
                'Profilo': () => hasAccess('player') ? playerModule.playerProfile(userData) : unauthorizedPage()
            }
        },
        locale: {
            nav: [],                                             // Nessun menu orizzontale per i gestori locali
            sidebar: ['Panoramica', 'Giochi del Locale', 'Partite Live', 'Dispositivi', 'Statistiche Locale', 'Impostazioni'],
            sideIcons: ['📊', '🎮', '▶️', '📡', '📈', '⚙️'],     // Icone per gli elementi della sidebar
            pages: {
                'Panoramica': () => hasAccess('locale') ? localeModule.localeOverview() : unauthorizedPage(),
                'Giochi del Locale': () => hasAccess('locale') ? localeModule.localeGames() : unauthorizedPage(),
                'Partite Live': () => hasAccess('locale') ? localeModule.localeLive() : unauthorizedPage(),
                'Dispositivi': () => hasAccess('locale') ? localeModule.localeDevices() : unauthorizedPage(),
                'Statistiche Locale': () => hasAccess('locale') ? localeModule.localeStats() : unauthorizedPage(),
                'Impostazioni': () => hasAccess('locale') ? localeModule.localeSettings(userData) : unauthorizedPage()
            }
        },
        platform: {
            nav: [],                                             // Nessun menu orizzontale per gli admin piattaforma
            sidebar: ['Overview Globale', 'Utenti', 'Locali', 'Tipi di Gioco', 'Tornei', 'Monitor Sistema', 'Log & Audit'],
            sideIcons: ['🌐', '👥', '🏠', '🎲', '🏆', '🖥️', '📋'],
            pages: {
                'Overview Globale': () => hasAccess('platform') ? platformModule.platformOverview() : unauthorizedPage(),
                'Utenti': () => hasAccess('platform') ? platformModule.platformUsers() : unauthorizedPage(),
                'Locali': () => hasAccess('platform') ? platformModule.platformLocali() : unauthorizedPage(),
                'Tipi di Gioco': () => hasAccess('platform') ? platformModule.platformGames() : unauthorizedPage(),
                'Tornei': () => hasAccess('platform') ? platformModule.platformTournaments() : unauthorizedPage(),
                'Monitor Sistema': () => hasAccess('platform') ? platformModule.platformMonitor() : unauthorizedPage(),
                'Log & Audit': () => hasAccess('platform') ? platformModule.platformLogs() : unauthorizedPage()
            }
        },
        'admin-game': {
            nav: [],                                             // Nessun menu orizzontale per gli admin gioco
            sidebar: ['Dashboard', 'Tipi di Gioco', 'Tornei', 'Monitor Sistema'],
            sideIcons: ['📊', '🎲', '🏆', '🖥️'],
            pages: {
                'Dashboard': () => hasAccess('admin-game') ? adminGameModule.adminGameDashboard() : unauthorizedPage(),
                'Tipi di Gioco': () => hasAccess('admin-game') ? platformModule.platformGames() : unauthorizedPage(),
                'Tornei': () => hasAccess('admin-game') ? platformModule.platformTournaments() : unauthorizedPage(),
                'Monitor Sistema': () => hasAccess('admin-game') ? platformModule.platformMonitor() : unauthorizedPage()
            }
        }
    };

    const cfg = ROLES[mappedRole];

    // Se il ruolo non esiste, mostra errore
    if (!cfg) {
        document.getElementById('app-root').innerHTML = unauthorizedPage();
        return;
    }

    // 4. PAGINA NON AUTORIZZATA
    /**
     * Genera l'HTML per la pagina di accesso negato.
     *
     * @returns {string} HTML della pagina di errore 403
     */
    function unauthorizedPage() {
        return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:16px">
                <div style="font-size:48px">🚫</div>
                <div style="font-family:var(--ff);font-size:24px;font-weight:700">Accesso Negato</div>
                <div style="font-size:14px;color:var(--txt3)">Non hai i permessi per visualizzare questa pagina</div>
                <button id="logout-btn-error" style="margin-top:16px;padding:10px 20px;background:var(--red);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500">Torna al Login</button>
            </div>
        `;
    }

    // 5. LO SCHELETRO PRINCIPALE DELL'APP
    /**
     * Template HTML principale dell'applicazione.
     * Contiene lo scheletro con topbar, body (sidebar + main content) e footer.
     *
     * @type {string}
     */
    const appHtml = `
      <div class="app">
        <!-- TOPBAR -->
        <div class="topbar">
          <div class="logo">
            <div class="logo-dot"></div>
            Connected Games
            <span class="logo-pill">UPO 25/26</span>
          </div>

          <div class="nav" id="topnav"></div>

          <div class="user-chip">
            <div class="avatar" id="av-initials">${userData.initials}</div>
            <span class="uname" id="av-name">${userData.name}</span>
            <span style="font-size:10px;color:var(--txt3);margin-left:8px;padding:2px 8px;background:var(--surf2);border-radius:4px">${userData.role}</span>
            <button id="logout-btn" style="background:transparent; border:1px solid var(--bdr); color:var(--txt2); padding:4px 8px; border-radius:6px; cursor:pointer; font-size:11px; margin-left:10px;">Esci</button>
          </div>
        </div>

        <!-- BODY CENTRALE -->
        <div class="body">
          <div class="sidebar" id="sidebar"></div>
          <div class="main" id="main-content"></div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <span class="ft">Connected Games Platform</span>
          <span class="ft-sep">·</span>
          <span class="ft" id="ft-authors">Dappia · Ricky · Angie</span>
          <span class="ft-sep">·</span>
          <span class="ft">PISSIR Lab — A.A. 2025/2026</span>
          <span class="ft-sep" style="margin-left:auto">v0.2.0-alpha</span>
          <span class="ft" id="ft-date"></span>
        </div>
      </div>
    `;

    document.getElementById('app-root').innerHTML = appHtml;
    document.getElementById('ft-date').textContent = new Date().toLocaleDateString('it-IT');

    // 6. FUNZIONI PER COSTRUIRE IL MENU DINAMICO
    /**
     * Costruisce dinamicamente il menu di navigazione orizzontale (topbar).
     * Crea i pulsanti di navigazione e assegna gli eventi di click per cambiare pagina.
     *
     * @returns {void}
     */
    function buildNav() {
        const nav = document.getElementById('topnav');
        nav.innerHTML = '';
        if(cfg.nav) {
            cfg.nav.forEach((label, i) => {
                const b = document.createElement('button');
                b.className = 'nav-btn' + (i === 0 ? ' active' : '');
                b.textContent = label;
                b.onclick = () => {
                    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
                    b.classList.add('active');
                    showPage(label);
                };
                nav.appendChild(b);
            });
        }
    }

    /**
     * Costruisce dinamicamente la sidebar di navigazione verticale.
     * Crea i pulsanti della sidebar con icone e assegna gli eventi di click per cambiare pagina.
     *
     * @returns {void}
     */
    function buildSidebar() {
        const sb = document.getElementById('sidebar');
        if (!cfg.sidebar) {
            sb.classList.add('hidden');
            return;
        }
        sb.classList.remove('hidden');
        sb.innerHTML = '';
        const lbl = document.createElement('div');
        lbl.className = 'sb-label';
        lbl.textContent = 'Navigazione';
        sb.appendChild(lbl);

        cfg.sidebar.forEach((label, i) => {
            const b = document.createElement('button');
            b.className = 'sb-btn' + (i === 0 ? ' active' : '');
            b.innerHTML = `<span class="sb-icon">${cfg.sideIcons[i]}</span>${label}`;
            b.onclick = () => {
                document.querySelectorAll('.sb-btn').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                showPage(label);
            };
            sb.appendChild(b);
        });
    }

    /**
     * Mostra la pagina richiesta nell'area contenuto principale.
     *
     * @param {string} name - Il nome della pagina da visualizzare (deve corrispondere a una chiave in cfg.pages)
     * @returns {void}
     */
    function showPage(name) {
        const fn = cfg.pages[name];
        const main = document.getElementById('main-content');
        if (fn) {
            main.innerHTML = fn();
        } else {
            main.innerHTML = `<div class="pg-title">${name}</div><p style="color:var(--txt3);font-size:13px;margin-top:8px">Pagina in costruzione.</p>`;
        }
    }

    // 7. GESTIONE LOGOUT
    /**
     * Collega il gestore dell'evento di logout ai pulsanti di logout presenti nell'interfaccia.
     * Rimuove il token dallo storage locale e reindirizza alla pagina di login.
     *
     * @returns {void}
     */
    function attachLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logout-btn-error');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'login' }));
            });
        }
    }

    // 8. INIZIALIZZAZIONE
    /**
     * Inizializza tutti i componenti dell'interfaccia dopo il rendering iniziale.
     * Costruisce i menu, collega gli eventi di logout e mostra la prima pagina disponibile.
     *
     * @returns {void}
     */
    buildNav();
    buildSidebar();
    attachLogoutHandler();
    const firstPage = cfg.nav[0] || (cfg.sidebar && cfg.sidebar[0]);
    if (firstPage) showPage(firstPage);
}