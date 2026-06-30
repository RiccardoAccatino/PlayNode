package com.playnode.game_service.service;

import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MqttPublisherService {

    @Value("${mqtt.client.id}")
    private String clientIdPrefix;

    @Value("${mqtt.username}")
    private String mqttUsername;

    @Value("${mqtt.password}")
    private String mqttPassword;

    private final GiocoFisicoRepository giocoFisicoRepository;
    private final LocaleRepository localeRepository;

    private final Map<String, IMqttClient> brokerClients = new ConcurrentHashMap<>();

    public MqttPublisherService(GiocoFisicoRepository giocoFisicoRepository, LocaleRepository localeRepository) {
        this.giocoFisicoRepository = giocoFisicoRepository;
        this.localeRepository = localeRepository;
    }

    private String getBrokerUrlByIdGioco(Long idGiocoFisico) {
        return risolviBrokerUrl(idGiocoFisico);
    }

    public String risolviBrokerUrl(Long idGiocoFisico) {
        Optional<GiocoFisico> giocoOp = giocoFisicoRepository.findById(idGiocoFisico);
        if (giocoOp.isPresent()) {
            Long localeId = giocoOp.get().getLocaleId();
            Optional<Locale> localeOp = localeRepository.findById(localeId);

            if (localeOp.isPresent()) {
                String hostBroker = localeOp.get().getHostBroker();
                if (hostBroker != null && !hostBroker.startsWith("tcp://")) {
                    return "tcp://" + hostBroker + ":1883";
                }
                return hostBroker;
            }
        }
        return null;
    }

    protected IMqttClient createMqttClient(String brokerUrl, String clientId) throws MqttException {
        return new MqttClient(brokerUrl, clientId);
    }

    private IMqttClient getMqttClient(String brokerUrl) throws MqttException {
        IMqttClient existingClient = brokerClients.get(brokerUrl);
        if (existingClient != null) {
            if (existingClient.isConnected()) {
                return existingClient;
            } else {
                try {
                    existingClient.disconnect();
                } catch (MqttException ignored) {}
                try {
                    existingClient.close();
                } catch (MqttException ignored) {}
            }
        }

        String uniqueClientId = clientIdPrefix + "_" + System.currentTimeMillis();
        IMqttClient newClient = createMqttClient(brokerUrl, uniqueClientId);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(5);
        options.setKeepAliveInterval(30);
        options.setUserName(mqttUsername);
        options.setPassword(mqttPassword.toCharArray());

        newClient.connect(options);
        brokerClients.put(brokerUrl, newClient);

        System.out.println("✅ Game Service connesso a MQTT Broker: " + brokerUrl);
        return newClient;
    }

    public boolean pubblicaMessaggio(String brokerUrl, String topic, String payload) {
        if (brokerUrl == null || brokerUrl.isBlank()) {
            return false;
        }
        try {
            IMqttClient client = getMqttClient(brokerUrl);
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);
            client.publish(topic, message);
            System.out.println("📤 Inviato comando MQTT: " + payload + " su " + topic);
            return true;
        } catch (MqttException e) {
            System.err.println("❌ Errore invio messaggio MQTT a " + brokerUrl + ": " + e.getMessage());
            return false;
        }
    }

    public void inviaComandoAvvioPartita(Long ID_GIOCO_FISICO, Long idPartita) {
        String brokerUrl = getBrokerUrlByIdGioco(ID_GIOCO_FISICO);
        if (brokerUrl == null) {
            System.err.println("❌ Errore: Impossibile trovare l'host_broker per il gioco " + ID_GIOCO_FISICO);
            return;
        }

        String topic = "edge/gioco/" + ID_GIOCO_FISICO + "/comandi";
        String payload = "{\"nuova_partita_id\":" + idPartita + "}";
        pubblicaMessaggio(brokerUrl, topic, payload);
    }

    public void inviaComandoTerminaPartita(Long idGiocoInstallato) {
        String brokerUrl = getBrokerUrlByIdGioco(idGiocoInstallato);
        if (brokerUrl == null) {
            System.err.println("❌ Errore: Impossibile trovare l'host_broker per il gioco " + idGiocoInstallato);
            return;
        }

        String topic = "edge/gioco/" + idGiocoInstallato + "/comandi";
        String payload = "{\"termina_partita\": true}";
        pubblicaMessaggio(brokerUrl, topic, payload);
    }
}