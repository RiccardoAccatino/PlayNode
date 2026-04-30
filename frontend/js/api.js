// frontend/js/api.js

// Definiamo l'indirizzo base del tuo backend Java.
// Se il tuo auth-service gira su una porta diversa (es. 8081), cambiala qui!
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Funzione per inviare le credenziali di login al backend.
 * Usiamo "async" perché la richiesta al server richiede tempo e dobbiamo "aspettare" (await) la risposta.
 *
 * @param {string} email - L'email inserita dall'utente
 * @param {string} password - La password inserita dall'utente
 * @returns {Object} - I dati dell'utente restituiti dal server se il login ha successo
 */
export async function loginUser(email, password) {
    try {
        // Usiamo fetch per fare una richiesta di tipo POST al tuo AuthController Java
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                // Diciamo al server che stiamo inviando dati in formato JSON
                'Content-Type': 'application/json'
            },
            // Trasformiamo l'email e la password in una stringa JSON
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Se il server risponde con un errore (es. 401 Unauthorized o 404 Not Found)
        if (!response.ok) {
            // "Lanciamo" un errore che verrà catturato dal nostro login.js
            throw new Error('Credenziali non valide o errore del server');
        }

        // Se la risposta è OK (200), convertiamo la risposta del server in un oggetto JavaScript
        const userData = await response.json();

        // Restituiamo i dati (che presumibilmente conterranno il token, il nome e il ruolo)
        return userData;

    } catch (error) {
        console.error("Errore di rete durante il login:", error);
        throw error; // Passiamo l'errore al file login.js per mostrare il messaggio a schermo
    }
}