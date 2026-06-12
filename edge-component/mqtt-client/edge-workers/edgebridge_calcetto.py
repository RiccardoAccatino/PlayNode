import json
import time
import requests
import paho.mqtt.client as mqtt

# ==========================================
# 1. CONFIGURAZIONI MQTT (Rete Locale/Centrale)
# ==========================================
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_USER = "arduino_calcetto" 
MQTT_PASSWORD = "arduino"

# ID Fisico di questo calcetto nel Database Server
ID_GIOCO_FISICO = 1
# ID del tavolo configurato nello sketch Arduino
ID_TAVOLO_ARDUINO = "1"

# Topic in ascolto coerenti con firmware Arduino
MQTT_TOPIC_GOAL = f"playnode/calcetto/{ID_TAVOLO_ARDUINO}/goal"
MQTT_TOPIC_DIST_A = f"playnode/calcetto/{ID_TAVOLO_ARDUINO}/distA"
MQTT_TOPIC_DIST_B = f"playnode/calcetto/{ID_TAVOLO_ARDUINO}/distB"

# Topic comandi dal Backend
MQTT_TOPIC_COMANDI = f"edge/gioco/{ID_GIOCO_FISICO}/comandi"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
API_BASE_URL = "http://192.168.1.25:8080"

# Stato della partita
PARTITA_ATTIVA = None

# Mappa per tradurre il payload di Arduino ('A' o 'B') nell'ID della squadra a Database
MAPPA_SQUADRE = {
    "A": 1,
    "B": 2
}

# ==========================================
# 3. LOGICA DI RICEZIONE
# ==========================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connesso al Broker MQTT con successo!")
        client.subscribe(MQTT_TOPIC_GOAL)
        client.subscribe(MQTT_TOPIC_DIST_A)
        client.subscribe(MQTT_TOPIC_DIST_B)
        client.subscribe(MQTT_TOPIC_COMANDI)
        print(f" In ascolto goal su: {MQTT_TOPIC_GOAL}")
        print(f" In ascolto distanze su: {MQTT_TOPIC_DIST_A} e {MQTT_TOPIC_DIST_B}")
        print(f" In ascolto comandi su: {MQTT_TOPIC_COMANDI}")
    else:
        print(f" Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITA_ATTIVA
    payload = msg.payload.decode('utf-8')
    topic = msg.topic

    # -----------------------------------------------------
    # CASO A: Il Backend ci dice che è iniziata o finita una partita
    # -----------------------------------------------------
    if topic == MQTT_TOPIC_COMANDI:
        try:
            dati = json.loads(payload) # Solo i comandi del server sono JSON
            if "nuova_partita_id" in dati:
                PARTITA_ATTIVA = dati["nuova_partita_id"]
                print(f"\n[COMANDO SERVER] Nuova partita avviata! ID: {PARTITA_ATTIVA}")
                
                # INVIA IL RESET ALL'ARDUINO AUTOMATICAMENTE
                topic_reset = f"calcetto/{ID_TAVOLO_ARDUINO}/reset"
                client.publish(topic_reset, "1")
                print(f"  Inviato comando di reset all'Arduino sul topic {topic_reset}.")
                
            elif "termina_partita" in dati:
                print(f"\n [COMANDO SERVER] Partita {PARTITA_ATTIVA} terminata.")
                PARTITA_ATTIVA = None
        except json.JSONDecodeError:
            print(" Ricevuto comando server non JSON, ignorato.")

    # -----------------------------------------------------
    # CASO B: L'Arduino rileva un GOAL
    # -----------------------------------------------------
    elif topic == MQTT_TOPIC_GOAL:
        print(f"\n [MQTT LOCALE] Ricevuto GOAL: Squadra {payload}")

        if PARTITA_ATTIVA is None:
            print(" Ignorato: Nessuna partita di calcetto attiva sul server.")
            return

        id_squadra = MAPPA_SQUADRE.get(payload)

        if not id_squadra:
            print(f" Errore: Squadra '{payload}' non riconosciuta.")
            return

        # Chiamata REST per registrare il punto
        url = f"{API_BASE_URL}/api/partite/{PARTITA_ATTIVA}/punteggio"
        parametri = {"idSquadra": id_squadra}

        try:
            risposta = requests.put(url, params=parametri, timeout=5)
            if risposta.status_code == 200:
                print(f" [REST] GOAL registrato per squadra {payload} (Partita ID {PARTITA_ATTIVA})")
            else:
                print(f" [REST] Errore dal server: {risposta.status_code}")
        except requests.exceptions.RequestException as req_err:
            print(f" [REST] Errore di connessione: {req_err}")

    # -----------------------------------------------------
    # CASO C: L'Arduino invia le distanze rilevate
    # -----------------------------------------------------
    elif topic in [MQTT_TOPIC_DIST_A, MQTT_TOPIC_DIST_B]:
        # Se serve vedere debug continuo
        # print(f"[MQTT] Sensore {topic} -> {payload} cm")
        
        if PARTITA_ATTIVA is None:
            return
            
        # Assegna un ID fittizio ai due sensori di distanza
        id_sensore = 1 if topic == MQTT_TOPIC_DIST_A else 2

        url_evento = f"{API_BASE_URL}/api/iot/evento"
        params_evento = {
            "idPartita": PARTITA_ATTIVA,
            "idSensore": id_sensore,
            "valore": str(payload)
        }

        try:
            requests.post(url_evento, params=params_evento, timeout=5)
            # Volendo puoi stampare conferma, ma per le distanze genererebbe troppo spam a terminale
        except requests.exceptions.RequestException:
            pass


# ==========================================
# 4. AVVIO
# ==========================================
client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Avvio Edge Bridge Calcetto...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura Edge Bridge Calcetto.")
    client.disconnect()