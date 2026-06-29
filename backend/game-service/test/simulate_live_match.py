import requests
import time
import sys
import os

BASE_URL = os.getenv("API_BASE_URL", "http://localhost")
AUTH_URL = f'{BASE_URL}:8081/api/auth'
GAME_URL = f'{BASE_URL}:8080/api'

print("--- SIMULATORE PARTITE LIVE PLAYNODE ---")
print("Effettuo la registrazione di un utente temporaneo per simulare l'IoT...")
user_email = f"gestore_{int(time.time())}@test.com"
register_data = {
    "username": f"gestore_{int(time.time())}",
    "email": user_email,
    "password": "password123",
    "ruolo": "Gestore",
    "nome": "Simulatore",
    "sesso": "Maschio"
}
requests.post(f"{AUTH_URL}/register", json=register_data)

login_data = {"email": user_email, "password": "password123"}
res = requests.post(f"{AUTH_URL}/login", json=login_data)
if not res.ok:
    print("Login fallito! Errore:", res.text)
    sys.exit(1)

token = res.json().get("token")
headers = {"Authorization": f"Bearer {token}"}

res = requests.get(f"{GAME_URL}/partite/locale/1", headers=headers)
partite = [p for p in res.json() if p.get("stato") == "IN_CORSO"]

if not partite:
    print("Nessuna partita attiva nel Locale 1.")
    print("ATTENZIONE: Vai prima sul Frontend, entra nella pagina 'Giochi del Locale' e clicca 'Avvia partita'!")
    sys.exit(1)

partita_id = partite[-1]["id"]
print(f"-> Trovata partita attiva (ID: {partita_id}).")
print("Tieni aperta la pagina 'Partite Live' sul browser. Inizio a inviare punti...")

for i in range(1, 4):
    print(f"\n[Invio Punto {i}] Assegno un punto alla Squadra 1...")
    
    r = requests.put(f"{GAME_URL}/partite/{partita_id}/punteggio?idSquadra=1", headers=headers)
    
    if r.ok:
        data = r.json()
        print(f"-> Punto assegnato! Il backend dice che il punteggio ora è {data.get('punteggio1')} a {data.get('punteggio2')}.")
        print("-> Controlla il frontend! Si aggiornerà automaticamente entro pochi secondi.")
    else:
        print("-> Errore API:", r.text)
    
    time.sleep(6) 
print("\n-> Simulazione completata! Puoi terminare la partita dal bottone 'Termina' nel frontend.")
