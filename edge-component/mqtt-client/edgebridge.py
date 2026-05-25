import json
import time
import requests
import paho.mqtt.client as mqtt

# ==========================================
# 1. CONFIGURAZIONI MQTT (Rete Locale)
# ==========================================
# Sostituisci con l'IP del Raspberry che fa da Broker. 
# Se esegui questo script direttamente sul Raspberry Broker, lascia "127.0.0.1"
MQTT_BROKER = "127.0.0.1" 
MQTT_PORT = 1883
MQTT_TOPIC = "bocce/punteggio"
MQTT_USER = "edge_service"
MQTT_PASSWORD = "service"

# ==========================================
# 2. CONFIGURAZIONI REST API (Cloud/Server)
# ==========================================
# Sostituisci con l'IP e la porta in cui gira il tuo backend Spring Boot
API_BASE_URL = "http://192.168.1.100:8080" 

# --- CONTESTO DELLA PARTITA ---
# In un sistema reale e completo, questo ID verrebbe aggiornato dinamicamente 
# tramite una chiamata API quando inizia una nuova partita nel locale.
PARTITA_ATTIVA = 1

# Mappatura Colori OpenCV -> ID Squadra nel Database --tabella Squadra
# Adattalo in base agli ID reali che hai nel tuo DB (es. 1=Squadra Rossa, 2=Squadra Blu)
MAPPA_SQUADRE = {
    "BLU": 1,
    "ROSSO": 2
}

# ==========================================
# 3. LOGICA DI RICEZIONE E TRADUZIONE
# ==========================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connesso al Broker MQTT con successo!")
        client.subscribe(MQTT_TOPIC)
        print(f"🎧 In ascolto dei risultati sul topic: {MQTT_TOPIC}")
    else:
        print(f"❌ Connessione fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode('utf-8')
    print(f"\n📩 [MQTT] Nuovo messaggio in entrata: {payload}")

    try:
        # Decodifichiamo il JSON inviato dalla telecamera OpenCV
        dati = json.loads(payload)
        team_vincente = dati.get("squadra_vincitrice")
        punti = dati.get("punti", 0)

        id_squadra = MAPPA_SQUADRE.get(team_vincente)

        if not id_squadra:
            print(f"⚠️ Errore: Colore squadra '{team_vincente}' non mappato nel sistema.")
            return

        print(f"🔄 Traduzione: La squadra {team_vincente} (ID DB: {id_squadra}) ha segnato {punti} punti.")

        # --- CHIAMATA API REST VERSO SPRING BOOT ---
        # Poiché l'API attuale incrementa di 1 punto alla volta, iteriamo per il numero di punti
        for i in range(punti):
            url = f"{API_BASE_URL}/api/partite/{PARTITA_ATTIVA}/punteggio"
            parametri = {"idSquadra": id_squadra}
            
            try:
                risposta = requests.put(url, params=parametri, timeout=5)
                
                if risposta.status_code == 200:
                    print(f"   ☁️ [REST] Punto {i+1}/{punti} registrato con successo sul Server Centrale!")
                else:
                    print(f"   ❌ [REST] Errore dal server: {risposta.status_code} - {risposta.text}")
                    
                # Piccola pausa per non saturare il server con richieste istantanee
                time.sleep(0.2)
                
            except requests.exceptions.RequestException as req_err:
                print(f"   🚨 [REST] Errore di connessione al backend: {req_err}")

    except json.JSONDecodeError:
        print("⚠️ Errore: Il messaggio MQTT non è un JSON formattato correttamente.")
    except Exception as e:
        print(f"⚠️ Errore imprevisto durante l'elaborazione: {e}")

# ==========================================
# 4. AVVIO DEL SERVIZIO
# ==========================================
client = mqtt.Client()
# Decommenta queste righe se il tuo broker richiede autenticazione (come da file config.py)
# client.username_pw_set(MQTT_USER, MQTT_PASSWORD)

client.on_connect = on_connect
client.on_message = on_message

try:
    print("Avvio Edge Bridge in corso...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    # Avvia un loop infinito in ascolto per non far spegnere lo script
    client.loop_forever()
except KeyboardInterrupt:
    print("\nChiusura forzata dell'Edge Bridge.")
    client.disconnect()
except Exception as e:
    print(f"Errore critico in avvio: {e}")