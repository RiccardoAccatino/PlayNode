package com.playnode.stats_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.playnode.stats_service.entity.StatisticaUtente;
import com.playnode.stats_service.entity.StoricoPartita;
import com.playnode.stats_service.repository.StatisticaRepository;
import com.playnode.stats_service.repository.StoricoPartitaRepository;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MqttListenerService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic}")
    private String topicName;

    private MqttClient mqttClient;

    // Colleghiamo ENTRAMBI i repository per poter scrivere su entrambe le tabelle del database
    @Autowired
    private StoricoPartitaRepository storicoRepository;

    @Autowired
    private StatisticaRepository statisticaRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void avviaAscolto() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId);

            mqttClient.setCallback(new MqttCallback() {

                @Override
                public void connectionLost(Throwable cause) {
                    System.out.println("⚠️ Connessione MQTT persa! Motivo: " + cause.getMessage());
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    try {
                        String contenutoJSON = new String(message.getPayload());
                        System.out.println("📩 Ricevuto su " + topic + ": " + contenutoJSON);

                        if(topic.endsWith("/match_end")) {

                            // 1. Leggiamo il JSON
                            JsonNode dati = objectMapper.readTree(contenutoJSON);

                            // Estraiamo le variabili principali che ci servono per entrambe le tabelle
                            Long utenteId = dati.has("idUtente") ? dati.get("idUtente").asLong() : 0L;
                            int punteggio = dati.has("punteggio") ? dati.get("punteggio").asInt() : 0;

                            // ==========================================
                            // FASE A: SALVIAMO LO STORICO DELLA PARTITA
                            // ==========================================
                            StoricoPartita nuovaPartita = new StoricoPartita();
                            nuovaPartita.setUtenteId(utenteId);
                            nuovaPartita.setPunteggioOttenuto(punteggio);
                            nuovaPartita.setDataPartita(LocalDateTime.now());

                            // Gestiamo i campi aggiuntivi con sicurezza (se esistono nel JSON li usiamo)
                            if (dati.has("giocoId")) {
                                nuovaPartita.setGiocoId(dati.get("giocoId").asLong());
                            } else {
                                nuovaPartita.setGiocoId(1L); // Valore di default se manca
                            }

                            // Salviamo lo "scontrino" nel database
                            storicoRepository.save(nuovaPartita);
                            System.out.println("✅ Partita registrata con successo nello storico!");

                            // ==========================================
                            // FASE B: AGGIORNIAMO LE STATISTICHE TOTALI
                            // ==========================================
                            // Cerchiamo se l'utente ha già delle statistiche salvate
                            Optional<StatisticaUtente> statOpzionale = statisticaRepository.findById(utenteId);
                            StatisticaUtente stat;

                            if (statOpzionale.isPresent()) {
                                // Se esistono, le prendiamo per aggiornarle
                                stat = statOpzionale.get();
                            } else {
                                // Se l'utente è nuovo e non ha mai giocato, creiamo un foglio statistiche vuoto
                                stat = new StatisticaUtente();
                                stat.setUtenteId(utenteId);
                                stat.setPartiteGiocate(0);
                                stat.setPunteggioTotale(0);
                                stat.setVittorie(0);
                            }

                            // Aggiungiamo i dati della nuova partita ai totali
                            stat.setPartiteGiocate(stat.getPartiteGiocate() + 1);
                            stat.setPunteggioTotale(stat.getPunteggioTotale() + punteggio);

                            // Se il JSON ci dice che ha vinto (es: "vittoria": true), aumentiamo le vittorie
                            if (dati.has("vittoria") && dati.get("vittoria").asBoolean()) {
                                stat.setVittorie(stat.getVittorie() + 1);
                            }

                            // Aggiorniamo i campi per l'amministratore, se presenti
                            if (dati.has("idLocale")) stat.setIdLocale(dati.get("idLocale").asText());
                            if (dati.has("nomeGioco")) stat.setNomeGioco(dati.get("nomeGioco").asText());

                            // Salviamo le statistiche aggiornate nel database!
                            statisticaRepository.save(stat);
                            System.out.println("✅ Statistiche utente aggiornate con successo!");
                        }

                    } catch (Exception e) {
                        System.out.println("❌ Errore durante l'elaborazione del messaggio: " + e.getMessage());
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                }
            });

            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);

            mqttClient.connect(options);
            mqttClient.subscribe(topicName);
            System.out.println("🎧 Servizio MQTT avviato in modalità Storico su: " + topicName);

        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}