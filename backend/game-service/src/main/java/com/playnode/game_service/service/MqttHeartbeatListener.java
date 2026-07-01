package com.playnode.game_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MqttHeartbeatListener {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String mqttUsername;

    @Value("${mqtt.password:}")
    private String mqttPassword;

    private final EdgeHeartbeatService edgeHeartbeatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MqttHeartbeatListener(EdgeHeartbeatService edgeHeartbeatService) {
        this.edgeHeartbeatService = edgeHeartbeatService;
    }

    protected IMqttClient createMqttClient(String brokerUrl, String clientId) throws MqttException {
        return new MqttClient(brokerUrl, clientId + "-heartbeat");
    }

    @PostConstruct
    public void avviaAscolto() {
        try {
            IMqttClient mqttClient = createMqttClient(brokerUrl, clientId);
            mqttClient.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    try {
                        if (!topic.endsWith("/edge/status")) {
                            return;
                        }
                        JsonNode dati = objectMapper.readTree(new String(message.getPayload()));
                        if (dati.has("idComponenteEdge")) {
                            edgeHeartbeatService.registraHeartbeat(dati.get("idComponenteEdge").asLong());
                        }
                    } catch (Exception ignored) {
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                }
            });

            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setAutomaticReconnect(true);
            if (mqttUsername != null && !mqttUsername.isBlank()) {
                options.setUserName(mqttUsername);
                options.setPassword(mqttPassword != null ? mqttPassword.toCharArray() : new char[0]);
            }
            mqttClient.connect(options);
            mqttClient.subscribe("locale/+/edge/status");
        } catch (MqttException e) {
            System.err.println("Heartbeat MQTT non avviato: " + e.getMessage());
        }
    }
}
