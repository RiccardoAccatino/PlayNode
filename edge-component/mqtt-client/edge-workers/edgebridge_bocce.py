import json
import time
import requests
import paho.mqtt.client as mqtt
import os


# 1. CONFIGURAZIONI MQTT (Rete Locale/Centrale)

MQTT_BROKER = os.getenv("MQTT_BROKER", "127.0.0.1")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_USER = os.getenv("MQTT_USER", "cv_bocce")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "bocce")

# ID Fisico di questa pista da bocce nel Database (adattalo al tuo DB)
ID_GIOCO_FISICO = int(os.getenv("ID_GIOCO_FISICO", 3))
ID_COMPONENTE_EDGE = int(os.getenv("ID_COMPONENTE_EDGE", 1))
LOCALE_SLUG = os.getenv("LOCALE_SLUG", "locale")

# Topic in ascolto
MQTT_TOPIC_PUNTEGGIO = "bocce/punteggio"
MQTT_TOPIC_COMANDI = f"edge/gioco/{ID_GIOCO_FISICO}/comandi"
MQTT_TOPIC_HEARTBEAT = f"locale/{LOCALE_SLUG}/edge/status"


# 2. CONFIGURAZIONI REST API (Cloud/Server)

#API_BASE_URL = "http://MacBook-Pro-di-Francesco.local:8080"
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")

# La variabile ora parte da None (Nessuna partita in corso) e verrà popolata dal backend
PARTITA_ATTIVA = None

MAPPA_SQUADRE = {
    "BLU": 1,
    "ROSSO": 2
}


# 3. LOGICA DI RICEZIONE

def invia_heartbeat(client):
    payload = json.dumps({"idComponenteEdge": ID_COMPONENTE_EDGE, "stato": "Online"})
    client.publish(MQTT_TOPIC_HEARTBEAT, payload, qos=1)
    try:
        requests.post(
            f"{API_BASE_URL}/api/iot/heartbeat",
            params={"idComponenteEdge": ID_COMPONENTE_EDGE},
            timeout=3
        )
    except requests.exceptions.RequestException:
        pass

def heartbeat_loop(client):
    while True:
        time.sleep(30)
        try:
            invia_heartbeat(client)
        except Exception:
            pass

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f" Connesso al Broker MQTT con successo!")
        client.subscribe(MQTT_TOPIC_PUNTEGGIO)
        client.subscribe(MQTT_TOPIC_COMANDI)
        invia_heartbeat(client)
        import threading
        threading.Thread(target=heartbeat_loop, args=(client,), daemon=True).start()
        print(f" In ascolto punteggi su: {MQTT_TOPIC_PUNTEGGIO}")
        print(f" In ascolto comandi su: {MQTT_TOPIC_COMANDI}")
    else:
        print(f" Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITA_ATTIVA
    payload = msg.payload.decode('utf-8')

    try:
        dati = json.loads(payload)

        # CASO A: Il Backend ci dice che è iniziata o finita una partita
        if msg.topic == MQTT_TOPIC_COMANDI:
            if "nuova_partita_id" in dati:
                PARTITA_ATTIVA = dati["nuova_partita_id"]
                print(f"\n [COMANDO SERVER] Nuova partita avviata! ID aggiornato a: {PARTITA_ATTIVA}")
            elif "termina_partita" in dati:
                PARTITA_ATTIVA = None
                print("\n [COMANDO SERVER] Partita terminata. Punti bloccati.")

        # CASO B: La telecamera OpenCV ci invia un punteggio
        elif msg.topic == MQTT_TOPIC_PUNTEGGIO:
            print(f"\n [MQTT LOCALE] Ricevuto punteggio: {payload}")
            
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
        pass # Ignoriamo messaggi non JSON


# 4. AVVIO

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

if __name__ == "__main__":
    try:
        print("Avvio Edge Bridge...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\nChiusura Edge Bridge.")
        client.disconnect()
