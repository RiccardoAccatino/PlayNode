#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ── Configurazione WiFi ──────────────────────────────────────
const char* ssid     = "TIM-51589117"; 
const char* password = "K57N5YuYsHHHxt3H5y6fU2NY";

// ── Configurazione MQTT (Allineata alle tue ACL) ──────────────
IPAddress mqttServer(192, 168, 1, 15);  // IP del tuo broker MQTT
const uint16_t mqttPort   = 1883;
const char* mqttUser   = "arduino_calcetto"; // Utente configurato nell'aclfile
const char* mqttPass   = "arduino";  // Password associata all'utente

// ── Identificativo Tavolo e Client ───────────────────────────
const char* ID_TAVOLO = "tavolo1"; 
const char* clientId  = "client_tavolo1"; 

char topicScoreA[50];
char topicScoreB[50];
char topicGoal[50];
char topicReset[50];
char topicDistA[50]; 
char topicDistB[50]; 
char topicStatus[50]; // <-- NUOVO: Topic per lo stato di connessione

// ── Pin Sensori Ultrasonici ──────────────────────────────────
const uint8_t TRIG_A = 2;
const uint8_t ECHO_A = 3;
const uint8_t TRIG_B = 4;
const uint8_t ECHO_B = 5;

// ── Soglie, Costanti Fisiche e Timing ────────────────────────
const uint16_t GOL_DISTANCE_CM  = 10;   // Distanza massima per rilevare il gol
const uint32_t COOLDOWN_MS      = 3000; // Pausa di 3 secondi dopo un gol
const uint32_t RECONNECT_MS     = 5000; // Intervallo tentativi di riconnessione

// Velocità del suono calcolata esattamente per i 25°C della tua stanza (cm/µs)
const float velocitaSuono = 0.034645; 

// ── Stato Partita ────────────────────────────────────────────
uint8_t  scoreA = 0;
uint8_t  scoreB = 0;
uint32_t lastGoalTime = 0;
uint32_t lastReconnectAttempt = 0;

// Variabili per evitare di pubblicare valori identici continuamente
float lastDistA = 0.0;
float lastDistB = 0.0;

WiFiClient    wifiClient;
PubSubClient  mqtt(wifiClient);

// ═══════════════════════════════════════════════════════════════
//  Funzione: Misura distanza HC-SR04 con anti-blocco a 25°C
// ═══════════════════════════════════════════════════════════════
float measureCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // pulseIn con TIMEOUT a 20ms (~3.4 metri max) per non piantare l'R4
  long duration = pulseIn(echoPin, HIGH, 20000); 
  
  if (duration == 0) {
    // Reset elettrico del pin in caso di blocco hardware del sensore
    pinMode(echoPin, OUTPUT);
    digitalWrite(echoPin, LOW);
    delayMicroseconds(10);
    pinMode(echoPin, INPUT);
    return 999.0; 
  }

  return (duration * velocitaSuono) / 2.0;
}

// ═══════════════════════════════════════════════════════════════
//  Funzione: Registra e pubblica il Gol
// ═══════════════════════════════════════════════════════════════
void registraGol(char team) {
  char scoreStr[8];

  if (team == 'A') {
    scoreA++;
    Serial.print(F("GOL squadra A! Punteggio: "));
    Serial.print(scoreA); Serial.print(" - "); Serial.println(scoreB);

    itoa(scoreA, scoreStr, 10);
    mqtt.publish(topicScoreA, scoreStr, true); // retain = true
    mqtt.publish(topicGoal,   "A",      false);
  } else {
    scoreB++;
    Serial.print(F("GOL squadra B! Punteggio: "));
    Serial.print(scoreA); Serial.print(" - "); Serial.println(scoreB);

    itoa(scoreB, scoreStr, 10);
    mqtt.publish(topicScoreB, scoreStr, true);
    mqtt.publish(topicGoal,   "B",      false);
  }

  lastGoalTime = millis();
}

