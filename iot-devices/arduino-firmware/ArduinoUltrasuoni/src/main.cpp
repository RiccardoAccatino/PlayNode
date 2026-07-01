// ╔══════════════════════════════════════════════════════════════════╗
// ║        CALCIOBALILLA SMART — Arduino Uno R4 WiFi                 ║
// ║        Versione: MQTT + Display OLED + Stato IDLE                ║
// ╚══════════════════════════════════════════════════════════════════╝

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ══════════════════════════════════════════════════════════════════
//  CONFIGURAZIONE WIFI E MQTT
// ══════════════════════════════════════════════════════════════════
const char* ssid     = "TIM-51589117";
const char* password = "K57N5YuYsHHHxt3H5y6fU2NY";

IPAddress    mqttServer(192, 168, 1, 15);
const uint16_t mqttPort = 1883;
const char* mqttUser   = "arduino_calcetto";
const char* mqttPass   = "arduino";

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
const uint16_t GOL_DISTANCE_CM = 10;
const uint32_t COOLDOWN_MS     = 3000;
const uint32_t RECONNECT_MS    = 5000;
const float velocitaSuono      = 0.034645f;

// ══════════════════════════════════════════════════════════════════
//  DISPLAY OLED
// ══════════════════════════════════════════════════════════════════
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ══════════════════════════════════════════════════════════════════
//  STATO PARTITA
// ══════════════════════════════════════════════════════════════════
bool     statoIdle    = true; // Parte in stato di attesa
uint8_t  scoreA       = 0;
uint8_t  scoreB       = 0;
uint32_t lastGoalTime = 0;
uint32_t lastReconnectAttempt = 0;

float lastDistA = 0.0f;
float lastDistB = 0.0f;

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
//  FUNZIONE: Misura distanza HC-SR04
// ══════════════════════════════════════════════════════════════════
float measureCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 20000UL);

  if (duration == 0) {
    pinMode(echoPin, OUTPUT);
    digitalWrite(echoPin, LOW);
    delayMicroseconds(10);
    pinMode(echoPin, INPUT);
    return 999.0f;
  }

  return (duration * velocitaSuono) / 2.0f;
}

// ══════════════════════════════════════════════════════════════════
//  FUNZIONE: Registra il Gol
// ══════════════════════════════════════════════════════════════════
void registraGol(char team) {
  char scoreStr[8];

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

  lastGoalTime = millis();
  animazioneGoal(team);
  animazioneRimuoviPallina();
  drawScoreboard();
}

