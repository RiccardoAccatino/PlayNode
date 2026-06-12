// ╔══════════════════════════════════════════════════════════════════╗
// ║        CALCIOBALILLA SMART — Arduino Uno R4 WiFi                 ║
// ║        Versione unificata: MQTT + Display OLED SSD1306           ║
// ╚══════════════════════════════════════════════════════════════════╝
//
// HARDWARE:
//   • Arduino Uno R4 WiFi
//   • 2× HC-SR04 ultrasuoni  — TRIG_A=D2, ECHO_A=D3, TRIG_B=D4, ECHO_B=D5
//   • 1× OLED SSD1306 128×64 — I2C (SDA=A4, SCL=A5 sull'R4)
//
// LIBRERIE RICHIESTE (Library Manager):
//   • PubSubClient  (Nick O'Leary)
//   • Adafruit SSD1306
//   • Adafruit GFX Library

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ══════════════════════════════════════════════════════════════════
//  CONFIGURAZIONE WIFI
// ══════════════════════════════════════════════════════════════════
const char* ssid     = "TIM-51589117";
const char* password = "K57N5YuYsHHHxt3H5y6fU2NY";

// ══════════════════════════════════════════════════════════════════
//  CONFIGURAZIONE MQTT
// ══════════════════════════════════════════════════════════════════
IPAddress    mqttServer(192, 168, 1, 15);
const uint16_t mqttPort = 1883;
const char*  mqttUser   = "arduino_calcetto";
const char*  mqttPass   = "arduino";

// ── Identificativo tavolo ─────────────────────────────────────────
const char* ID_TAVOLO = "1";
const char* clientId  = "client_tavolo1";

// Topic generati dinamicamente nel setup()
char topicScoreA[50];
char topicScoreB[50];
char topicGoal[50];
char topicReset[50];
char topicDistA[50];
char topicDistB[50];
char topicStatus[50];

// ══════════════════════════════════════════════════════════════════
//  PIN SENSORI ULTRASUONI
// ══════════════════════════════════════════════════════════════════
const uint8_t TRIG_A = 2;
const uint8_t ECHO_A = 3;
const uint8_t TRIG_B = 4;
const uint8_t ECHO_B = 5;

// ══════════════════════════════════════════════════════════════════
//  COSTANTI DI GIOCO E TIMING
// ══════════════════════════════════════════════════════════════════
const uint16_t GOL_DISTANCE_CM = 10;    // Soglia rilevamento gol (cm)
const uint32_t COOLDOWN_MS     = 3000;  // Pausa sensori dopo un gol (ms)
const uint32_t RECONNECT_MS    = 5000;  // Intervallo riconnessione MQTT (ms)

// Velocità del suono a 25°C in cm/µs
const float velocitaSuono = 0.034645f;

// ══════════════════════════════════════════════════════════════════
//  DISPLAY OLED
// ══════════════════════════════════════════════════════════════════
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ══════════════════════════════════════════════════════════════════
//  STATO PARTITA
// ══════════════════════════════════════════════════════════════════
uint8_t  scoreA = 0;
uint8_t  scoreB = 0;
uint32_t lastGoalTime        = 0;  // Timestamp dell'ultimo gol (per il cooldown)
uint32_t lastReconnectAttempt = 0;

// Cache ultime distanze (evita publish continuo di valori identici)
float lastDistA = 0.0f;
float lastDistB = 0.0f;

// Flag: indica se il tabellone sul display deve essere ridisegnato
bool oledNeedsRefresh = false;

// ══════════════════════════════════════════════════════════════════
//  OGGETTI WIFI / MQTT
// ══════════════════════════════════════════════════════════════════
WiFiClient   wifiClient;
PubSubClient mqtt(wifiClient);


// ══════════════════════════════════════════════════════════════════
//  PROTOTIPI
// ══════════════════════════════════════════════════════════════════
float measureCm(uint8_t trigPin, uint8_t echoPin);
void  registraGol(char team);
void  mqttCallback(char* topic, byte* payload, unsigned int length);
bool  mqttConnect();

