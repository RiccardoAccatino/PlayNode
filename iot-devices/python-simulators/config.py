import paho.mqtt.client as mqtt

# ==========================================
# CONFIGURAZIONE MQTT PER I SIMULATORI IOT
# ==========================================

# Indirizzo del broker MQTT a cui i simulatori devono connettersi.
# Usare l'IP locale (127.0.0.1) se il broker Mosquitto gira sulla stessa macchina.
# Usare l'IP della macchina host (es. 192.168.1.11) se i simulatori girano su un dispositivo esterno.
#BROKER   = "192.168.1.11"   # IP del host su cui gira l'edge (es. Windows in LAN)
BROKER   = "127.0.0.1"       # IP locale del broker mosquitto

# Porta standard per la connessione MQTT non crittografata
PORT     = 1883

# Credenziali di accesso per il broker Mosquitto
MQTT_USER = "edge_service"
MQTT_PASSWORD = "service"

# Topic MQTT su cui il simulatore pubblicherà i punteggi
TOPIC    = "bocce/punteggio"


# ==========================================
# FUNZIONI DI UTILITA'
# ==========================================

def get_mqtt_client():
    """
    Crea, configura e restituisce un client MQTT connesso al broker.
    
    Ritorna:
        client (paho.mqtt.client.Client): L'istanza del client connessa e pronta.
    """
    # Inizializza il client MQTT
    client = mqtt.Client()
    
    # Imposta le credenziali (username e password) definite sopra
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    
    # Avvia la connessione sincrona verso il broker
    client.connect(BROKER, PORT)
    
    return client