const GAME_API_URL = 'http://192.168.1.25:8080/api';
const AUTH_API_URL = 'http://192.168.1.25:8081/api/auth';
const AUTH_SERVICE_URL = 'http://192.168.1.25:8081/api';
const STATS_API_URL = 'http://192.168.1.25:8082/api';
const TORNEI_API_URL = 'http://192.168.1.25:8083/api';

/**
 * Converte una Response HTTP non-ok in un Error con messaggio leggibile.
 * @param {Response} response
 * @returns {Promise<Error>}
 */
async function parseApiError(response) {
    const status = response.status;
    let detail = '';
    try {
        const body = await response.text();
        if (body) detail = body;
    } catch (_) { /* ignore */ }

    const base = detail || `HTTP ${status}`;
    switch (status) {
        case 400: return new Error(`Richiesta non valida (400): ${base}`);
        case 404: return new Error(`Risorsa non trovata (404): ${base}`);
        case 405: return new Error(`Metodo non consentito (405): ${base}`);
        case 500: return new Error(`Errore interno del server (500): ${base}`);
        default: return new Error(`Errore API (${status}): ${base}`);
    }
}

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
        try { document.dispatchEvent(new CustomEvent('cgp:session-expired')); } catch (e) { /* ignore */ }
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
/** Utenti — auth-service /api/utenti */
export async function getAllUtenti() {
    const response = await fetchWithAuth(`${AUTH_SERVICE_URL}/utenti`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function getUtenteById(id) {
    const response = await fetchWithAuth(`${AUTH_SERVICE_URL}/utenti/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function createUtente(userData) {
    const response = await fetchWithAuth(`${AUTH_SERVICE_URL}/utenti`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function updateUtente(id, userData) {
    const response = await fetchWithAuth(`${AUTH_SERVICE_URL}/utenti/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function deleteUtente(id) {
    const response = await fetchWithAuth(`${AUTH_SERVICE_URL}/utenti/${id}`, {
        method: 'DELETE'
    });
    if (response.status === 404) return false;
    if (!response.ok) throw await parseApiError(response);
    return true;
}

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
/**
 * Statistiche: vista SQL statistica_utente.
 * GET /api/statistiche/{utenteId} — restituisce sempre 200 (zeri se utente nuovo).
 */
export async function getUserStats(utenteId) {
    const response = await fetchWithAuth(`${STATS_API_URL}/statistiche/${utenteId}`);
    if (response.status === 404) {
        return {
            utenteId: Number(utenteId),
            partiteGiocate: 0, vittorie: 0, punteggioTotale: 0,
            nomeGioco: null, idLocale: null
        };
    }
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Ottiene lo storico delle partite di un utente specifico.
 * Richiede autenticazione tramite JWT token.
 *
 * @param {string|number} utenteId - L'ID univoco dell'utente dello storico da ottenere
 * @returns {Promise<Array>} Array contenente lo storico delle partite dell'utente
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
/**
 * Storico partite da vista SQL storico_partita.
 * GET /api/storico/utente/{utenteId}
 */
export async function getUserHistory(utenteId) {
    const response = await fetchWithAuth(`${STATS_API_URL}/storico/utente/${utenteId}`);
    if (response.status === 404) return [];
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Ottiene l'elenco di tutti i locali disponibili sulla piattaforma.
 * Richiede autenticazione tramite JWT token.
 *
 * @returns {Promise<Array>} Array contenente gli oggetti locale disponibili
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getAllLocali() {
    const response = await fetchWithAuth(`${GAME_API_URL}/locali`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function getLocaleById(idLocale) {
    const response = await fetchWithAuth(`${GAME_API_URL}/locali/${idLocale}`);
    if (response.status === 404) return null;
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function createLocale(localeData) {
    const response = await fetchWithAuth(`${GAME_API_URL}/locali`, {
        method: 'POST',
        body: JSON.stringify(localeData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function updateLocale(idLocale, localeData) {
    const response = await fetchWithAuth(`${GAME_API_URL}/locali/${idLocale}`, {
        method: 'PUT',
        body: JSON.stringify(localeData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function deleteLocale(idLocale) {
    const response = await fetchWithAuth(`${GAME_API_URL}/locali/${idLocale}`, {
        method: 'DELETE'
    });
    if (response.status === 404) return false;
    if (!response.ok) throw await parseApiError(response);
    return true;
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
    const response = await fetchWithAuth(`${GAME_API_URL}/locali/${idLocale}/giochi`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Ottiene l'elenco di tutte le partite disponibili sulla piattaforma.
 * Richiede autenticazione tramite JWT token.
 *
 * @returns {Promise<Array>} Array contenente gli oggetti partita disponibili
 * @throws {Error} Se si verifica un errore durante la chiamata API
 */
export async function getAllPartite() {
    const response = await fetchWithAuth(`${GAME_API_URL}/partite`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
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
    const response = await fetchWithAuth(`${TORNEI_API_URL}/tornei`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Recupera tutti i tornei.
 * * @returns {Promise<Array>} Array contenente gli oggetti torneo
 */
export async function getAllTournaments() {
    return await getAllTornei();
}

/**
 * Crea un nuovo torneo nel database tramite il tournament-service.
 * Sfrutta fetchWithAuth per iniettare automaticamente il token JWT e gli header.
 *
 * @param {Object} tournamentData - Oggetto con i dati del torneo (es. nome, tipoGioco, stato)
 * @returns {Promise<Object>} La risposta del server con il torneo appena creato
 * @throws {Error} Se il salvataggio fallisce
 */
export async function createTournament(tournamentData) {
    const response = await fetchWithAuth(`${TORNEI_API_URL}/tornei`, {
        method: 'POST',
        body: JSON.stringify(tournamentData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Aggiorna un torneo esistente
 */
export async function updateTournament(id, tournamentData) {
    const response = await fetchWithAuth(`${TORNEI_API_URL}/tornei/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tournamentData)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

export async function deleteTournament(id) {
    const response = await fetchWithAuth(`${TORNEI_API_URL}/tornei/${id}`, {
        method: 'DELETE'
    });
    if (response.status === 404) return false;
    if (!response.ok) throw await parseApiError(response);
    return true;
}

/**
 * Ottiene l'elenco di tutte le tipologie di gioco dal database.
 */
export async function getAllTipologieGioco() {
    const response = await fetchWithAuth(`${GAME_API_URL}/tipologie-gioco`);
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}


export async function createTipologiaGioco(datiGioco) {
    const response = await fetchWithAuth(`${GAME_API_URL}/tipologie-gioco`, {
        method: 'POST',
        body: JSON.stringify(datiGioco)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}


/**
 * Avvia una nuova partita per un gioco installato (nel locale).
 * Endpoint backend: POST /api/partite/avvia/{idGiocoInstallato}
 *
 * @param {string|number} idGiocoInstallato - ID del gioco installato
 * @returns {Promise<Object|null>} PartitaDTO o null in caso di errore
 */
export async function avviaPartita(idGiocoInstallato) {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/partite/avvia/${idGiocoInstallato}`, {
            method: 'POST'
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Errore avvio partita:", error);
        return null;
    }
}

/**
 * Termina/forza la chiusura di una partita in corso.
 * Endpoint backend: PUT /api/partite/{idPartita}/termina
 *
 * @param {string|number} idPartita - ID della partita da terminare
 * @returns {Promise<Object|null>} PartitaDTO aggiornata (ora TERMINATA) o null
 */
export async function terminaPartita(idPartita) {
    const response = await fetchWithAuth(`${GAME_API_URL}/partite/${idPartita}/termina`, {
        method: 'PUT'
    });
    if (response.status === 404) return null;
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Recupera gli eventi IoT (e quindi il punteggio live) di una partita.
 * Usato dalla UI per leggere i goal/punti generati dai sensori Edge.
 * Endpoint backend: GET /api/iot/partita/{idPartita}
 *
 * @param {string|number} idPartita - ID della partita
 * @returns {Promise<Array>} Lista di EventoIot [{id, idPartita, idSensore, valore, timestamp, ...}]
 */
export async function getEventiPartita(idPartita) {
    const response = await fetchWithAuth(`${GAME_API_URL}/iot/partita/${idPartita}`);
    if (response.status === 404) return [];
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Ottiene l'elenco di tutti i giochi fisici (tavoli) installati sulla piattaforma.
 * Per ottenere questo dato facciamo il fan-out su tutti i locali e aggreghiamo i giochi.
 * Se il backend non espone direttamente un endpoint per tutti i giochi,
 * possiamo comunque usarlo come fallback a livello di singolo locale.
 *
 * @returns {Promise<Array>} Array di GiocoInstallatoDTO aggregati da tutti i locali
 */
export async function getAllGiochiInstallati() {
    const locali = await getAllLocali();
    if (!locali || locali.length === 0) return [];

    const results = await Promise.all(locali.map(l => getGiochiByLocale(l.id)));

    const flat = [];
    results.forEach((giochi, idx) => {
        const locale = locali[idx];
        if (Array.isArray(giochi)) {
            giochi.forEach(g => flat.push({
                ...g,
                localeNome: locale.nome,
                localeId: locale.id
            }));
        }
    });
    return flat;
}


/**
 * Recupera tutti i sensori configurati per una tipologia di gioco.
 * @param {number} tipologiaId
 * @returns {Promise<Array>}
 */
export async function getSensoriByTipologia(tipologiaId) {
    const response = await fetchWithAuth(`${GAME_API_URL}/sensori/tipologia/${tipologiaId}`);
    if (response.status === 404) return [];
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Recupera i sensori installati su un tavolo fisico.
 * Endpoint backend: GET /api/sensori/gioco/{giocoFisicoId}
 * @param {number} giocoFisicoId
 * @returns {Promise<Array>}
 */
export async function getSensoriByGioco(giocoFisicoId) {
    const response = await fetchWithAuth(`${GAME_API_URL}/sensori/gioco/${giocoFisicoId}`);
    if (response.status === 404) return [];
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Crea un nuovo sensore IoT su un gioco fisico.
 * Endpoint backend: POST /api/sensori
 * Body richiesto: { idGiocoFisico, tipo, posizione }
 * @param {Object} sensoreData
 * @returns {Promise<Object>}
 */
export async function createSensore(sensoreData) {
    const payload = {
        idGiocoFisico: sensoreData.idGiocoFisico,
        tipo: sensoreData.tipo,
        posizione: sensoreData.posizione || sensoreData.nomeSensore
    };
    const response = await fetchWithAuth(`${GAME_API_URL}/sensori`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw await parseApiError(response);
    return await response.json();
}

/**
 * Elimina un sensore (Non implementato)
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function deleteSensore(id) {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/sensori/${id}`, { method: 'DELETE' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Abilita / disabilita un sensore (toggle).
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function toggleSensore(id) {
    try {
        const response = await fetchWithAuth(`${GAME_API_URL}/sensori/${id}/toggle`, { method: 'PATCH' });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/** Monitor endpoints */
export async function getMonitorSummary() {
    const res = await fetchWithAuth(`${GAME_API_URL}/monitor/summary`);
    if (!res.ok) throw await parseApiError(res);
    return await res.json();
}

export async function getMonitorLatencies() {
    const res = await fetchWithAuth(`${GAME_API_URL}/monitor/latencies`);
    if (!res.ok) throw await parseApiError(res);
    return await res.json();
}

export async function getMonitorLogs() {
    const res = await fetchWithAuth(`${GAME_API_URL}/monitor/logs`);
    if (!res.ok) throw await parseApiError(res);
    return await res.json();
}