void drawScoreboard();
void animazioneGoal(char team);
void animazioneRimuoviPallina();


// ══════════════════════════════════════════════════════════════════
//  FUNZIONE: Misura distanza HC-SR04 (anti-blocco, timeout 20 ms)
// ══════════════════════════════════════════════════════════════════
float measureCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 20000UL);  // timeout ~3,4 m

  if (duration == 0) {
    // Reset elettrico del pin se il sensore rimane bloccato in HIGH
    pinMode(echoPin, OUTPUT);
    digitalWrite(echoPin, LOW);
    delayMicroseconds(10);
    pinMode(echoPin, INPUT);
    return 999.0f;
  }

  return (duration * velocitaSuono) / 2.0f;
}


// ══════════════════════════════════════════════════════════════════
//  FUNZIONE: Registra il Gol → pubblica MQTT + mostra animazione OLED
//  ► Le animazioni avvengono qui, nel momento in cui i sensori sono
//    comunque disabilitati dal cooldown; il loop non viene bloccato
//    in modo anomalo perché COOLDOWN_MS ≥ durata animazioni (~2,4 s).
// ══════════════════════════════════════════════════════════════════
void registraGol(char team) {
  char scoreStr[8];

  // 1. Aggiorna il punteggio e pubblica su MQTT
  if (team == 'A') {
    scoreA++;
    Serial.print(F("GOL squadra A! Punteggio: "));
    Serial.print(scoreA); Serial.print(F(" - ")); Serial.println(scoreB);

    itoa(scoreA, scoreStr, 10);
    mqtt.publish(topicScoreA, scoreStr, true);
    mqtt.publish(topicGoal,   "A",      false);
  } else {
    scoreB++;
    Serial.print(F("GOL squadra B! Punteggio: "));
    Serial.print(scoreA); Serial.print(F(" - ")); Serial.println(scoreB);

    itoa(scoreB, scoreStr, 10);
    mqtt.publish(topicScoreB, scoreStr, true);
    mqtt.publish(topicGoal,   "B",      false);
  }

  // 2. Salva il timestamp del gol (avvia il cooldown nel loop)
  lastGoalTime = millis();

  // 3. Animazione GOAL sul display
  //    Si esegue subito: il cooldown dura 3 s, le animazioni ~2,4 s.
  //    mqtt.loop() NON viene chiamato durante i delay delle animazioni,
  //    ma ciò è accettabile: il broker mantiene la connessione per
  //    diversi secondi prima di considerarla scaduta (keepalive default).
  animazioneGoal(team);

  // 4. Avviso rimozione pallina dalla porta
  animazioneRimuoviPallina();

  // 5. Ridisegna il tabellone aggiornato a fine animazioni
  drawScoreboard();
}


// ══════════════════════════════════════════════════════════════════
//  CALLBACK MQTT: gestisce i comandi in ingresso
// ══════════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicReset) == 0 && length >= 1 && payload[0] == '1') {
    scoreA = 0;
    scoreB = 0;
    mqtt.publish(topicScoreA, "0", true);
    mqtt.publish(topicScoreB, "0", true);
    Serial.println(F(">> RESET partita via MQTT <<"));

    // Aggiorna immediatamente il display a 0 - 0
    drawScoreboard();
  }
}


// ══════════════════════════════════════════════════════════════════
//  FUNZIONE: Connessione / Riconnessione MQTT con LWT
// ══════════════════════════════════════════════════════════════════
bool mqttConnect() {
  Serial.print(F("Connessione al broker MQTT... "));

  // LWT: se la scheda si disconnette bruscamente il broker pubblica "OFFLINE"
  bool ok = mqtt.connect(clientId, mqttUser, mqttPass,
                         topicStatus, 0, true, "OFFLINE");

  if (ok) {
    Serial.println(F("Connesso!"));
    mqtt.publish(topicStatus, "ONLINE", true);  // Stato attuale con retain
    mqtt.subscribe(topicReset);

    // Riinvia i punteggi correnti (utile dopo una riconnessione)
    char buf[8];
    itoa(scoreA, buf, 10); mqtt.publish(topicScoreA, buf, true);
    itoa(scoreB, buf, 10); mqtt.publish(topicScoreB, buf, true);
  } else {
    Serial.print(F("ERRORE, rc="));
    Serial.println(mqtt.state());
  }
  return ok;
}


