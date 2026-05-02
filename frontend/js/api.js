/**
 * Questo modulo centralizza tutte le chiamate di rete (HTTP) verso le API del backend Java.
 */

/**
 * L'indirizzo di base per tutte le chiamate al backend.
 *
 * @constant {string}
 */
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Effettua una richiesta di Login al backend (auth-service) inviando le credenziali dell'utente.
 * Utilizza fetch in modo asincrono per attendere la risposta del server.
 *
 * @param {string} email - L'email inserita dall'utente nel modulo.
 * @param {string} password - La password inserita dall'utente in chiaro (verrà cifrata o gestita dal backend).
 * @returns {Promise<Object>} Una Promise che si risolve con i dati dell'utente (es. token JWT, dati profilo) restituiti dal server.
 * @throws {Error} Lancia un errore se il server restituisce uno stato di errore (es. 401 Non Autorizzato) o se la rete è offline.
 */
export async function loginUser(email, password) {
    try {
        // fetch avvia la richiesta HTTP. "await" mette in pausa la funzione finché il server non risponde.
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST', // Usiamo POST perché stiamo inviando dati sensibili nel corpo della richiesta
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

        // Verifichiamo se il codice di stato HTTP è un successo (es. 200 OK)
        if (!response.ok) {
            // Se non è ok (es. 401 o 404), generiamo un errore per interrompere il flusso
            throw new Error('Credenziali non valide o errore del server');
        }

        // Se la risposta è OK (200), convertiamo la risposta del server in un oggetto JavaScript
        const userData = await response.json();

        // Restituiamo i dati in modo che chi ha chiamato la funzione (es. login.js) possa usarli
        return userData;

    } catch (error) {
        console.error("Errore di rete durante il login:", error);
        throw error; // Passiamo l'errore al file login.js per mostrare il messaggio a schermo
    }
}