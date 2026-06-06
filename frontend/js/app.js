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

            // Tutti gli utenti con sessione valida vanno alla dashboard principale
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