// ═══════════════════════════════════════════════════════════════
//  Callback MQTT in ingresso (Comando di Reset specifico per tavolo)
// ═══════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicReset) == 0 && length >= 1 && payload[0] == '1') {
    scoreA = 0;
    scoreB = 0;
    mqtt.publish(topicScoreA, "0", true);
    mqtt.publish(topicScoreB, "0", true);
    Serial.println(F(">> RESET partita via MQTT <<"));
  }
}

// ═══════════════════════════════════════════════════════════════
//  Connessione / Riconnessione MQTT
// ═══════════════════════════════════════════════════════════════
bool mqttConnect() {
  Serial.print(F("Connessione al broker MQTT... "));
  bool ok;
  
  // Connessione includendo le credenziali e il "Testamento" (LWT) su topicStatus
  // Se la scheda si disconnette bruscamente, il broker pubblicherà "OFFLINE" con retain=true
  if (strlen(mqttUser) > 0) {
    ok = mqtt.connect(clientId, mqttUser, mqttPass, topicStatus, 0, true, "OFFLINE");
  } else {
    ok = mqtt.connect(clientId, NULL, NULL, topicStatus, 0, true, "OFFLINE");
  }

  if (ok) {
    Serial.println(F("Connesso!"));
    
    // <-- MODIFICA: Invia il messaggio di successo (ONLINE) appena connesso
    mqtt.publish(topicStatus, "ONLINE", true); // retain = true così l'ultimo stato rimane memorizzato
    
    mqtt.subscribe(topicReset); // Si iscrive solo al reset del proprio tavolo
    
    // Invia i punteggi attuali al momento della connessione
    char buf[8];
    itoa(scoreA, buf, 10); mqtt.publish(topicScoreA, buf, true);
    itoa(scoreB, buf, 10); mqtt.publish(topicScoreB, buf, true);
  } else {
    Serial.print(F("ERRORE, rc="));
    Serial.println(mqtt.state());
  }
  return ok;
}

// ═══════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);
  delay(1500); 
  
  // Generazione automatica dei sotto-topic sotto la radice 'calcetto'
  sprintf(topicScoreA, "calcetto/%s/scoreA", ID_TAVOLO);
  sprintf(topicScoreB, "calcetto/%s/scoreB", ID_TAVOLO);
  sprintf(topicGoal,   "calcetto/%s/goal",   ID_TAVOLO);
  sprintf(topicReset,  "calcetto/%s/reset",  ID_TAVOLO);
  sprintf(topicDistA,  "calcetto/%s/distA",  ID_TAVOLO); 
  sprintf(topicDistB,  "calcetto/%s/distB",  ID_TAVOLO); 
  sprintf(topicStatus, "calcetto/%s/status", ID_TAVOLO); // <-- Inizializzazione nuovo topic

  Serial.println(F("=== Calciobalilla Smart MQTT (Uno R4 WiFi) ==="));
  Serial.print(F("Configurato come: ")); Serial.println(ID_TAVOLO);

  // Configurazione Pin
  pinMode(TRIG_A, OUTPUT); pinMode(ECHO_A, INPUT);
  pinMode(TRIG_B, OUTPUT); pinMode(ECHO_B, INPUT); 
  digitalWrite(TRIG_A, LOW);
  digitalWrite(TRIG_B, LOW); 

  // Connessione WiFi integrato
  Serial.print(F("Connessione a rete WiFi: "));
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println(F("\nWiFi Connesso!"));

  // Configurazione Server MQTT
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(mqttCallback);
}

