import paho.mqtt.client as mqtt
# --- CONFIGURAZIONE MQTT ---
BROKER   = "192.168.1.11"   
PORT     = 1883
MQTT_USER = "edge_service"
MQTT_PASSWORD = "service"

TOPIC    = "bocce/punteggio"
#CONNESSIONE AL BROKER 
def get_mqtt_client():
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    client.connect(BROKER, PORT)
    return client