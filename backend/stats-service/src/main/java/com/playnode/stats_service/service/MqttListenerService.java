package com.playnode.stats_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.playnode.stats_service.entity.StoricoPartita;
import com.playnode.stats_service.repository.StoricoPartitaRepository;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;

@Service
public class MqttListenerService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic}")
    private String topicName;

    private MqttClient mqttClient;

    // Sostituiamo il vecchio repository con il nuovo StoricoPartitaRepository
    @Autowired
    private StoricoPartitaRepository storicoRepository;

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

                        // Immaginiamo che i dispositivi inviino le statistiche alla fine della partita
                        if(topic.endsWith("/match_end")) {

                            // 1. Leggiamo il JSON (es: {"idUtente": 1, "idLocale": "LOC-007", "nomeGioco": "Calciobalilla", "punteggio": 3})
                            JsonNode dati = objectMapper.readTree(contenutoJSON);

                            // 2. Creiamo una nuova riga per il nostro registro storico
                            StoricoPartita nuovaPartita = new StoricoPartita();
                            nuovaPartita.setIdUtente(dati.get("idUtente").asLong());
                            nuovaPartita.setIdLocale(dati.get("idLocale").asText());
                            nuovaPartita.setNomeGioco(dati.get("nomeGioco").asText());
                            nuovaPartita.setPunteggioOttenuto(dati.get("punteggio").asInt());

                            // 3. Registriamo l'ora esatta dal sistema
                            nuovaPartita.setDataPartita(LocalDateTime.now());

                            // 4. Salviamo lo "scontrino" nel database!
                            storicoRepository.save(nuovaPartita);

                            System.out.println("✅ Partita registrata con successo nello storico!");
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