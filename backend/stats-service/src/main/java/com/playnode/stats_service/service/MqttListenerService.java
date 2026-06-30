package com.playnode.stats_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class MqttListenerService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic}")
    private String topicName;

    private IMqttClient mqttClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MqttMatchEndPersistenceService matchEndPersistenceService;

    public MqttListenerService(MqttMatchEndPersistenceService matchEndPersistenceService) {
        this.matchEndPersistenceService = matchEndPersistenceService;
    }

    protected IMqttClient createMqttClient(String brokerUrl, String clientId) throws MqttException {
        return new MqttClient(brokerUrl, clientId);
    }

    @PostConstruct
    public void avviaAscolto() {
        try {
            mqttClient = createMqttClient(brokerUrl, clientId);

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
                            boolean salvato = matchEndPersistenceService.salvaFinePartita(dati, topic);
                            if (salvato) {
                                System.out.println("✅ Fine partita persistita su Partecipa/Partita — views SQL aggiornate.");
                            } else {
                                System.out.println("⚠️ Payload match_end incompleto (idUtente/idPartita mancanti).");
                            }
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
            options.setAutomaticReconnect(true);

            mqttClient.connect(options);
            mqttClient.subscribe(topicName);
            System.out.println("🎧 Stats-service MQTT avviato, in ascolto su: " + topicName);

        } catch (MqttException e) {
            System.err.println("❌ Impossibile connettersi a MQTT all'avvio: " + e.getMessage());
            System.err.println("ℹ️ Il servizio REST continua a funzionare normalmente.");
        }
    }
}
