import json
import time
import argparse
import os
import paho.mqtt.client as mqtt

"""
SCRIPT DI DIAGNOSTICA MQTT
--------------------------
Questo script funge da strumento di test manuale per verificare che il broker 
MQTT (Mosquitto) sia in esecuzione, raggiungibile sulla rete e che accetti 
correttamente le credenziali di autenticazione.

Esempio di utilizzo da riga di comando:
python test_mqtt.py --ip 127.0.0.1 --topic "playnode/server/comandi"
"""

# --- FUNZIONI DI CALLBACK ---
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("✅ [MQTT] Connesso con successo al Broker!")
    else:
        print(f"❌ [MQTT] Errore di connessione. Codice di ritorno: {rc}")
        if rc == 5:
            print("👉 Suggerimento: Errore di Autenticazione! Controlla Username e Password.")

def on_publish(client, userdata, mid, reason_code=None, properties=None):
    print("📤 [MQTT] Messaggio pubblicato ed elaborato dal broker con successo!")

def main():
    parser = argparse.ArgumentParser(description="Strumento di test per connessioni MQTT")
    parser.add_argument("--ip", type=str, default=os.getenv("MQTT_HOST", "127.0.0.1"), help="IP del broker MQTT")
    parser.add_argument("--port", type=int, default=1883, help="Porta del broker MQTT")
    parser.add_argument("--topic", type=str, default="edge/gioco/1/comandi", help="Topic su cui pubblicare")
    parser.add_argument("--user", type=str, default=os.getenv("MQTT_USER", "admin"), help="Username MQTT")
    parser.add_argument("--password", type=str, default=os.getenv("MQTT_PASSWORD", "admin"), help="Password MQTT")
    args = parser.parse_args()

    print("=" * 40)
    print(f"🔧 DIAGNOSTICA MQTT")
    print(f"Broker: {args.ip}:{args.port}")
    print(f"Topic:  {args.topic}")
    print("=" * 40)

    # Payload di test predefinito
    payload_di_test = {
        "nuova_partita_id": 999,
        "timestamp": int(time.time()),
        "messaggio": "Test diagnostico"
    }

    # Inizializza il client usando le nuove API v2 di Paho
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    
    # Associa le credenziali (Mosquitto in produzione richiede auth)
    client.username_pw_set(args.user, args.password)
    
    # Collega le callback
    client.on_connect = on_connect
    client.on_publish = on_publish

    try:
        print("Tentativo di connessione...")
        client.connect(args.ip, args.port, 60)
        client.loop_start()

        # Attendi che la connessione si stabilisca
        time.sleep(1)

        json_messaggio = json.dumps(payload_di_test)
        print(f"Inviando payload: {json_messaggio}")
        
        # QOS 1 garantisce la ricezione da parte del broker
        client.publish(args.topic, json_messaggio, qos=1)
        
        # Attendi per elaborare i callback di risposta
        time.sleep(2)

    except ConnectionRefusedError:
        print("❌ [ERRORE CRITICO] Connessione rifiutata. Il broker è spento o l'IP è errato?")
    except Exception as e:
        print(f"❌ Errore imprevisto durante l'esecuzione: {e}")
    finally:
        print("Chiusura client...")
        client.loop_stop()
        client.disconnect()
        print("🏁 Test diagnostico concluso.")

if __name__ == "__main__":
    main()