from ultralytics import YOLO
import cv2
import math

def distanza(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def calcola_punteggio(boccino, bocce_blu, bocce_rosse):
    if not bocce_blu and not bocce_rosse:
        return None, 0, [], []

    # Calcola tutte le distanze
    dist_blu   = [(b, distanza(boccino, b)) for b in bocce_blu]
    dist_rosse = [(b, distanza(boccino, b)) for b in bocce_rosse]

    # Ordina per distanza
    dist_blu.sort(key=lambda x: x[1])
    dist_rosse.sort(key=lambda x: x[1])

    # Chi è più vicino?
    min_blu   = dist_blu[0][1]   if dist_blu   else float('inf')
    min_rossa = dist_rosse[0][1] if dist_rosse else float('inf')

    if min_blu < min_rossa:
        # Blu vince — conta quante blu sono più vicine di tutte le rosse
        punti = sum(1 for _, d in dist_blu if d < min_rossa)
        return "BLU", punti, dist_blu, dist_rosse
    else:
        # Rosso vince — conta quante rosse sono più vicine di tutte le blu
        punti = sum(1 for _, d in dist_rosse if d < min_blu)
        return "ROSSO", punti, dist_blu, dist_rosse

model = YOLO("best.pt")

frame = cv2.imread("bocce_2.jpg")
risultati = model(frame, verbose=False)

bocce_blu   = []
bocce_rosse = []
boccino     = None

# --- RACCOGLI LE POSIZIONI ---
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

# --- CALCOLA PUNTEGGIO ---
if boccino is not None:
    cv2.circle(frame, boccino, 6, (0, 255, 0), -1)

    team, punti, dist_blu, dist_rosse = calcola_punteggio(boccino, bocce_blu, bocce_rosse)

    # Disegna linee e distanze
    for i, (b, d) in enumerate(dist_blu):
        # Prima boccia blu = più vicina
        spessore = 2 if i == 0 else 1
        cv2.line(frame, boccino, b, (255, 0, 0), spessore)
        cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    for i, (b, d) in enumerate(dist_rosse):
        spessore = 2 if i == 0 else 1
        cv2.line(frame, boccino, b, (0, 0, 255), spessore)
        cv2.putText(frame, f"{d:.0f}px", (b[0] + 10, b[1]),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # --- MOSTRA PUNTEGGIO IN ALTO ---
    if team == "BLU":
        colore_team = (255, 0, 0)
    else:
        colore_team = (0, 0, 255)

    cv2.rectangle(frame, (0, 0), (800, 50), (0, 0, 0), -1)  # sfondo nero
    cv2.putText(frame, f"PUNTO A {team}: {punti} {'boccia' if punti == 1 else 'bocce'}!",
                (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, colore_team, 2)

else:
    cv2.putText(frame, "Boccino non trovato",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

cv2.imshow("Bocce", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()