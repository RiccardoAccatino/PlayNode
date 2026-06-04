import json
import time
import requests
import paho.mqtt.client as mqtt

# ==========================================
# 1. CONFIGURAZIONI MQTT (Rete Locale/Centrale)
# ==========================================
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
# Opzionale: decommenta se Mosquitto richiede autenticazione
# MQTT_USER = "edge_service"
# MQTT_PASSWORD = "service"

# ID Fisico di questo calcetto nel Database (deve coincidere con quello a DB)
ID_GIOCO_FISICO = 2

# Topic in ascolto
MQTT_TOPIC_PUNTEGGIO = "calcetto/punteggio"
MQTT_TOPIC_EVENTI_IOT = "calcetto/sensori"
MQTT_TOPIC_COMANDI = f"edge/gioco/{ID_GIOCO_FISICO}/comandi"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
API_BASE_URL = "http://127.0.0.1:8080"

# Stato della partita
PARTITA_ATTIVA = None

# Mappa per tradurre il sensore del goal nell'ID della squadra a Database
MAPPA_SQUADRE = {
    "SQUADRA_BIANCA": 1,
    "SQUADRA_BLU": 2
}

# ==========================================
# 3. LOGICA DI RICEZIONE
# ==========================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connesso al Broker MQTT con successo!")
        client.subscribe(MQTT_TOPIC_PUNTEGGIO)
        client.subscribe(MQTT_TOPIC_EVENTI_IOT)
        client.subscribe(MQTT_TOPIC_COMANDI)
        print(f"🎧 In ascolto punteggi su: {MQTT_TOPIC_PUNTEGGIO}")
        print(f"🎧 In ascolto sensori IoT su: {MQTT_TOPIC_EVENTI_IOT}")
        print(f"🎧 In ascolto comandi su: {MQTT_TOPIC_COMANDI}")
    else:
        print(f"❌ Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITA_ATTIVA
    payload = msg.payload.decode('utf-8')

    try:
        dati = json.loads(payload)

        # -----------------------------------------------------
        # CASO A: Il Backend ci dice che è iniziata o finita una partita
        # -----------------------------------------------------
        if msg.topic == MQTT_TOPIC_COMANDI:
            if "nuova_partita_id" in dati:
                PARTITA_ATTIVA = dati["nuova_partita_id"]
                print(f"\n🔄 [COMANDO SERVER] Nuova partita di Calcetto avviata! ID: {PARTITA_ATTIVA}")
            elif "termina_partita" in dati:
                print(f"\n🛑 [COMANDO SERVER] Partita {PARTITA_ATTIVA} terminata dal server.")
                PARTITA_ATTIVA = None

        # -----------------------------------------------------
        # CASO B: Un sensore (es. ottico/infrarossi) rileva un GOAL
        # -----------------------------------------------------
        elif msg.topic == MQTT_TOPIC_PUNTEGGIO:
            print(f"\n⚽ [MQTT LOCALE] Ricevuto GOAL: {payload}")

            if PARTITA_ATTIVA is None:
                print("⚠️ Ignorato: Nessuna partita di calcetto attualmente attiva.")
                return

            team = dati.get("squadra")
            id_squadra = MAPPA_SQUADRE.get(team)

            if not id_squadra:
                print(f"⚠️ Errore: Squadra '{team}' non mappata nel sistema.")
                return

            # Chiamata REST per registrare il punto (PUT /api/partite/{idPartita}/punteggio)
            url = f"{API_BASE_URL}/api/partite/{PARTITA_ATTIVA}/punteggio"
            parametri = {"idSquadra": id_squadra}

            try:
                risposta = requests.put(url, params=parametri, timeout=5)
                if risposta.status_code == 200:
                    print(f"   ☁️ [REST] GOAL registrato per la squadra {team} (Partita ID {PARTITA_ATTIVA})!")
                else:
                    print(f"   ❌ [REST] Errore dal server: {risposta.status_code}")
            except requests.exceptions.RequestException as req_err:
                print(f"   🚨 [REST] Errore di connessione: {req_err}")

        # -----------------------------------------------------
        # CASO C: Un sensore invia una statistica di gioco (es. velocità tiro, fallo)
        # -----------------------------------------------------
        elif msg.topic == MQTT_TOPIC_EVENTI_IOT:
            print(f"\n📊 [MQTT LOCALE] Ricevuto evento sensore: {payload}")

            if PARTITA_ATTIVA is None:
                return

            id_sensore = dati.get("id_sensore")
            valore = dati.get("valore")

            if id_sensore and valore:
                # Chiamata REST per registrare l'evento (POST /api/iot/evento)
                url_evento = f"{API_BASE_URL}/api/iot/evento"
                params_evento = {
                    "idPartita": PARTITA_ATTIVA,
                    "idSensore": id_sensore,
                    "valore": str(valore)
                }

                try:
                    risposta_ev = requests.post(url_evento, params=params_evento, timeout=5)
                    if risposta_ev.status_code == 200:
                        print(f"   ☁️ [REST] Evento IoT registrato: Sensore {id_sensore} -> {valore}")
                except requests.exceptions.RequestException:
                    pass

    except json.JSONDecodeError:
        print("⚠️ Ricevuto payload non JSON, ignorato.")

# ==========================================
# 4. AVVIO
# ==========================================
client = mqtt.Client()
# client.username_pw_set(MQTT_USER, MQTT_PASSWORD) # Decommentare se serve auth
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Avvio Edge Bridge Calcetto...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura Edge Bridge Calcetto.")
    client.disconnect()