// ═══════════════════════════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return; 
  }

  if (!mqtt.connected()) {
    uint32_t now = millis();
    if (now - lastReconnectAttempt > RECONNECT_MS) {
      lastReconnectAttempt = now;
      mqttConnect();
    }
  } else {
    mqtt.loop();
  }

  // Blocco temporaneo se è appena stato fatto un gol
  if (millis() - lastGoalTime < COOLDOWN_MS) return;

  // Lettura sequenziale (evita che i sensori si accechino a vicenda)
  float distA = measureCm(TRIG_A, ECHO_A);
  delay(60); 
  float distB = measureCm(TRIG_B, ECHO_B);

  // Pubblicazione distanze su MQTT (solo se connesse e se il valore varia di almeno 0.5cm)
  if (mqtt.connected()) {
    char distStr[10];

    if (abs(distA - lastDistA) > 0.5) {
      dtostrf(distA, 6, 2, distStr); 
      mqtt.publish(topicDistA, distStr, false);
      lastDistA = distA;
    }

    if (abs(distB - lastDistB) > 0.5) {
      dtostrf(distB, 6, 2, distStr);
      mqtt.publish(topicDistB, distStr, false);
      lastDistB = distB;
    }
  }

  // Controllo Gol Porta A
  if (distA > 1.0 && distA <= GOL_DISTANCE_CM) {
    registraGol('A');
  } 
  // Controllo Gol Porta B
  else if (distB > 1.0 && distB <= GOL_DISTANCE_CM) {
    registraGol('B');
  }

  delay(40); 
}
/*#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ── Configurazione WiFi ──────────────────────────────────────
const char* ssid     = "TIM-51589117"; 
const char* password = "K57N5YuYsHHHxt3H5y6fU2NY";

// ── Configurazione MQTT (Allineata alle tue ACL) ──────────────
IPAddress mqttServer(192, 168, 1, 24);  // IP del tuo broker MQTT
const uint16_t mqttPort   = 1883;
const char* mqttUser   = "arduino_calcetto"; // Utente configurato nell'aclfile
const char* mqttPass   = "LA_TUA_PASSWORD";  // Password associata all'utente

// ── Identificativo Tavolo e Client ───────────────────────────
const char* ID_TAVOLO = "tavolo1"; 
const char* clientId  = "client_tavolo1"; 

char topicScoreA[50];
char topicScoreB[50];
char topicGoal[50];
char topicReset[50];

// ── Pin Sensori Ultrasonici ──────────────────────────────────
const uint8_t TRIG_A = 2;
const uint8_t ECHO_A = 3;
const uint8_t TRIG_B = 4;
const uint8_t ECHO_B = 5;

// ── Soglie, Costanti Fisiche e Timing ────────────────────────
const uint16_t GOL_DISTANCE_CM  = 10;   // Distanza massima per rilevare il gol
const uint32_t COOLDOWN_MS      = 3000; // Pausa di 3 secondi dopo un gol
const uint32_t RECONNECT_MS     = 5000; // Intervallo tentativi di riconnessione

// Velocità del suono calcolata esattamente per i 25°C della tua stanza (cm/µs)
const float velocitaSuono = 0.034645; 

// ── Stato Partita ────────────────────────────────────────────
uint8_t  scoreA = 0;
uint8_t  scoreB = 0;
uint32_t lastGoalTime = 0;
uint32_t lastReconnectAttempt = 0;

WiFiClient    wifiClient;
PubSubClient  mqtt(wifiClient);

// ═══════════════════════════════════════════════════════════════
//  Funzione: Misura distanza HC-SR04 con anti-blocco a 25°C
// ═══════════════════════════════════════════════════════════════
float measureCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // pulseIn con TIMEOUT a 20ms (~3.4 metri max) per non piantare l'R4
  long duration = pulseIn(echoPin, HIGH, 20000); 
  
  if (duration == 0) {
    // Reset elettrico del pin in caso di blocco hardware del sensore
    pinMode(echoPin, OUTPUT);
    digitalWrite(echoPin, LOW);
    delayMicroseconds(10);
    pinMode(echoPin, INPUT);
    return 999.0; 
  }

  return (duration * velocitaSuono) / 2.0;
}

// ═══════════════════════════════════════════════════════════════
//  Funzione: Registra e pubblica il Gol
// ═══════════════════════════════════════════════════════════════
void registraGol(char team) {
  char scoreStr[8];

  if (team == 'A') {
    scoreA++;
    Serial.print(F("GOL squadra A! Punteggio: "));
    Serial.print(scoreA); Serial.print(" - "); Serial.println(scoreB);

    itoa(scoreA, scoreStr, 10);
    mqtt.publish(topicScoreA, scoreStr, true); // retain = true
    mqtt.publish(topicGoal,   "A",      false);
  } else {
    scoreB++;
    Serial.print(F("GOL squadra B! Punteggio: "));
    Serial.print(scoreA); Serial.print(" - "); Serial.println(scoreB);

    itoa(scoreB, scoreStr, 10);
    mqtt.publish(topicScoreB, scoreStr, true);
    mqtt.publish(topicGoal,   "B",      false);
  }

  lastGoalTime = millis();
}

// ═══════════════════════════════════════════════════════════════
//  Callback MQTT in ingresso (Comando di Reset specifico per tavolo)
// ═══════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, topicReset) == 0 && length >= 1 && payload[0] == '1') {
    scoreA = 0;
    scoreB = 0;
    mqtt.publish(topicScoreA, "0", true);
    mqtt.publish(topicScoreB, "0", true);
    Serial.println(F(">> RESET partita via MQTT <<"));
  }
}

// ═══════════════════════════════════════════════════════════════
//  Connessione / Riconnessione MQTT
// ═══════════════════════════════════════════════════════════════
bool mqttConnect() {
  Serial.print(F("Connessione al broker MQTT... "));
  bool ok;
  
  // Connessione con le credenziali dell'aclfile
  if (strlen(mqttUser) > 0) {
    ok = mqtt.connect(clientId, mqttUser, mqttPass);
  } else {
    ok = mqtt.connect(clientId);
  }

  if (ok) {
    Serial.println(F("Connesso!"));
    mqtt.subscribe(topicReset); // Si iscrive solo al reset del proprio tavolo
    
    // Invia i punteggi attuali al momento della connessione
    char buf[8];
    itoa(scoreA, buf, 10); mqtt.publish(topicScoreA, buf, true);
    itoa(scoreB, buf, 10); mqtt.publish(topicScoreB, buf, true);
  } else {
    Serial.print(F("ERRORE, rc="));
    Serial.println(mqtt.state());
  }
  return ok;
}

// ═══════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);
  delay(1500); 
  
  // Generazione automatica dei sotto-topic sotto la radice 'calcetto'
  sprintf(topicScoreA, "calcetto/%s/scoreA", ID_TAVOLO);
  sprintf(topicScoreB, "calcetto/%s/scoreB", ID_TAVOLO);
  sprintf(topicGoal,   "calcetto/%s/goal",   ID_TAVOLO);
  sprintf(topicReset,  "calcetto/%s/reset",  ID_TAVOLO);

  Serial.println(F("=== Calciobalilla Smart MQTT (Uno R4 WiFi) ==="));
  Serial.print(F("Configurato come: ")); Serial.println(ID_TAVOLO);

  // Configurazione Pin
  pinMode(TRIG_A, OUTPUT); pinMode(ECHO_A, INPUT);
  //pinMode(TRIG_B, OUTPUT); pinMode(ECHO_B, INPUT);
  digitalWrite(TRIG_A, LOW);
  //digitalWrite(TRIG_B, LOW);

  // Connessione WiFi integrato
  Serial.print(F("Connessione a rete WiFi: "));
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println(F("\nWiFi Connesso!"));

  // Configurazione Server MQTT
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(mqttCallback);
}

// ═══════════════════════════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return; 
  }

  if (!mqtt.connected()) {
    uint32_t now = millis();
    if (now - lastReconnectAttempt > RECONNECT_MS) {
      lastReconnectAttempt = now;
      mqttConnect();
    }
  } else {
    mqtt.loop();
  }

  // Blocco temporaneo se è appena stato fatto un gol
  if (millis() - lastGoalTime < COOLDOWN_MS) return;

  // Lettura sequenziale (evita che i sensori si accechino a vicenda)
  float distA = measureCm(TRIG_A, ECHO_A);
  delay(60); // Dà il tempo all'eco di disperdersi nella stanza prima di leggere il sensore B
  float distB = measureCm(TRIG_B, ECHO_B);

  // Controllo Gol Porta A
  if (distA > 1.0 && distA <= GOL_DISTANCE_CM) {
    registraGol('A');
  } 
  // Controllo Gol Porta B
  else if (distB > 1.0 && distB <= GOL_DISTANCE_CM) {
    registraGol('B');
  }

  delay(40); 
}*/
/*
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ── CONFIGURAZIONE DA COMPILARE ──────────────────────────────
const char* ssid     = "TIM-51589117"; 
const char* password = "K57N5YuYsHHHxt3H5y6fU2NY";
const char* mqttServer = "192.168.1.15"; // IP del tuo Broker Mosquitto

// Credenziali allineate alla tua ACL
const char* mqttUser   = "arduino_calcetto"; 
const char* mqttPass   = "arduino";  
const char* clientId   = "test_sensore_singolo";
const char* topicTest  = "calcetto/tavolo1/goalA";

// Pin Sensore A
const uint8_t TRIG_A = 2;
const uint8_t ECHO_A = 3;

WiFiClient    wifiClient;
PubSubClient  mqtt(wifiClient);

void setup() {
  Serial.begin(9600);
  delay(1500);
  Serial.println(F("\n--- AVVIO TEST SENSORE SINGOLO MQTT ---"));

  pinMode(TRIG_A, OUTPUT);
  pinMode(ECHO_A, INPUT);
  digitalWrite(TRIG_A, LOW);

  // Connessione WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(F("\nWiFi Connesso!"));

  // Configurazione MQTT
  mqtt.setServer(mqttServer, 1883);
}

unsigned long ultimoControlloSensore = 0;
unsigned long tempoBloccoGol = 0;
bool inCooldown = false;

void loop() {
  // 1. Manteniamo la connessione MQTT sempre attiva (Eseguito costantemente)
  if (!mqtt.connected()) {
    Serial.print(F("Connessione MQTT... "));
    if (mqtt.connect(clientId, mqttUser, mqttPass)) {
      Serial.println(F("OK!"));
    } else {
      Serial.print(F("FALLITA, rc="));
      Serial.println(mqtt.state());
      delay(2000);
      return;
    }
  }
  mqtt.loop(); // Gestisce i ping in background, impedendo il timeout!

  unsigned long tempoAttuale = millis();

  // 2. Gestione del cooldown del gol senza bloccare la scheda
  if (inCooldown) {
    if (tempoAttuale - tempoBloccoGol >= 4000) {
      inCooldown = false;
      Serial.println(F("Fine cooldown, sensore attivo."));
    } else {
      return; // Salta la lettura del sensore se siamo in pausa gol
    }
  }

  // 3. Leggi il sensore solo ogni 500ms (Senza usare delay!)
  if (tempoAttuale - ultimoControlloSensore >= 500) {
    ultimoControlloSensore = tempoAttuale;

    // Impulso ultrasuoni
    digitalWrite(TRIG_A, LOW);
    delayMicroseconds(5);
    digitalWrite(TRIG_A, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_A, LOW);

    long duration = pulseIn(ECHO_A, HIGH, 20000);
    
    if (duration > 0) {
      float distanza = (duration * 0.034645) / 2.0;
      
      Serial.print(F("Distanza: ")); Serial.print(distanza, 1); Serial.println(F(" cm"));

      // Rilevamento ostacolo (Gol)
      if (distanza > 1.0 && distanza <= 10.0) {
        Serial.println(F(">> SOGLIA SUPERATA! Invio immediato MQTT..."));
        
        if (mqtt.publish(topicTest, "1")) {
          Serial.println(F("Inviato con successo!"));
        } else {
          Serial.println(F("Errore di invio pacchetto!"));
        }
        
        // Attiviamo il cooldown temporizzato
        inCooldown = true;
        tempoBloccoGol = tempoAttuale;
      }
    } else {
      Serial.println(F("Nessun eco ricevuto"));
    }
  }
}*/