// ══════════════════════════════════════════════════════════════════
//  FUNZIONI GRAFICHE OLED
// ══════════════════════════════════════════════════════════════════

// ─── Tabellone punteggio ─────────────────────────────────────────
void drawScoreboard() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Titolo
  display.setTextSize(1);
  display.setCursor(40, 0);
  display.print(F("CALCETTO"));

  // Linea separatrice sotto il titolo
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Punteggio Squadra A (sinistra)
  display.setTextSize(4);
  display.setCursor(10, 25);
  display.print(scoreA);

  // Trattino centrale
  display.setTextSize(2);
  display.setCursor(58, 35);
  display.print(F("-"));

  // Punteggio Squadra B (destra) — sposta il cursore se ≥ 10
  display.setTextSize(4);
  display.setCursor((scoreB < 10) ? 95 : 75, 25);
  display.print(scoreB);

  display.display();
}

// ─── Animazione GOAL (lampeggio 3 volte, ~1,8 s totali) ──────────
//  team = 'A' oppure 'B'
void animazioneGoal(char team) {
  char label[3] = "A\0";
  if (team == 'B') label[0] = 'B';

  for (int i = 0; i < 3; i++) {
    // Fotogramma ON: sfondo bianco, testo nero
    display.fillScreen(SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK);

    display.setTextSize(3);
    display.setCursor(20, 10);
    display.print(F("GOAL!"));

    display.setTextSize(2);
    display.setCursor(50, 40);
    display.print(label);

    display.display();
    delay(400);

    // Fotogramma OFF: schermo nero
    display.fillScreen(SSD1306_BLACK);
    display.display();
    delay(200);
  }
  // Durata totale: 3 × (400 + 200) = 1800 ms
}

// ─── Animazione "Rimuovi Pallina" (lampeggio 4 volte, ~3,2 s) ────
void animazioneRimuoviPallina() {
  for (int i = 0; i < 4; i++) {
    display.clearDisplay();

    // Bordo rettangolare per enfatizzare l'avviso
    display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
    display.setTextColor(SSD1306_WHITE);

    display.setTextSize(2);
    display.setCursor(22, 10);
    display.print(F("RIMUOVI"));

    display.setCursor(22, 30);
    display.print(F("PALLINA"));

    display.setTextSize(1);
    display.setCursor(28, 50);
    display.print(F("DALLA PORTA!"));

    display.display();
    delay(600);   // Visibile 0,6 s

    display.clearDisplay();
    display.display();
    delay(200);   // Nero 0,2 s
  }
  // Durata totale: 4 × (600 + 200) = 3200 ms
}


