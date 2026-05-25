import json
import time
from ultralytics import YOLO
import config
import cv2
import math

# Connessione al broker MQTT locale
client = config.get_mqtt_client()

def distanza(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def calcola_punteggio(boccino, bocce_blu, bocce_rosse):
    if not bocce_blu and not bocce_rosse:
        return None, 0, [], []

    # Calcola tutte le distanze tupla --> [(0,distanza),(1,distanza)]
    dist_blu   = [(b, distanza(boccino, b)) for b in bocce_blu]
    dist_rosse = [(b, distanza(boccino, b)) for b in bocce_rosse]

    # Ordina per distanza
    dist_blu.sort(key=lambda x: x[1])
    dist_rosse.sort(key=lambda x: x[1])

    # Chi è più vicino?
    min_blu   = dist_blu[0][1]   if dist_blu   else float('inf')
    min_rossa = dist_rosse[0][1] if dist_rosse else float('inf')

    # Assegno i punti in base a quante bocce sono più vicine al boccino rispetto all'avversario
    if min_blu < min_rossa:
        punti = sum(1 for _, d in dist_blu if d < min_rossa)
        return "BLU", punti, dist_blu, dist_rosse
    else:
        punti = sum(1 for _, d in dist_rosse if d < min_blu)
        return "ROSSO", punti, dist_blu, dist_rosse

# Caricamento Modello
model = YOLO("best.pt")

# Passaggio a stream video (0 = webcam predefinita su Raspberry)
cap = cv2.VideoCapture(0)

# --- VARIABILI PER IL TIMER DI DEBOUNCE ---
DEBOUNCE_TIME = 3.0  # Secondi in cui la situazione deve rimanere stabile prima di inviare
tempo_inizio_stabilita = None
round_pubblicato = False

print("Avvio stream telecamera... Premi 'q' per uscire.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Errore nella lettura della webcam.")
        break

    risultati = model(frame, verbose=False)

    bocce_blu   = []
    bocce_rosse = []
    boccino     = None

    # --- RACCOGLI LE POSIZIONI E DISEGNA I BOX ---
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

    # Contiamo quante bocce ci sono fisicamente in campo in questo preciso frame
    totale_bocce = len(bocce_blu) + len(bocce_rosse)

    # --- RESET DEL ROUND ---
    # Se i giocatori raccolgono le bocce (0 bocce rilevate), il sistema si "riarma" per la manche successiva
    if totale_bocce == 0:
        round_pubblicato = False

    # --- LOGICA DI DEBOUNCE (TIMER) ---
    # La condizione di stabilità si ha quando in campo ci sono ESATTAMENTE 4 bocce e 1 boccino
    if totale_bocce == 4 and boccino is not None:
        
        # Se è la prima volta che vede 4 bocce, fa partire il timer
        if tempo_inizio_stabilita is None:
            tempo_inizio_stabilita = time.time()  
        else:
            tempo_trascorso = time.time() - tempo_inizio_stabilita
            
            # Disegna il timer a schermo per far capire ai giocatori cosa sta succedendo
            cv2.putText(frame, f"Attendere: {tempo_trascorso:.1f}s / {DEBOUNCE_TIME}s", 
                        (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            # Se i 3 secondi sono passati senza interruzioni...
            if tempo_trascorso >= DEBOUNCE_TIME:
                
                # Disegna un pallino verde sul boccino
                cv2.circle(frame, boccino, 6, (0, 255, 0), -1)

                team, punti, dist_blu, dist_rosse = calcola_punteggio(boccino, bocce_blu, bocce_rosse)
                
                # Disegno linee delle distanze a schermo
                for i, (b, d) in enumerate(dist_blu):
                    spessore = 2 if i == 0 else 1
                    cv2.line(frame, boccino, b, (255, 0, 0), spessore)
                    cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

                for i, (b, d) in enumerate(dist_rosse):
                    spessore = 2 if i == 0 else 1
                    cv2.line(frame, boccino, b, (0, 0, 255), spessore)
                    cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # Mostra Punteggio In alto a Sinistra
                colore_team = (255, 0, 0) if team == "BLU" else (0, 0, 255)
                cv2.rectangle(frame, (0, 0), (800, 50), (0, 0, 0), -1)
                cv2.putText(frame, f"PUNTO A {team}: {punti} {'boccia' if punti == 1 else 'bocce'}!",
                            (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, colore_team, 2)
                
                # --- PUBBLICAZIONE MQTT (Solo una volta per Manche!) ---
                if not round_pubblicato and team is not None:
                    # Strutturiamo il messaggio in JSON
                    payload = {
                        "gioco": "bocce",
                        "squadra_vincitrice": team,
                        "punti": punti
                    }
                    client.publish(config.TOPIC, json.dumps(payload))
                    print(f"✅ Inviato via MQTT: {payload}")
                    round_pubblicato = True # Blocca futuri invii finché le bocce non vengono rimosse
                
                elif round_pubblicato:
                    cv2.putText(frame, "ROUND CONCLUSO - Raccogliere le bocce", 
                                (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    else:
        # Se qualcuno passa davanti, o la palla rotola (quindi i count cambiano), resetta il timer!
        tempo_inizio_stabilita = None
        
        if boccino is None:
            cv2.putText(frame, "In attesa del boccino...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        elif totale_bocce > 0 and totale_bocce != 4:
            cv2.putText(frame, f"Bocce rilevate: {totale_bocce}/4", (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)

    cv2.imshow("Bocce - PlayNode Sensor", frame)
    
    # Premi 'q' sulla tastiera per chiudere la finestra e fermare il programma
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Chiusura sicura
cap.release()
cv2.destroyAllWindows()
