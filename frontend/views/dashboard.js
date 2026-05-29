/**
 * file: dashboard.js (REFACTORED CON CONTROLLO AUTORIZZAZIONE)
 * Gestisce l'interfaccia principale dopo il login
 * Verifica i permessi per ogni pagina
 */

import * as playerModule from './player.js';
import * as localeModule from './locale.js';
import * as platformModule from './admin-platform.js';
import * as adminGameModule from './admin-game.js';

export function renderDashboard(userData) {

    // 1. ADATTIAMO I RUOLI REALI DEL DATABASE ALLA LOGICA DEL DESIGN
    let mappedRole = 'player';
    if (userData.role === 'Gestore') mappedRole = 'locale';
    if (userData.role === 'AdminPiattaforma') mappedRole = 'platform';
    if (userData.role === 'AdminGioco') mappedRole = 'admin-game';

    // 2. DEFINISCI I PERMESSI PER RUOLO
    const ROLE_PERMISSIONS = {
        player: ['player'],
        locale: ['locale'],
        platform: ['platform'],
        'admin-game': ['admin-game', 'platform'] // admin gioco può vedere anche platform
    };

    // Verifica se l'utente ha accesso a un ruolo
    function hasAccess(requiredRole) {
        const allowedRoles = ROLE_PERMISSIONS[mappedRole] || [];
        return allowedRoles.includes(requiredRole);
    }

    // 3. CONFIGURAZIONE DEI MENU CON CONTROLLO PERMESSI
    const ROLES = {
        player: {
            nav: ['Dashboard', 'Giochi', 'Tornei', 'Profilo'],
            sidebar: null,
            pages: {
                'Dashboard': () => hasAccess('player') ? playerModule.playerDashboard() : unauthorizedPage(),
                'Giochi': () => hasAccess('player') ? playerModule.playerGames() : unauthorizedPage(),
                'Tornei': () => hasAccess('player') ? playerModule.playerTournaments() : unauthorizedPage(),
                'Profilo': () => hasAccess('player') ? playerModule.playerProfile(userData) : unauthorizedPage()
            }
        },
        locale: {
            nav: [],
            sidebar: ['Panoramica', 'Giochi del Locale', 'Partite Live', 'Dispositivi', 'Statistiche Locale', 'Impostazioni'],
            sideIcons: ['📊', '🎮', '▶️', '📡', '📈', '⚙️'],
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
            nav: [],
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
            nav: [],
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
    function attachLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logout-btn-error');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'login' }));
            });
        }
    }

    // 8. INIZIALIZZAZIONE
    buildNav();
    buildSidebar();
    attachLogoutHandler();
    const firstPage = cfg.nav[0] || (cfg.sidebar && cfg.sidebar[0]);
    if (firstPage) showPage(firstPage);
}