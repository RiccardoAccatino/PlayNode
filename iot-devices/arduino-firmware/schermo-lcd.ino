#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// Inizializzazione per display I2C (SDA, SCL)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Variabili per i punteggi
int scoreP1 = 0;
int scoreP2 = 0;

void setup() {
  Serial.begin(9600);

  // Inizializzazione del display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Blocco in caso di errore hardware
  }

  // Pulisce il buffer del display e mostra la schermata vuota
  display.clearDisplay();
  display.display();
}

void loop() {
  // --- FASE 1: Tabellone in attesa ---
  drawScoreboard();
  delay(3000); // Mostra il punteggio per 3 secondi

  // --- FASE 2: Goal Giocatore 1 ---
  animazioneGoal("G1");
  scoreP1++; // Aggiorna il punteggio del G1
  
  // --- FASE 3: Istruzione rimozione pallina ---
  animazioneRimuoviPallina();
  
  // --- FASE 4: Tabellone aggiornato in attesa ---
  drawScoreboard();
  delay(3000); 

  // --- FASE 5: Goal Giocatore 2 ---
  animazioneGoal("G2");
  scoreP2++; // Aggiorna il punteggio del G2
  
  // --- FASE 6: Istruzione rimozione pallina ---
  animazioneRimuoviPallina();
  
  // Reset dei punteggi per evitare che escano dai bordi durante la simulazione
  if (scoreP1 > 9 || scoreP2 > 9) {
    scoreP1 = 0;
    scoreP2 = 0;
  }
}

// ==========================================
// FUNZIONI GRAFICHE E ANIMAZIONI
// ==========================================

void drawScoreboard() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  
  // Titolo centrale in alto
  display.setTextSize(1);
  display.setCursor(40, 0);
  display.print("CALCETTO");
  
  // Linea di separazione
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Punteggi
  display.setTextSize(4); // Testo molto grande per i numeri
  
  // Giocatore 1 (sinistra)
  display.setCursor(10, 25);
  display.print(scoreP1);
  
  // Trattino separatore
  display.setTextSize(2);
  display.setCursor(58, 35);
  display.print("-");
  
  // Giocatore 2 (destra)
  display.setTextSize(4);
  if (scoreP2 < 10) {
    display.setCursor(95, 25);
  } else {
    display.setCursor(75, 25);
  }
  display.print(scoreP2);

  // Applica i cambiamenti allo schermo
  display.display(); 
}

void animazioneGoal(String squadra) {
  for(int i = 0; i < 3; i++) {
    // Schermo bianco con scritta nera
    display.fillScreen(SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK);
    
    display.setTextSize(3);
    display.setCursor(20, 10);
    display.print("GOAL!");
    
    display.setTextSize(2);
    display.setCursor(50, 40);
    display.print(squadra);
    
    display.display();
    delay(400);
    
    // Schermo nero
    display.fillScreen(SSD1306_BLACK);
    display.display();
    delay(200);
  }
}

void animazioneRimuoviPallina() {
  // Fa lampeggiare l'avviso 4 volte
  for(int i = 0; i < 4; i++) {
    display.clearDisplay();
    
    // Disegna un rettangolo di bordo per enfatizzare l'avviso
    display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
    
    display.setTextColor(SSD1306_WHITE);
    
    // Prima riga: RIMUOVI
    display.setTextSize(2);
    display.setCursor(22, 10);
    display.print("RIMUOVI");
    
    // Seconda riga: PALLINA
    display.setCursor(22, 30);
    display.print("PALLINA");
    
    // Terza riga: DALLA PORTA! (più piccola per farla entrare)
    display.setTextSize(1);
    display.setCursor(28, 50);
    display.print("DALLA PORTA!");
    
    display.display();
    delay(600); // Testo visibile per 0.6s
    
    // Pulisce lo schermo per creare l'effetto lampeggio
    display.clearDisplay();
    display.display();
    delay(200); // Schermo nero per 0.2s
  }
}
