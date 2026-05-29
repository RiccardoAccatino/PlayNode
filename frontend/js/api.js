const GAME_API_URL = 'http://localhost:8080/api';
const AUTH_API_URL = 'http://localhost:8081/api/auth';
const STATS_API_URL = 'http://localhost:8082/api';
const TORNEI_API_URL = 'http://localhost:8083/api';

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

export async function registerUser(userData) {
    try {
        // CORREZIONE: Usa AUTH_API_URL e chiama /register
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
 * Stats Service - Statistiche utente
 * GET /api/statistiche/{utenteId}
 */
export async function getUserStats(utenteId) {
    try {
        const response = await fetch(`${STATS_API_URL}/statistiche/${utenteId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
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
 * Stats Service - Storico partite utente
 * GET /api/storico/utente/{utenteId}
 */
export async function getUserHistory(utenteId) {
    try {
        const response = await fetch(`${STATS_API_URL}/storico/utente/${utenteId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch storico:", error);
        return [];
    }
}

/**
 * Game Service - Tutti i locali
 * GET /api/locali
 */
export async function getAllLocali() {
    try {
        const response = await fetch(`${GAME_API_URL}/locali`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch locali:", error);
        return [];
    }
}

/**
 * Game Service - Giochi in un locale
 * GET /api/locali/{idLocale}/giochi
 */
export async function getGiochiByLocale(idLocale) {
    try {
        const response = await fetch(`${GAME_API_URL}/locali/${idLocale}/giochi`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch giochi:", error);
        return [];
    }
}

/**
 * Game Service - Tutte le partite
 * GET /api/partite
 */
export async function getAllPartite() {
    try {
        const response = await fetch(`${GAME_API_URL}/partite`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch partite:", error);
        return [];
    }
}

/**
 * Game Service - Eventi IoT di una partita
 * GET /api/iot/partita/{idPartita}
 */
export async function getEventiByPartita(idPartita) {
    try {
        const response = await fetch(`${GAME_API_URL}/iot/partita/${idPartita}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch eventi:", error);
        return [];
    }
}

/**
 * Tournament Service - Tutti i tornei
 * GET /api/tornei
 */
export async function getAllTornei() {
    try {
        const response = await fetch(`${TORNEI_API_URL}/tornei`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch tornei:", error);
        return [];
    }
}
