import json
import time
import threading
from ultralytics import YOLO
import config
import cv2
import math

# Connessione al broker MQTT locale
client = config.get_mqtt_client()

# ==========================================
# STATO PARTITA (gestito via MQTT)
# ==========================================
ID_GIOCO_FISICO = 3  # ID di questa pista da bocce nel  db

TOPIC_INIZIO_PARTITA = "playnode/bocce/+/inizio_partita"

stato_lock = threading.Lock()
partita_attiva = False
id_partita_corrente = None

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(" Connesso al Broker MQTT (CV Bocce)!")
        client.subscribe(TOPIC_INIZIO_PARTITA)
        print(f" In ascolto comandi inizio/fine partita su: {TOPIC_INIZIO_PARTITA}")
    else:
        print(f" Connessione MQTT fallita. Codice errore: {rc}")

def on_message(client, userdata, msg):
    global partita_attiva, id_partita_corrente

    # -----------------------------------------------------
    # Estraiamo l'ID del gioco fisico dal topic: playnode/bocce/{id}/inizio_partita
    # -----------------------------------------------------
    parti_topic = msg.topic.split("/")
    if len(parti_topic) != 4:
        return

    try:
        id_gioco_ricevuto = int(parti_topic[2])
    except ValueError:
        return

    # Ignoriamo qualsiasi comando destinato ad altre piste/tavoli
    if id_gioco_ricevuto != ID_GIOCO_FISICO:
        return

    try:
        dati = json.loads(msg.payload.decode('utf-8'))
    except json.JSONDecodeError:
        return

    stato = dati.get("stato")

    with stato_lock:
        if stato == "inizio":
            partita_attiva = True
            id_partita_corrente = dati.get("idPartita")
            print(f"\n[MQTT] Ricevuto comando di INIZIO partita per il gioco {ID_GIOCO_FISICO}. ID Partita: {id_partita_corrente}")
        elif stato == "fine":
            partita_attiva = False
            id_partita_corrente = None
            print(f"\n[MQTT] Ricevuto comando di FINE partita per il gioco {ID_GIOCO_FISICO}. Torno in stato idle.")

client.on_connect = on_connect
client.on_message = on_message
client.loop_start()  # Loop MQTT in background, non blocca il video

