/**
 * Importiamo le funzioni che disegnano l'interfaccia di login, registrazione e dashboard.
 */
import { renderLogin } from '../views/login.js';
import { renderRegister } from '../views/register.js';
import { renderDashboard } from '../views/dashboard.js';
import { adminGameDashboard, disposeAdminGame } from '../views/admin-game.js';

/**
 * L'ID del contenitore principale all'interno di index.html dove verrà iniettato
 * l'HTML del login o della registrazione.
 * @type {string}
 */
const APP_CONTAINER_ID = 'app-root';
let currentView = null;

// Esposizione globale per i Toast e Confirm Modals (usati in tutte le views)
window.showToast = function(message, type = 'blu', duration = 3000) {
    const existing = document.getElementById('playnode-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'playnode-toast';
    
    let icon = 'ℹ️';
    if (type === 'grn') icon = '✅';
    if (type === 'amb') icon = '⚠️';
    if (type === 'red') icon = '❌';
    if (type === 'load') icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

    toast.innerHTML = `<span style="font-size: 18px; display: flex;">${icon}</span> <span>${message}</span>`;
    
    if (type === 'load' && !document.getElementById('toast-spin-style')) {
        const style = document.createElement('style');
        style.id = 'toast-spin-style';
        style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    
    const closeToast = () => {
        toast.style.animation = 'slideUp 0.3s ease-in forwards';
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    };

    if (duration > 0) {
        setTimeout(closeToast, duration);
    }
    
    return { close: closeToast };
};

window.showConfirm = function(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'playnode-confirm-overlay';
        
        const box = document.createElement('div');
        box.id = 'playnode-confirm-box';
        
        const text = document.createElement('div');
        text.id = 'playnode-confirm-text';
        text.textContent = message;
        
        const actions = document.createElement('div');
        actions.id = 'playnode-confirm-actions';
        
        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn-confirm-cancel';
        btnCancel.textContent = 'Annulla';
        
        const btnOk = document.createElement('button');
        btnOk.className = 'btn-confirm-ok';
        btnOk.textContent = 'Conferma';
        
        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);
        box.appendChild(text);
        box.appendChild(actions);
        overlay.appendChild(box);
        
        const close = (result) => {
            overlay.style.animation = 'fadeIn 0.2s ease-in reverse forwards';
            box.style.animation = 'scaleIn 0.2s ease-in reverse forwards';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
                resolve(result);
            }, 200);
        };
        
        btnCancel.addEventListener('click', () => close(false));
        btnOk.addEventListener('click', () => close(true));
        
        document.body.appendChild(overlay);
    });
};

window.showLocaleSelectorModal = function(locali) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'playnode-confirm-overlay';
        
        const box = document.createElement('div');
        box.id = 'playnode-confirm-box';
        box.style.width = '320px';
        
        const title = document.createElement('div');
        title.style.fontFamily = 'var(--ff)';
        title.style.fontSize = '18px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '8px';
        title.style.textAlign = 'center';
        title.textContent = 'Seleziona Locale';
        
        const text = document.createElement('div');
        text.id = 'playnode-confirm-text';
        text.style.marginBottom = '20px';
        text.style.textAlign = 'center';
        text.textContent = 'Scegli a quale locale desideri connetterti per questa sessione.';
        
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '10px';
        
        locali.forEach(l => {
            const btn = document.createElement('button');
            btn.className = 'btn-locale-select';
            btn.innerHTML = `<span style="font-size:18px">📍</span> <span>${l.nome}</span>`;
            btn.addEventListener('click', () => {
                overlay.style.animation = 'fadeIn 0.2s ease-in reverse forwards';
                box.style.animation = 'scaleIn 0.2s ease-in reverse forwards';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.remove();
                    resolve(l.id);
                }, 200);
            });
            list.appendChild(btn);
        });
        
        box.appendChild(title);
        box.appendChild(text);
        box.appendChild(list);
        overlay.appendChild(box);
        
        document.body.appendChild(overlay);
    });
};

