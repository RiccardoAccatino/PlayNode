import time
import json
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../python-simulators'))
import config

print("Avvio MOCK Bocce Elettroniche...")
client = config.get_mqtt_client()
print("Connesso al Broker MQTT locale!")

time.sleep(2)
payload = {
    "gioco": "bocce",
    "squadra_vincitrice": "ROSSO",
    "punti": 2
}
client.publish(config.TOPIC, json.dumps(payload))
print(f"-> Inviato via MQTT: {payload}")
print("Punto assegnato. Attendi 5 secondi e guarda il frontend!")

time.sleep(5)
print("Manche 2...")
payload["squadra_vincitrice"] = "BLU"
payload["punti"] = 1
client.publish(config.TOPIC, json.dumps(payload))
print(f"-> Inviato via MQTT: {payload}")

client.disconnect()
print("Simulazione terminata.")