def distanza(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def calcola_punteggio(boccino, bocce_blu, bocce_rosse):
    if not bocce_blu and not bocce_rosse:
        return None, 0, [], []

    dist_blu   = [(b, distanza(boccino, b)) for b in bocce_blu]
    dist_rosse = [(b, distanza(boccino, b)) for b in bocce_rosse]

    dist_blu.sort(key=lambda x: x[1])
    dist_rosse.sort(key=lambda x: x[1])

    min_blu   = dist_blu[0][1]   if dist_blu   else float('inf')
    min_rossa = dist_rosse[0][1] if dist_rosse else float('inf')

    if min_blu < min_rossa:
        punti = sum(1 for _, d in dist_blu if d < min_rossa)
        return "BLU", punti, dist_blu, dist_rosse
    else:
        punti = sum(1 for _, d in dist_rosse if d < min_blu)
        return "ROSSO", punti, dist_blu, dist_rosse

# Caricamento Modello
model = YOLO("best2.pt")

# Passaggio a stream video (0 = webcam predefinita su Raspberry)
cap = cv2.VideoCapture(0)

# --- VARIABILI PER IL TIMER DI DEBOUNCE ---
DEBOUNCE_TIME = 3.0  # Secondi in cui la situazione deve rimanere stabile prima di inviare
tempo_inizio_stabilita = None
round_pubblicato = False

print("Avvio stream telecamera... In attesa del comando di inizio partita. Premi 'q' per uscire.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Errore nella lettura della webcam.")
        break

    with stato_lock:
        attiva_ora = partita_attiva
        id_partita_ora = id_partita_corrente

    # -----------------------------------------------------
    # STATO IDLE: nessuna partita attiva -> nessuna detection, nessuna pubblicazione
    # -----------------------------------------------------
    if not attiva_ora:
        # Reset di eventuali stati residui della partita precedente
        tempo_inizio_stabilita = None
        round_pubblicato = False

        cv2.rectangle(frame, (0, 0), (800, 50), (0, 0, 0), -1)
        cv2.putText(frame, "IN ATTESA DI INIZIO PARTITA...",
                    (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 165, 255), 2)

        cv2.imshow("Bocce - PlayNode Sensor", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        continue  # Salta tutta la logica di detection/punteggio

    # -----------------------------------------------------
    # STATO ATTIVO: partita in corso -> logica normale di detection
    # -----------------------------------------------------
    risultati = model(frame, verbose=False)

    bocce_blu   = []
    bocce_rosse = []
    boccino     = None

    for r in risultati:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            classe = model.names[int(box.cls)]
            confidenza = float(box.conf)

            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            if "blue" in classe:
                bocce_blu.append((cx, cy))
                colore = (255, 0, 0)
            elif "red" in classe:
                bocce_rosse.append((cx, cy))
                colore = (0, 0, 255)
            else:
                boccino = (cx, cy)
                colore = (0, 255, 0)

            cv2.rectangle(frame, (x1, y1), (x2, y2), colore, 2)
            cv2.putText(frame, f"{classe} {confidenza:.0%}",
                        (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colore, 2)

    totale_bocce = len(bocce_blu) + len(bocce_rosse)

    # --- RESET DEL ROUND ---
    if totale_bocce == 0:
        round_pubblicato = False

    # --- LOGICA DI DEBOUNCE (TIMER) ---
    if totale_bocce == 4 and boccino is not None:

        if tempo_inizio_stabilita is None:
            tempo_inizio_stabilita = time.time()
        else:
            tempo_trascorso = time.time() - tempo_inizio_stabilita

            cv2.putText(frame, f"Attendere: {tempo_trascorso:.1f}s / {DEBOUNCE_TIME}s",
                        (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            if tempo_trascorso >= DEBOUNCE_TIME:

                cv2.circle(frame, boccino, 6, (0, 255, 0), -1)

                team, punti, dist_blu, dist_rosse = calcola_punteggio(boccino, bocce_blu, bocce_rosse)

                for i, (b, d) in enumerate(dist_blu):
                    spessore = 2 if i == 0 else 1
                    cv2.line(frame, boccino, b, (255, 0, 0), spessore)
                    cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

                for i, (b, d) in enumerate(dist_rosse):
                    spessore = 2 if i == 0 else 1
                    cv2.line(frame, boccino, b, (0, 0, 255), spessore)
                    cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                colore_team = (255, 0, 0) if team == "BLU" else (0, 0, 255)
                cv2.rectangle(frame, (0, 0), (800, 50), (0, 0, 0), -1)
                cv2.putText(frame, f"PUNTO A {team}: {punti} {'boccia' if punti == 1 else 'bocce'}!",
                            (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, colore_team, 2)

                # --- PUBBLICAZIONE MQTT (Solo una volta per Manche!) ---
                if not round_pubblicato and team is not None:
                    payload = {
                        "gioco": "bocce",
                        "idPartita": id_partita_ora,
                        "squadra_vincitrice": team,
                        "punti": punti
                    }
                    client.publish(config.TOPIC, json.dumps(payload))
                    print(f"✅ Inviato via MQTT: {payload}")
                    round_pubblicato = True

                elif round_pubblicato:
                    cv2.putText(frame, "ROUND CONCLUSO - Raccogliere le bocce",
                                (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    else:
        tempo_inizio_stabilita = None

        if boccino is None:
            cv2.putText(frame, "In attesa del boccino...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        elif totale_bocce > 0 and totale_bocce != 4:
            cv2.putText(frame, f"Bocce rilevate: {totale_bocce}/4", (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)

    cv2.imshow("Bocce - PlayNode Sensor", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Chiusura sicura
cap.release()
cv2.destroyAllWindows()
client.loop_stop()
client.disconnect()