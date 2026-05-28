const GAME_API_URL = 'http://localhost:8080/api';
const AUTH_API_URL = 'http://localhost:8081/api/auth';
const API_BASE = 'http://localhost:8082/api';

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