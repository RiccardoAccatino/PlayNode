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

# Sostituiamo gli ID singoli con le wildcard (+) per gestire più tavoli contemporaneamente
MQTT_WILDCARD_GOAL   = "playnode/calcetto/+/goal"
MQTT_WILDCARD_DIST_A = "playnode/calcetto/+/distA"
MQTT_WILDCARD_DIST_B = "playnode/calcetto/+/distB"

# Nuovo topic comandi dal Backend: playnode/{ID_LOCALE}/{ID_TIPOLOGIA_GIOCO}/{ID_GIOCO_FISICO}/comandi
# Tipologia gioco calcetto = 1
MQTT_WILDCARD_COMANDI = "playnode/+/1/+/comandi"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
API_BASE_URL = "http://192.168.1.25:8080"

# Stato delle partite: gestiamo più partite con un dizionario {id_gioco_fisico: id_partita}
PARTITE_ATTIVE = {}

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
        client.subscribe(MQTT_WILDCARD_GOAL)
        client.subscribe(MQTT_WILDCARD_DIST_A)
        client.subscribe(MQTT_WILDCARD_DIST_B)
        client.subscribe(MQTT_WILDCARD_COMANDI)
        print(f" In ascolto goal su: {MQTT_WILDCARD_GOAL}")
        print(f" In ascolto distanze su: {MQTT_WILDCARD_DIST_A} e {MQTT_WILDCARD_DIST_B}")
        print(f" In ascolto comandi su: {MQTT_WILDCARD_COMANDI}")
    else:
        print(f" Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global PARTITE_ATTIVE
    payload = msg.payload.decode('utf-8')
    topic = msg.topic
    parti_topic = topic.split("/")

    # -----------------------------------------------------
    # CASO A: Il Backend ci dice che è iniziata o finita una partita
    # Topic atteso: playnode/{ID_LOCALE}/{ID_TIPOLOGIA_GIOCO}/{ID_GIOCO_FISICO}/comandi
    # -----------------------------------------------------
    if len(parti_topic) == 5 and parti_topic[0] == "playnode" and parti_topic[4] == "comandi":
        try:
            id_locale = int(parti_topic[1])
            id_tipologia_gioco = int(parti_topic[2])
            id_gioco_fisico = int(parti_topic[3])
            
            if id_tipologia_gioco != 1:
                return # Ignora i comandi se non è un calcetto
        except ValueError:
            return

        try:
            dati = json.loads(payload) # Solo i comandi del server sono JSON
            if "nuova_partita_id" in dati:
                PARTITE_ATTIVE[id_gioco_fisico] = dati["nuova_partita_id"]
                print(f"\n[COMANDO SERVER] Nuova partita avviata sul gioco {id_gioco_fisico} (Locale: {id_locale})! ID: {PARTITE_ATTIVE[id_gioco_fisico]}")
                
                # INVIA IL RESET ALL'ARDUINO AUTOMATICAMENTE
                # Usa il formato del topic presente nel tuo script originale
                topic_reset = f"calcetto/{id_gioco_fisico}/reset"
                client.publish(topic_reset, "1")
                print(f"  Inviato comando di reset all'Arduino sul topic {topic_reset}.")
                
            elif "termina_partita" in dati:
                print(f"\n [COMANDO SERVER] Partita {PARTITE_ATTIVE.get(id_gioco_fisico)} terminata sul gioco {id_gioco_fisico}.")
                PARTITE_ATTIVE[id_gioco_fisico] = None

        except json.JSONDecodeError:
            print(" Ricevuto comando server non JSON, ignorato.")

    # -----------------------------------------------------
    # CASO B: L'Arduino rileva un GOAL
    # Topic: playnode/calcetto/{ID_GIOCO_FISICO}/goal
    # -----------------------------------------------------
    elif len(parti_topic) == 4 and parti_topic[1] == "calcetto" and parti_topic[3] == "goal":
        try:
            id_gioco_fisico = int(parti_topic[2])
        except ValueError:
            return

        partita_attiva = PARTITE_ATTIVE.get(id_gioco_fisico)
        
        print(f"\n [MQTT LOCALE] Ricevuto GOAL dal gioco {id_gioco_fisico}: Squadra {payload}")

        if partita_attiva is None:
            print(f" Ignorato: Nessuna partita di calcetto attiva sul server per il gioco {id_gioco_fisico}.")
            return

        id_squadra = MAPPA_SQUADRE.get(payload)

        if not id_squadra:
            print(f" Errore: Squadra '{payload}' non riconosciuta.")
            return

        # Chiamata REST per registrare il punto
        url = f"{API_BASE_URL}/api/partite/{partita_attiva}/punteggio"
        parametri = {"idSquadra": id_squadra}

        try:
            risposta = requests.put(url, params=parametri, timeout=5)
            if risposta.status_code == 200:
                print(f" [REST] GOAL registrato per squadra {payload} (Partita ID {partita_attiva})")
            else:
                print(f" [REST] Errore dal server: {risposta.status_code}")
        except requests.exceptions.RequestException as req_err:
            print(f" [REST] Errore di connessione: {req_err}")

    # -----------------------------------------------------
    # CASO C: L'Arduino invia le distanze rilevate
    # Topic: playnode/calcetto/{ID_GIOCO_FISICO}/distA o distB
    # -----------------------------------------------------
    elif len(parti_topic) == 4 and parti_topic[1] == "calcetto" and parti_topic[3] in ["distA", "distB"]:
        try:
            id_gioco_fisico = int(parti_topic[2])
        except ValueError:
            return

        partita_attiva = PARTITE_ATTIVE.get(id_gioco_fisico)
        
        if partita_attiva is None:
            return
            
        # Assegna un ID fittizio ai due sensori di distanza
        id_sensore = 1 if parti_topic[3] == "distA" else 2

        url_evento = f"{API_BASE_URL}/api/iot/evento"
        params_evento = {
            "idPartita": partita_attiva,
            "idSensore": id_sensore,
            "valore": str(payload)
        }

        try:
            requests.post(url_evento, params=params_evento, timeout=5)
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
    print("Avvio Edge Bridge Calcetto Multi-Tavolo...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura Edge Bridge Calcetto.")
    client.disconnect()