// ══════════════════════════════════════════════════════════════════
//  CALLBACK MQTT: gestisce l'Avvio/Fine Partita
// ══════════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
 
  Serial.print(F("[MQTT IN] topic="));
  Serial.print(topic);
  Serial.print(F(" payload="));
  for (unsigned int i = 0; i < length; i++) Serial.print((char)payload[i]);
  Serial.println();
  if (strcmp(topic, topicReset) == 0 && length >= 1) {
    
    // Comando '1' = INIZIA NUOVA PARTITA
    if (payload[0] == '1') {
      statoIdle = false;
      scoreA = 0;
      scoreB = 0;
      mqtt.publish(topicScoreA, "0", true);
      mqtt.publish(topicScoreB, "0", true);
      Serial.println(F(">> AVVIO PARTITA: Esco da IDLE e azzero tabellone <<"));
      drawScoreboard();
    } 
    // Comando '0' = TERMINA PARTITA E TORNA IN ATTESA
    else if (payload[0] == '0') {
      statoIdle = true;
      Serial.println(F(">> FINE PARTITA: Ritorno allo stato IDLE <<"));
      drawScoreboard();
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  FUNZIONE: Connessione MQTT
// ══════════════════════════════════════════════════════════════════
bool mqttConnect() {
  Serial.print(F("Connessione al broker MQTT... "));
  bool ok = mqtt.connect(clientId, mqttUser, mqttPass, topicStatus, 0, true, "OFFLINE");

  if (ok) {
    Serial.println(F("Connesso!"));
    mqtt.publish(topicStatus, "ONLINE", true);
    mqtt.subscribe(topicReset);

    // Se non in idle, ripristina i punteggi correnti sul broker
    if (!statoIdle) {
      char buf[8];
      itoa(scoreA, buf, 10); mqtt.publish(topicScoreA, buf, true);
      itoa(scoreB, buf, 10); mqtt.publish(topicScoreB, buf, true);
    }
  } else {
    Serial.print(F("ERRORE, rc="));
    Serial.println(mqtt.state());
  }
  return ok;
}

// ══════════════════════════════════════════════════════════════════
//  FUNZIONI GRAFICHE OLED
// ══════════════════════════════════════════════════════════════════
void drawScoreboard() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Se siamo in IDLE mostriamo la schermata di attesa
  if (statoIdle) {
    display.setTextSize(1);
    display.setCursor(26, 8);
    display.print(F("CALCIOBALILLA"));
    
    display.drawLine(0, 22, 128, 22, SSD1306_WHITE);
    
    display.setTextSize(2);
    display.setCursor(12, 38);
    display.print(F("IN ATTESA"));
    display.display();
    return;
  }

  // Altrimenti mostriamo il tabellone di gioco
  display.setTextSize(1);
  display.setCursor(40, 0);
  display.print(F("CALCETTO"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setTextSize(4);
  display.setCursor(10, 25);
  display.print(scoreA);

  display.setTextSize(2);
  display.setCursor(58, 35);
  display.print(F("-"));

  display.setTextSize(4);
  display.setCursor((scoreB < 10) ? 95 : 75, 25);
  display.print(scoreB);

  display.display();
}

void animazioneGoal(char team) {
  char label[3] = "A\0";
  if (team == 'B') label[0] = 'B';

  for (int i = 0; i < 3; i++) {
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

    display.fillScreen(SSD1306_BLACK);
    display.display();
    delay(200);
  }
}

void animazioneRimuoviPallina() {
  for (int i = 0; i < 4; i++) {
    display.clearDisplay();
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
    delay(600); 

    display.clearDisplay();
    display.display();
    delay(200);
  }
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
  
  // Allineato alla struttura esatta generata dal bridge Python
  sprintf(topicReset,  "calcetto/%s/reset",            ID_TAVOLO);
  
  sprintf(topicDistA,  "playnode/calcetto/%s/distA",   ID_TAVOLO);
  sprintf(topicDistB,  "playnode/calcetto/%s/distB",   ID_TAVOLO);
  sprintf(topicStatus, "playnode/calcetto/%s/status",  ID_TAVOLO);

  Serial.println(F("=== Calciobalilla Smart ==="));

  pinMode(TRIG_A, OUTPUT); digitalWrite(TRIG_A, LOW);
  pinMode(ECHO_A, INPUT);
  pinMode(TRIG_B, OUTPUT); digitalWrite(TRIG_B, LOW);
  pinMode(ECHO_B, INPUT);

  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    display.clearDisplay();
  }
  
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(20, 20);
  display.print(F("Connessione WiFi..."));
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println(F("\nWiFi connesso!"));

  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(mqttCallback);
  mqttConnect();

  drawScoreboard(); // Mostrerà IN ATTESA perché statoIdle = true
}

// ══════════════════════════════════════════════════════════════════
//  LOOP
// ══════════════════════════════════════════════════════════════════
void loop() {
  if (WiFi.status() != WL_CONNECTED) return;

  if (!mqtt.connected()) {
    uint32_t now = millis();
    if (now - lastReconnectAttempt > RECONNECT_MS) {
      lastReconnectAttempt = now;
      mqttConnect();
    }
    return;
  }

  mqtt.loop();

  // ── GESTIONE STATO IDLE ─────────────────────────────────────────
  // Se non c'è una partita attiva, ignoriamo i sensori per non 
  // sprecare CPU e non inondare il broker di valori inutili.
  if (statoIdle) {
    return; 
  }

  // ── Cooldown post-gol ───────────────────────────────────────────
  if (millis() - lastGoalTime < COOLDOWN_MS) {
    return;
  }

  // ── Lettura sequenziale dei sensori ─────────────────────────────
  float distA = measureCm(TRIG_A, ECHO_A);
  delay(60);
  float distB = measureCm(TRIG_B, ECHO_B);

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

  // ── Rilevamento Gol ─────────────────────────────────────────────
  if (distA > 1.0f && distA <= GOL_DISTANCE_CM) {
    registraGol('A');
  } else if (distB > 1.0f && distB <= GOL_DISTANCE_CM) {
    registraGol('B');
  }

  delay(40);
}