import json
import time
import requests
import paho.mqtt.client as mqtt

# ==========================================
# 1. CONFIGURAZIONI MQTT (Rete Locale/Centrale)
# ==========================================
MQTT_BROKER = "127.0.0.1" 
MQTT_PORT = 1883
MQTT_USER = "edge_service"
MQTT_PASSWORD = "service"

# ID Fisico di questa pista da bocce nel Database (adattalo al tuo DB)
ID_GIOCO_FISICO = 1  

# Topic in ascolto
MQTT_TOPIC_PUNTEGGIO = "bocce/punteggio"
MQTT_TOPIC_COMANDI = f"edge/gioco/{ID_GIOCO_FISICO}/comandi"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
API_BASE_URL = "http://127.0.0.1:8080" 

# La variabile ora parte da None (Nessuna partita in corso) e verrà popolata dal backend
PARTITA_ATTIVA = None

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
        # Ci iscriviamo a ENTRAMBI i topic
        client.subscribe(MQTT_TOPIC_PUNTEGGIO)
        client.subscribe(MQTT_TOPIC_COMANDI)
        print(f"🎧 In ascolto punteggi su: {MQTT_TOPIC_PUNTEGGIO}")
        print(f"🎧 In ascolto comandi su: {MQTT_TOPIC_COMANDI}")
    else:
        print(f"❌ Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITA_ATTIVA
    payload = msg.payload.decode('utf-8')

    try:
        dati = json.loads(payload)

        # CASO A: Il Backend ci dice che è iniziata o finita una partita
                if msg.topic == MQTT_TOPIC_COMANDI:
                    if "nuova_partita_id" in dati:
                        PARTITA_ATTIVA = dati["nuova_partita_id"]
                        print(f"\n🔄 [COMANDO SERVER] Nuova partita avviata! ID aggiornato a: {PARTITA_ATTIVA}")
                    elif "termina_partita" in dati: # AGGIUNGI QUESTO
                        PARTITA_ATTIVA = None
                        print("\n🛑 [COMANDO SERVER] Partita terminata. Punti bloccati.")

        # CASO B: La telecamera OpenCV ci invia un punteggio
        elif msg.topic == MQTT_TOPIC_PUNTEGGIO:
            print(f"\n📩 [MQTT LOCALE] Ricevuto punteggio: {payload}")
            
            if PARTITA_ATTIVA is None:
                print("⚠️ Ignorato: Nessuna partita attualmente attiva sul server.")
                return

            team_vincente = dati.get("squadra_vincitrice")
            punti = dati.get("punti", 0)
            id_squadra = MAPPA_SQUADRE.get(team_vincente)

            if not id_squadra:
                print(f"⚠️ Errore: Colore squadra '{team_vincente}' non mappato nel sistema.")
                return

            # Chiamate REST
            for i in range(punti):
                url = f"{API_BASE_URL}/api/partite/{PARTITA_ATTIVA}/punteggio"
                parametri = {"idSquadra": id_squadra}
                try:
                    risposta = requests.put(url, params=parametri, timeout=5)
                    if risposta.status_code == 200:
                        print(f"   ☁️ [REST] Punto {i+1}/{punti} registrato sulla partita ID {PARTITA_ATTIVA}!")
                    else:
                        print(f"   ❌ [REST] Errore dal server: {risposta.status_code}")
                    time.sleep(0.2)
                except requests.exceptions.RequestException as req_err:
                    print(f"   🚨 [REST] Errore di connessione al backend: {req_err}")

    except json.JSONDecodeError:
        pass # Ignoriamo messaggi non JSON

# ==========================================
# 4. AVVIO
# ==========================================
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Avvio Edge Bridge...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura Edge Bridge.")
    client.disconnect()
