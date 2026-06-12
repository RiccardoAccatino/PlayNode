package com.playnode.stats_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

/**
 * Ascolta i topic MQTT e logga gli eventi di fine partita.
 *
 * ARCHITETTURA:
 * - storico_partita → VIEW su Partecipa + Partita (read-only)
 * - statistica_utente → VIEW aggregata su Partecipa (read-only)
 *
 * Entrambe le view si aggiornano automaticamente quando game-service
 * scrive su Partecipa. Questo service NON deve mai fare save() su di esse.
 *
 * Se in futuro serve persistere qualcosa di proprio del stats-service
 * (es. cache, notifiche), creare una tabella dedicata separata.
 */
@Service
public class MqttListenerService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic}")
    private String topicName;

    private MqttClient mqttClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void avviaAscolto() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId);

            mqttClient.setCallback(new MqttCallback() {

                @Override
                public void connectionLost(Throwable cause) {
                    System.out.println("⚠️ Connessione MQTT persa. Motivo: " + cause.getMessage());
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    try {
                        String contenutoJSON = new String(message.getPayload());
                        System.out.println("📩 Ricevuto su [" + topic + "]: " + contenutoJSON);

                        if (topic.endsWith("/match_end")) {
                            JsonNode dati = objectMapper.readTree(contenutoJSON);

                            // Logghiamo i dati principali per il debug
                            Long utenteId = dati.has("idUtente") ? dati.get("idUtente").asLong() : 0L;
                            int punteggio = dati.has("punteggio") ? dati.get("punteggio").asInt() : 0;
                            Long giocoId = dati.has("giocoId") ? dati.get("giocoId").asLong() : 0L;
                            boolean vittoria = dati.has("vittoria") && dati.get("vittoria").asBoolean();

                            System.out.printf(
                                    "✅ Fine partita ricevuta — utenteId=%d, punteggio=%d, giocoId=%d, vittoria=%b%n",
                                    utenteId, punteggio, giocoId, vittoria);

                            // Le view storico_partita e statistica_utente si aggiornano
                            // automaticamente dai dati scritti da game-service su Partecipa.
                            System.out.println("ℹ️ Storico e statistiche aggiornati automaticamente dalle view SQL.");
                        }

                    } catch (Exception e) {
                        System.out.println("❌ Errore elaborazione messaggio MQTT: " + e.getMessage());
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {

                }
            });

            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setAutomaticReconnect(true); // Riconnessione automatica se Mosquitto riavvia

            mqttClient.connect(options);
            mqttClient.subscribe(topicName);
            System.out.println("🎧 Stats-service MQTT avviato, in ascolto su: " + topicName);

        } catch (MqttException e) {
            // Non crashare l'intero servizio se MQTT non è disponibile all'avvio
            System.err.println("❌ Impossibile connettersi a MQTT all'avvio: " + e.getMessage());
            System.err.println("ℹ️ Il servizio REST continua a funzionare normalmente.");
        }
    }
}