/**
 * Importiamo le funzioni che disegnano l'interfaccia di login e registrazione.
 * Presumo che i tuoi file login.js e register.js esportino le funzioni con questi nomi.
 */
import { renderLogin } from '../views/login.js';
import { renderRegister } from '../views/register.js';
import { renderDashboard } from '../views/dashboard.js';

/**
 * L'ID del contenitore principale all'interno di index.html dove verrà iniettato
 * l'HTML del login o della registrazione.
 * @type {string}
 */
const APP_CONTAINER_ID = 'app-root';

/**
 * Funzione di navigazione principale dell'applicazione.
 * In base al nome della vista richiesta, chiama la funzione corretta per disegnare quella schermata.
 *
 * @param {string} viewName - Il nome della pagina da caricare (es. 'login', 'register', 'dashboard').
 * @returns {void}
 */
export function navigateTo(viewName) {
    // 1. Troviamo il contenitore principale nel nostro HTML
    const container = document.getElementById(APP_CONTAINER_ID);

    // 2. Controllo di sicurezza: se il contenitore non c'è, c'è un errore grave!
    if (!container) {
        console.error(`ERRORE: Contenitore con id "${APP_CONTAINER_ID}" non trovato nel DOM.`);
        return;
    }

    // 3. Svuotiamo il contenitore prima di caricarci dentro la nuova pagina
    container.innerHTML = '';

    // 4. Carichiamo la vista richiesta
    if (viewName === 'login') {
        // Chiamiamo renderLogin.
        // Notare che passiamo 'handleAuthSuccess' come argomento (callback).
        // renderLogin la chiamerà quando il login ha successo.
        renderLogin(handleAuthSuccess);
    }
    else if (viewName === 'register') {
        // Stessa cosa per la registrazione.
        renderRegister(handleAuthSuccess);
    }
    // Nota: Il dashboard viene gestito tramite handleAuthSuccess dopo il login/registrazione
}

function decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    // Ritorna l'oggetto coerente che la tua dashboard si aspetta
    return {
        id: payload.userId,
        name: payload.username, // Prende il nome dal token generato nel LoginService
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
 * @param {Object} user - L'oggetto utente restituito dal login/registrazione.
 *                        Deve contenere almeno le proprietà: id, name, initials, role.
 * @returns {void}
 */
function handleAuthSuccess(userData) {
    // 1. Salva il token nel localStorage
    localStorage.setItem('token', userData.token);

    // 2. Decodifica il token appena ricevuto per ottenere i dati "ufficiali"
    const user = decodeToken(userData.token);

    // 3. Renderizza la dashboard
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
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
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
    // 1. Cerchiamo se esiste già un token salvato
    const token = localStorage.getItem('token');

    if (token) {
        // 2. Decodifichiamo il token
        const payload = parseJwt(token);

        // 3. Controlliamo se il token è valido e non è scaduto
        // payload.exp è in secondi, Date.now() è in millisecondi
        if (payload && (payload.exp * 1000) > Date.now()) {
            console.log("Bentornato! Sessione recuperata con successo.");

            // 4. Ricostruiamo l'oggetto utente usando i dati scritti dentro il JWT!
            const user = {
                id: payload.userId,
                // Se il nome dal token è nullo, prova a estrarlo dall'email o usa un default
                name: payload.username || 'Giocatore',
                initials: (payload.username || 'GU').substring(0, 2).toUpperCase(),
                role: payload.role || 'player'
            };

            // 5. Lo mandiamo dritto alla dashboard saltando il login
            renderDashboard(user);
            return; // Termina qui la funzione
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