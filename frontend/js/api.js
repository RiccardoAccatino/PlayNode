const GAME_API_URL = 'http://localhost:8080/api';
const AUTH_API_URL = 'http://localhost:8081/api/auth';
const STATS_API_URL = 'http://localhost:8082/api';
const TORNEI_API_URL = 'http://localhost:8083/api';

/**
 * Helper privato per effettuare richieste autenticate.
 * Gestisce l'inserimento del token JWT nel header Authorization
 * e il reindirizzamento al login in caso di sessione scaduta (401/403).
 *
 * @param {string} url - L'URL dell'endpoint API da chiamare
 * @param {Object} [options] - Opzioni di configurazione per fetch (method, headers, body, ecc.)
 * @returns {Promise<Response>} La risposta dell'API
 * @throws {Error} Se la sessione è scaduta o non autorizzata (status 401/403)
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
        console.warn("Sessione scaduta o non autorizzata. Ritorno al login...");
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'login' }));
        throw new Error('Session expired');
    }

    return response;
}

/**
 * Autentica un utente tramite email e password.
 * Invia una richiesta POST all'endpoint di login e restituisce i dati dell'utente autenticato.
 *
 * @param {string} email - L'email dell'utente
 * @param {string} password - La password dell'utente
 * @returns {Promise<Object>} Oggetto contenente i dati dell'utente (token, userId, name, role, ecc.)
 * @throws {Error} Se le credenziali sono non valide o se si verifica un errore di rete
 */
export async function loginUser(email, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Credenziali non valide o errore del server');
        }
        return await response.json();
    } catch (error) {
        console.error("Errore di rete durante il login:", error);
        throw error;
    }
}

/**
 * Registra un nuovo utente nel sistema.
 * Invia una richiesta POST all'endpoint di registrazione con i dati dell'utente.
 *
 * @param {Object} userData - Oggetto contenente i dati dell'utente da registrare
 *                            (username, email, password, ruolo, sesso, ecc.)
 * @returns {Promise<Object>} Oggetto contenente la risposta della registrazione (potrebbe includere token, userId, ecc.)
 * @throws {Error} Se si verifica un errore durante la registrazione (email duplicata, dati non validi, ecc.)
 */
export async function registerUser(userData) {
    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Errore durante la registrazione.');
        }
        return await response.json();
    } catch (error) {
        console.error("Errore di rete durante la registrazione:", error);
        throw error;
    }
}

/**
 * Ottiene le statistiche di un utente specifico.
 * Richiede autenticazione tramite JWT token.
 *
 * @param {string|number} utenteId - L'ID univoco dell'utente delle cui statistiche si desidera ottenere
 * @returns {Promise<Object|null>} Oggetto contenente le statistiche dell'utente, oppure null se non trovate
 * @throws {Error} Se si verifica un errore durante la chiamata API (eccetto 404 che restituisce null)
 */
export async function getUserStats(utenteId) {
    try {
        const response = await fetchWithAuth(`${STATS_API_URL}/statistiche/${utenteId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Errore fetch stats:", error);
        return null;
    }
}

/**
 * Ottiene lo storico delle partite di un utente specifico.
 * Richiede autenticazione tramite JWT token.
 *
 * @param {string|number} utenteId - L'ID univoco dell'utente dello storico da ottenere
 * @returns {Promise<Array>} Array contenente lo storico delle partite dell'utente
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getUserHistory(utenteId) {
    try {
        const response = await fetchWithAuth(`${STATS_API_URL}/storico/utente/${utenteId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch storico:", error);
        return [];
    }
}

/**
 * Ottiene l'elenco di tutti i locali disponibili sulla piattaforma.
 * Richiede autenticazione tramite JWT token.
 *
 * @returns {Promise<Array>} Array contenente gli oggetti locale disponibili
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getAllLocali() {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/locali`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch locali:", error);
        return [];
    }
}

/**
 * Ottiene l'elenco dei giochi disponibili in un locale specifico.
 * Richiede autenticazione tramite JWT token.
 *
 * @param {string|number} idLocale - L'ID univoco del locale
 * @returns {Promise<Array>} Array contenente gli oggetti gioco disponibili nel locale specificato
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getGiochiByLocale(idLocale) {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/locali/${idLocale}/giochi`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch giochi:", error);
        return [];
    }
}

/**
 * Ottiene l'elenco di tutte le partite disponibili sulla piattaforma.
 * Richiede autenticazione tramite JWT token.
 *
 * @returns {Promise<Array>} Array contenente gli oggetti partita disponibili
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getAllPartite() {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/partite`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch partite:", error);
        return [];
    }
}

/**
 * Ottiene gli eventi IoT associati a una partita specifica.
 * Richiede autenticazione tramite JWT token.
 *
 * @param {string|number} idPartita - L'ID univoco della partita
 * @returns {Promise<Array>} Array contenente gli oggetti evento IoT associati alla partita
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getEventiByPartita(idPartita) {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/iot/partita/${idPartita}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch eventi:", error);
        return [];
    }
}

/**
 * Ottiene l'elenco di tutti i tornei disponibili sulla piattaforma.
 * Richiede autenticazione tramite JWT token.
 *
 * @returns {Promise<Array>} Array contenente gli oggetti torneo disponibili
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getAllTornei() {
    try {
        const response = await fetchWithAuth(`${TORNEI_API_URL}/tornei`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch tornei:", error);
        return [];
    }
}
