// Importiamo le funzioni che disegnano l'interfaccia di login e registrazione.
// Presumo che i tuoi file login.js e register.js esportino le funzioni con questi nomi.
import { renderLogin } from '../views/login.js';
import { renderRegister } from '../views/register.js';

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

    // 1. Svuotiamo il contenitore principale per rimuovere il form di login/registrazione
    const container = document.getElementById(APP_CONTAINER_ID);
    container.innerHTML = '';

    // 2. QUI INIZIA LA CREAZIONE DELLA TUA APP PRINCIPALE
    // In un progetto completo, qui chiameresti una funzione importata da un altro file,
    // ad esempio: `import { renderDashboard } from '../views/dashboard.js';`
    // e poi chiameresti `renderDashboard(user);`.

    // Per ora, creiamo una struttura di base per farti vedere che funziona.
    const appHtml = `
        <div id="main-app" style="display:flex; flex-direction:column; min-height:100vh;">
            <!-- Navbar in alto -->
            <div style="background:var(--surf); padding:10px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--bdr);">
                <div style="font-weight: bold; color: var(--acc);">PlayNode</div>
                <div style="display:flex; align-items:center; gap:10px;">
                     <span id="user-role-badge" style="font-size:10px; background:var(--surf2); padding:3px 8px; border-radius:10px; color:var(--txt2);">${user.role.toUpperCase()}</span>
                     <span id="user-name">${user.name}</span>
                     <div id="user-initials" style="background:var(--acc); color:white; padding:8px; border-radius:50%; font-size:12px; font-weight:bold; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">${user.initials}</div>
                </div>
            </div>

            <!-- Corpo principale (Dashboard placeholder) -->
            <div style="padding: 20px;">
                <h1>Benvenuto, ${user.name}!</h1>
                <p>Hai effettuato l'accesso con il ruolo di: <strong>${user.role}</strong>.</p>
                <p style="color: var(--txt3);">Questa è la tua area privata. Da qui potrai gestire i giochi, i tornei e le statistiche.</p>
                
                <button id="logout-btn" style="margin-top:20px; padding:10px 15px; background:var(--red); color:white; border:none; border-radius:8px; cursor:pointer;">Logout (Esci)</button>
            </div>
        </div>
    `;

    // Inseriamo la dashboard nel contenitore
    container.innerHTML = appHtml;

    // 3. Aggiungiamo l'evento al pulsante di Logout (se l'utente vuole uscire)
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Semplice: navighiamo di nuovo al login!
            navigateTo('login');
        });
    }
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