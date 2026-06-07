package com.playnode.game_service.service;

import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class MqttPublisherService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.username}")
    private String mqttUsername;

    @Value("${mqtt.password}")
    private String mqttPassword;



    private MqttClient mqttClient;

    @PostConstruct
    public void init() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId);
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setAutomaticReconnect(true); // Fondamentale per i server

            options.setUserName(mqttUsername);
            options.setPassword(mqttPassword.toCharArray());


            mqttClient.connect(options);
            System.out.println("✅ Game Service connesso a MQTT come Publisher");
        } catch (MqttException e) {
            System.err.println("❌ Errore connessione MQTT Game Service: " + e.getMessage());
        }
    }

    public void inviaComandoAvvioPartita(Long idGiocoInstallato, Long idPartita) {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                // Creiamo un topic dinamico basato sull'ID del gioco fisico (es: edge/gioco/1/comandi)
                String topic = "edge/gioco/" + idGiocoInstallato + "/comandi";

                // Creiamo un piccolo JSON a mano
                String payload = "{\"nuova_partita_id\": " + idPartita + "}";

                MqttMessage message = new MqttMessage(payload.getBytes());
                message.setQos(1);

                mqttClient.publish(topic, message);
                System.out.println("📤 Inviato comando MQTT: " + payload + " sul topic " + topic);
            }
        } catch (MqttException e) {
            System.err.println("❌ Errore invio messaggio MQTT: " + e.getMessage());
        }
    }

    public void inviaComandoTerminaPartita(Long idGiocoInstallato) {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                // Stesso topic usato per l'avvio
                String topic = "edge/gioco/" + idGiocoInstallato + "/comandi";

                // JSON che corrisponde a quello atteso dallo script Python
                String payload = "{\"termina_partita\": true}";

                MqttMessage message = new MqttMessage(payload.getBytes());
                message.setQos(1);

                mqttClient.publish(topic, message);
                System.out.println("🛑 Inviato comando MQTT di FINE partita sul topic " + topic);
            }
        } catch (MqttException e) {
            System.err.println("❌ Errore invio messaggio MQTT di terminazione: " + e.getMessage());
        }
    }
}