import requests
import json
import time

BASE_URL = 'http://localhost'
AUTH_URL = f'{BASE_URL}:8081/api/auth'
GAME_URL = f'{BASE_URL}:8080/api'
STATS_URL = f'{BASE_URL}:8082/api'

# 1. Register a test user
print("Registering gestore user...")
register_data = {
    "username": f"gestore_{int(time.time())}",
    "email": f"gestore_{int(time.time())}@test.com",
    "password": "password",
    "ruolo": "Gestore",
    "nome": "Test Gestore",
    "sesso": "Maschio"
}
res = requests.post(f"{AUTH_URL}/register", json=register_data)
if res.status_code not in (200, 201):
    print("Registration failed, might exist already:", res.text)
else:
    print("Registration OK")

# 2. Login
print("Logging in...")
login_data = {
    "email": register_data["email"],
    "password": "password"
}
res = requests.post(f"{AUTH_URL}/login", json=login_data)
if not res.ok:
    print("Login failed:", res.text)
    exit(1)

data = res.json()
token = data.get("token")
print("Login OK. Token received.")

headers = {"Authorization": f"Bearer {token}"}

# 3. Create a locale and a game just in case we need them, or get existing
print("Fetching locali...")
res = requests.get(f"{GAME_URL}/locali", headers=headers)
locali = res.json()
if not locali:
    print("No locali found, creating one...")
    res = requests.post(f"{GAME_URL}/locali", json={"nome": "Test Locale", "indirizzo": "Via Roma"}, headers=headers)
    locale = res.json()
    locale_id = locale["id"]
else:
    locale_id = locali[0]["id"]
print(f"Using Locale ID: {locale_id}")

print("Fetching giochi for locale...")
res = requests.get(f"{GAME_URL}/locali/{locale_id}/giochi", headers=headers)
giochi = res.json()
if not giochi:
    print("No giochi installati for locale. Creating tipologia & gioco...")
    # Create tipologia
    res = requests.post(f"{GAME_URL}/tipologie-gioco", json={"nome": "Calciobalilla Test"}, headers=headers)
    tipologia = res.json()
    tip_id = tipologia.get("id") or 1
    gioco_installato_id = 1 # fallback
else:
    gioco_id_field = "idGiocoInstallato" if "idGiocoInstallato" in giochi[0] else ("id" if "id" in giochi[0] else "id_gioco_installato")
    gioco_installato_id = giochi[0][gioco_id_field]

print(f"Using GiocoInstallato ID: {gioco_installato_id}")

# 4. Start Match
print("Avvio partita...")
res = requests.post(f"{GAME_URL}/partite/avvia/{gioco_installato_id}", headers=headers)
if res.ok:
    partita = res.json()
    print("Partita avviata:", json.dumps(partita, indent=2))
    partita_id = partita.get("id") or partita.get("idPartita")
else:
    print("Failed to start partita:", res.status_code, res.text)
    # let's find an existing partita
    res = requests.get(f"{GAME_URL}/partite/locale/{locale_id}", headers=headers)
    partite = res.json()
    if partite:
        partita_id = partite[0]["id"]
        print("Using existing partita:", partita_id)
    else:
        exit(1)

# 5. Fetch live matches
print("Fetching partite live for locale...")
res = requests.get(f"{GAME_URL}/partite/locale/{locale_id}", headers=headers)
print("Partite prima del goal:", json.dumps(res.json(), indent=2))

# 6. Simulate a goal event via API
print(f"Sending goal event to partita {partita_id}...")
res = requests.post(f"{GAME_URL}/iot/evento?idPartita={partita_id}&idSensore=1&valore=GOAL", headers=headers)
print("Goal event response:", res.status_code, res.text)
time.sleep(2)

print("Fetching partite live for locale (after goal)...")
res = requests.get(f"{GAME_URL}/partite/locale/{locale_id}", headers=headers)
print("Partite dopo goal:", json.dumps(res.json(), indent=2))