/**
 * Funzione di navigazione principale dell'applicazione.
 * In base al nome della vista richiesta, chiama la funzione corretta per disegnare quella schermata.
 *
 * @param {string} viewName - Il nome della pagina da caricare (es. 'login', 'register', 'dashboard', 'admin-game').
 */
export function navigateTo(viewName) {
    const container = document.getElementById(APP_CONTAINER_ID);

    if (!container) {
        console.error(`ERRORE: Contenitore con id "${APP_CONTAINER_ID}" non trovato nel DOM.`);
        return;
    }

    if (currentView === 'admin-game' && viewName !== 'admin-game') {
        if (typeof disposeAdminGame === 'function') disposeAdminGame();
    }

    currentView = viewName;
    container.innerHTML = '';

    // Carichiamo la vista richiesta
    if (viewName === 'login') {
        renderLogin(handleAuthSuccess);
    }
    else if (viewName === 'register') {
        renderRegister(handleAuthSuccess);
    }
    else if (viewName === 'admin-game') {
        container.innerHTML = adminGameDashboard();

        const sidebar = document.querySelector('.sidebar');
        const topbar = document.querySelector('.topbar');
        if (sidebar) sidebar.style.display = 'none';
        if (topbar) topbar.style.display = 'none';
    }
}

function decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return {
        id: payload.userId,
        name: payload.username,
        initials: payload.username.substring(0, 2).toUpperCase(),
        role: payload.role
    };
}

/**
 * Callback di successo per l'autenticazione.
 * Questa funzione viene passata come "callback" a renderLogin e renderRegister.
 * Quei moduli la invocheranno (con i dati dell'utente) SOLO QUANDO
 * il login o la registrazione vanno a buon fine.
 *
 * @param {Object} userData - L'oggetto utente restituito dal login/registrazione.
 */
function handleAuthSuccess(userData) {
    // 1. Salva il token nel localStorage
    localStorage.setItem('token', userData.token);

    // 2. Decodifica il token appena ricevuto per ottenere i dati "ufficiali"
    const user = decodeToken(userData.token);

    // 3. Tutti gli utenti vanno direttamente alla dashboard principale
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userRole', user.role || 'Giocatore');

    renderDashboard(user);
}

// ============================================================================
// GESTIONE DEGLI EVENTI INIZIALI
// ============================================================================

/**
 * Funzione helper per decodificare il Token JWT nel frontend.
 * Ci permette di leggere l'username e il ruolo direttamente dal token!
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

/**
 * Inizializza l'applicazione quando il DOM è completamente caricato.
 * Avvia automaticamente la navigazione alla pagina di login.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (token) {
        const payload = parseJwt(token);

        if (payload && (payload.exp * 1000) > Date.now()) {
            console.log("Bentornato! Sessione recuperata con successo.");

            const user = {
                id: payload.userId,
                name: payload.username || 'Giocatore',
                initials: (payload.username || 'GU').substring(0, 2).toUpperCase(),
                role: payload.role || 'player'
            };

            localStorage.setItem('userId', String(payload.userId));
            localStorage.setItem('userRole', payload.role || 'Giocatore');

            renderDashboard(user);
            return;
        } else {
            console.warn("Il token è scaduto. Pulizia in corso...");
            localStorage.clear();
        }
    }

    // Se non c'è token o è scaduto, andiamo al login normalmente
    navigateTo('login');
});

/**
 * Gestisce gli eventi di navigazione personalizzati.
 * Ascolta gli eventi custom 'cgp:goto' per cambiare vista dinamicamente.
 * @param {Event} e - L'evento personalizzato che contiene il nome della vista da caricare in e.detail
 * @returns {void}
 */
document.addEventListener('cgp:goto', (e) => {
    // e.detail conterrà la stringa della pagina ('login' o 'register')
    navigateTo(e.detail);
});