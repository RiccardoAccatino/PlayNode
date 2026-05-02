// Importiamo le funzioni che disegnano l'interfaccia di login e registrazione.
// Presumo che i tuoi file login.js e register.js esportino le funzioni con questi nomi.
import { renderLogin } from '../views/login.js';
import { renderRegister } from '../views/register.js';
import { renderDashboard } from '../views/dashboard.js';

/**
 * L'ID del contenitore principale all'interno di index.html dove verrà iniettato
 * l'HTML del login o della registrazione.
 */
const APP_CONTAINER_ID = 'app-root';

/**
 * navigateTo(viewName)
 *
 * Questa funzione è il "motore di navigazione". In base al nome della vista
 * richiesta, chiama la funzione corretta per disegnare quella schermata.
 *
 * @param {string} viewName - Il nome della pagina da caricare (es. 'login', 'register').
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
}

/**
 * handleAuthSuccess(user)
 *
 * Questa funzione viene passata come "callback" a renderLogin e renderRegister.
 * Quei moduli la invocheranno (con i dati dell'utente) SOLO QUANDO
 * il login o la registrazione vanno a buon fine.
 *
 * @param {Object} user - L'oggetto utente restituito dal login/registrazione.
 */
function handleAuthSuccess(user) {
    console.log("Autenticazione completata con successo!", user);

    renderDashboard(user);
}

// ============================================================================
// GESTIONE DEGLI EVENTI INIZIALI
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    navigateTo('login');
});

document.addEventListener('cgp:goto', (e) => {
    // e.detail conterrà la stringa della pagina ('login' o 'register')
    navigateTo(e.detail);
});