import json
import time
import requests
import paho.mqtt.client as mqtt

# ==========================================
# 1. CONFIGURAZIONI MQTT (Rete Locale/Centrale)
# ==========================================
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_USER = "cv_bocce"
MQTT_PASSWORD = "bocce"

# Topic in ascolto
MQTT_TOPIC_PUNTEGGIO = "playnode/bocce/punteggio"
MQTT_TOPIC_COMANDI = "playnode/server/comandi"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
API_BASE_URL = "http://MacBook-Pro-di-Francesco.local:8080"

# La partita attiva e l'ID del gioco fisico ora vengono POPOLATI dal backend
# tramite il payload ricevuto su playnode/server/comandi, non più hardcodati.
PARTITA_ATTIVA = None
ID_GIOCO_ATTIVO = None

MAPPA_SQUADRE = {
    "BLU": 1,
    "ROSSO": 2
}

# ==========================================
# 3. LOGICA DI RICEZIONE
# ==========================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connesso al Broker MQTT con successo!")
        client.subscribe(MQTT_TOPIC_PUNTEGGIO)
        client.subscribe(MQTT_TOPIC_COMANDI)
        print(f" In ascolto punteggi su: {MQTT_TOPIC_PUNTEGGIO}")
        print(f" In ascolto comandi su: {MQTT_TOPIC_COMANDI}")
    else:
        print(f" Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITA_ATTIVA, ID_GIOCO_ATTIVO
    payload = msg.payload.decode('utf-8')

    try:
        dati = json.loads(payload)

        # -----------------------------------------------------
        # CASO A: Il Backend ci dice che è iniziata o finita una partita
        # Topic: playnode/server/comandi
        # Payload atteso: {"idGiocoFisico":2, "nuova_partita_id":xx}
        # oppure: {"idGiocoFisico":2, "termina_partita": true}
        # -----------------------------------------------------
        if msg.topic == MQTT_TOPIC_COMANDI:
            id_gioco_fisico = dati.get("idGiocoFisico")

            # Se il comando non contiene idGiocoFisico, lo ignoriamo
            if id_gioco_fisico is None:
                return

            if "nuova_partita_id" in dati:
                PARTITA_ATTIVA = dati["nuova_partita_id"]
                ID_GIOCO_ATTIVO = id_gioco_fisico
                print(f"\n[COMANDO SERVER] Nuova partita avviata sul gioco {ID_GIOCO_ATTIVO}! ID Partita: {PARTITA_ATTIVA}")

                # INVIA IL SEGNALE DI INIZIO PARTITA AL COMPONENTE EDGE (telecamera OpenCV)
                topic_inizio = f"playnode/bocce/{id_gioco_fisico}/inizio_partita"
                messaggio_inizio = json.dumps({"idPartita": PARTITA_ATTIVA, "stato": "inizio"})
                client.publish(topic_inizio, messaggio_inizio)
                print(f"  Inviato segnale di inizio partita all'edge sul topic {topic_inizio}.")

            elif "termina_partita" in dati:
                # Confermiamo che il comando riguardi il gioco attualmente attivo
                if id_gioco_fisico != ID_GIOCO_ATTIVO:
                    return

                print(f"\n[COMANDO SERVER] Partita {PARTITA_ATTIVA} terminata sul gioco {ID_GIOCO_ATTIVO}.")

                topic_fine = f"playnode/bocce/{id_gioco_fisico}/inizio_partita"
                messaggio_fine = json.dumps({"stato": "fine"})
                client.publish(topic_fine, messaggio_fine)
                print(f"  Inviato segnale di fine partita all'edge sul topic {topic_fine}.")

                PARTITA_ATTIVA = None
                ID_GIOCO_ATTIVO = None

        # -----------------------------------------------------
        # CASO B: La telecamera OpenCV ci invia un punteggio
        # -----------------------------------------------------
        elif msg.topic == MQTT_TOPIC_PUNTEGGIO:
            print(f"\n[MQTT LOCALE] Ricevuto punteggio: {payload}")

            if PARTITA_ATTIVA is None:
                print(" Ignorato: Nessuna partita attualmente attiva sul server.")
                return

            team_vincente = dati.get("squadra_vincitrice")
            punti = dati.get("punti", 0)
            id_squadra = MAPPA_SQUADRE.get(team_vincente)

            if not id_squadra:
                print(f" Errore: Colore squadra '{team_vincente}' non mappato nel sistema.")
                return

            # Chiamate REST
            for i in range(punti):
                url = f"{API_BASE_URL}/api/partite/{PARTITA_ATTIVA}/punteggio"
                parametri = {"idSquadra": id_squadra}
                try:
                    risposta = requests.put(url, params=parametri, timeout=5)
                    if risposta.status_code == 200:
                        print(f"    [REST] Punto {i+1}/{punti} registrato sulla partita ID {PARTITA_ATTIVA}!")
                    else:
                        print(f"    [REST] Errore dal server: {risposta.status_code}")
                    time.sleep(0.2)
                except requests.exceptions.RequestException as req_err:
                    print(f"    [REST] Errore di connessione al backend: {req_err}")

    except json.JSONDecodeError:
        pass  # Ignoriamo messaggi non JSON

# ==========================================
# 4. AVVIO
# ==========================================
client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Avvio Edge Bridge Bocce...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura Edge Bridge Bocce.")
    client.disconnect()