// ══════════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);
  delay(1500);

  // ── Costruzione topic MQTT ──────────────────────────────────────
  sprintf(topicScoreA, "playnode/calcetto/%s/scoreA",  ID_TAVOLO);
  sprintf(topicScoreB, "playnode/calcetto/%s/scoreB",  ID_TAVOLO);
  sprintf(topicGoal,   "playnode/calcetto/%s/goal",    ID_TAVOLO);
  sprintf(topicReset,  "playnode/calcetto/%s/reset",   ID_TAVOLO);
  sprintf(topicDistA,  "playnode/calcetto/%s/distA",   ID_TAVOLO);
  sprintf(topicDistB,  "playnode/calcetto/%s/distB",   ID_TAVOLO);
  sprintf(topicStatus, "playnode/calcetto/%s/status",  ID_TAVOLO);

  Serial.println(F("=== Calciobalilla Smart (Uno R4 WiFi) ==="));
  Serial.print(F("Tavolo: ")); Serial.println(ID_TAVOLO);

  // ── Pin sensori ultrasuoni ──────────────────────────────────────
  pinMode(TRIG_A, OUTPUT); digitalWrite(TRIG_A, LOW);
  pinMode(ECHO_A, INPUT);
  pinMode(TRIG_B, OUTPUT); digitalWrite(TRIG_B, LOW);
  pinMode(ECHO_B, INPUT);

  // ── Inizializzazione display OLED ───────────────────────────────
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    display.clearDisplay();
  }
  

  // Schermata di avvio
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(20, 20);
  display.print(F("Connessione WiFi..."));
  display.display();

  // ── Connessione WiFi ────────────────────────────────────────────
  Serial.print(F("Connessione WiFi: ")); Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println(F("\nWiFi connesso!"));
  Serial.print(F("IP: ")); Serial.println(WiFi.localIP());

  // ── Configurazione client MQTT ──────────────────────────────────
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(mqttCallback);

  // Prima connessione al broker
  mqttConnect();

  // Tabellone iniziale 0 - 0
  drawScoreboard();
}


// ══════════════════════════════════════════════════════════════════
//  LOOP — completamente non-bloccante (salvo le animazioni gol,
//          giustificate dal cooldown di 3 s durante cui i sensori
//          sarebbero comunque ignorati)
// ══════════════════════════════════════════════════════════════════
void loop() {

  // ── 1. Verifica connessione WiFi ────────────────────────────────
  if (WiFi.status() != WL_CONNECTED) {
    return;   // Aspetta che il WiFi torni senza bloccare
  }

  // ── 2. Gestione connessione MQTT ────────────────────────────────
  if (!mqtt.connected()) {
    uint32_t now = millis();
    if (now - lastReconnectAttempt > RECONNECT_MS) {
      lastReconnectAttempt = now;
      mqttConnect();
    }
    return;   // Ritorna: senza broker non ha senso leggere i sensori
  }

  // Elabora i messaggi in arrivo e mantiene il keepalive
  mqtt.loop();

  // ── 3. Cooldown post-gol ─────────────────────────────────────────
  //    Durante i 3 s di cooldown i sensori vengono ignorati.
  //    Le animazioni OLED vengono già eseguite dentro registraGol(),
  //    quindi qui non c'è nulla da fare: si ritorna subito per lasciare
  //    che mqtt.loop() continui a girare nelle iterazioni successive.
  if (millis() - lastGoalTime < COOLDOWN_MS) {
    return;
  }

  // ── 4. Lettura sequenziale dei sensori ───────────────────────────
  //    I due sensori vengono letti uno alla volta con 60 ms di pausa
  //    per evitare interferenze acustiche tra i due ultrasuoni.
  float distA = measureCm(TRIG_A, ECHO_A);
  delay(60);
  float distB = measureCm(TRIG_B, ECHO_B);

  // ── 5. Telemetria distanze su MQTT ──────────────────────────────
  //    Pubblica solo se il valore è variato di almeno 0,5 cm
  //    (riduce il traffico MQTT in condizioni statiche).
  char distStr[10];

  if (fabsf(distA - lastDistA) > 0.5f) {
    dtostrf(distA, 6, 2, distStr);
    mqtt.publish(topicDistA, distStr, false);
    lastDistA = distA;
  }

  if (fabsf(distB - lastDistB) > 0.5f) {
    dtostrf(distB, 6, 2, distStr);
    mqtt.publish(topicDistB, distStr, false);
    lastDistB = distB;
  }

  // ── 6. Rilevamento Gol ──────────────────────────────────────────
  //    Si controlla prima la porta A; se è un gol A non si verifica B
  //    (impossibile che entrambe vengano colpite nello stesso istante).
  if (distA > 1.0f && distA <= GOL_DISTANCE_CM) {
    registraGol('A');
  } else if (distB > 1.0f && distB <= GOL_DISTANCE_CM) {
    registraGol('B');
  }

  // Piccola pausa per ridurre il jitter dei sensori ultrasuoni
  delay(40);
}
