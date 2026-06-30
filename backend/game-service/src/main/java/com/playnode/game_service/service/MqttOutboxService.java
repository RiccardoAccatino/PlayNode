package com.playnode.game_service.service;

import com.playnode.game_service.entity.MqttOutbox;
import com.playnode.game_service.repository.MqttOutboxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MqttOutboxService {

    private final MqttOutboxRepository mqttOutboxRepository;
    private final MqttOutboxDispatcher mqttOutboxDispatcher;

    public MqttOutboxService(MqttOutboxRepository mqttOutboxRepository,
            MqttOutboxDispatcher mqttOutboxDispatcher) {
        this.mqttOutboxRepository = mqttOutboxRepository;
        this.mqttOutboxDispatcher = mqttOutboxDispatcher;
    }

    @Transactional
    public MqttOutbox accoda(String tipo, String topic, String payload, String brokerUrl, Long idPartita) {
        if (brokerUrl == null || brokerUrl.isBlank()) {
            throw new IllegalStateException("Broker MQTT non configurato per il gioco selezionato.");
        }
        MqttOutbox outbox = new MqttOutbox();
        outbox.setTipo(tipo);
        outbox.setTopic(topic);
        outbox.setPayload(payload);
        outbox.setBrokerUrl(brokerUrl);
        outbox.setIdPartita(idPartita);
        outbox.setStato("PENDING");
        MqttOutbox saved = mqttOutboxRepository.save(outbox);
        mqttOutboxDispatcher.dispatchPendingAsync();
        return saved;
    }
}
