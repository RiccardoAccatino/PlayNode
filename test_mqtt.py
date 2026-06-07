import json
import time
import paho.mqtt.client as mqtt

# --- CONFIGURAZIONE ---
BROKER_IP = "192.168.1.15"
PORTA = 1883
TOPIC = "edge/gioco/1/comandi"

# 🔑 INSERISCI QUI LE STESSE CREDENZIALI CHE HAI NEL FILE .ENV DI DOCKER
MQTT_USER = "admin"      # Sostituisci con il valore di ${MQTT_USER}
MQTT_PASSWORD = "admin"  # Sostituisci con il valore di ${MQTT_PASSWORD}

PAYLOAD = {
    "nuova_partita_id": 50
}

# --- FUNZIONI DI CALLBACK (Aggiornate a Paho v2) ---
def on_connect(client, userdata, flags, rc, properties=None):
    """ Viene chiamata automaticamente quando ci si connette al broker """
    if rc == 0:
        print("✅ Connesso con successo al Broker MQTT!")
    else:
        print(f"❌ Errore di connessione. Codice di ritorno: {rc}")
        if rc == 5:
            print("👉 Suggerimento: Errore di Autenticazione! Controlla Username e Password.")

def on_publish(client, userdata, mid, reason_code=None, properties=None):
    """ Viene chiamata quando il messaggio è stato effettivamente pubblicato """
    print("📤 Messaggio inviato con successo e preso in carico dal broker!")

# --- SCRIPT PRINCIPALE ---
if __name__ == "__main__":
    print(f"Tentativo di connessione autenticata a {BROKER_IP}:{PORTA}...")

    # Inizializza il client usando le nuove API v2 di Paho
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

    # Associa le credenziali per fare il login su Mosquitto
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)

    # Collega le funzioni di controllo
    client.on_connect = on_connect
    client.on_publish = on_publish

    try:
        client.connect(BROKER_IP, PORTA, 60)

        client.loop_start()
        time.sleep(1)

        json_messaggio = json.dumps(PAYLOAD)

        print(f"Sto inviando il messaggio sul topic [{TOPIC}]...")
        client.publish(TOPIC, json_messaggio, qos=1)

        time.sleep(2)

        client.loop_stop()
        client.disconnect()
        print("🏁 Procedura completata. Connessione chiusa.")

    except Exception as e:
        print(f"❌ Errore durante l'esecuzione dello script: {e}")