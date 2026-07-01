package com.playnode.game_service.service;

import com.playnode.game_service.entity.MqttOutbox;
import com.playnode.game_service.repository.MqttOutboxRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class MqttOutboxProcessor {

    private static final int MAX_TENTATIVI = 5;

    private final MqttOutboxRepository mqttOutboxRepository;
    private final MqttPublisherService mqttPublisherService;

    public MqttOutboxProcessor(MqttOutboxRepository mqttOutboxRepository,
            MqttPublisherService mqttPublisherService) {
        this.mqttOutboxRepository = mqttOutboxRepository;
        this.mqttPublisherService = mqttPublisherService;
    }

    @Scheduled(fixedDelayString = "${mqtt.outbox.poll-ms:5000}")
    @Transactional
    public void processaOutbox() {
        List<MqttOutbox> pending = mqttOutboxRepository.findTop20ByStatoOrderByCreatedAtAsc("PENDING");
        for (MqttOutbox entry : pending) {
            boolean ok = mqttPublisherService.pubblicaMessaggio(
                    entry.getBrokerUrl(), entry.getTopic(), entry.getPayload());
            entry.setTentativi(entry.getTentativi() + 1);
            if (ok) {
                entry.setStato("SENT");
                entry.setProcessedAt(LocalDateTime.now());
                entry.setErrorMessage(null);
            } else if (entry.getTentativi() >= MAX_TENTATIVI) {
                entry.setStato("FAILED");
                entry.setProcessedAt(LocalDateTime.now());
                entry.setErrorMessage("Invio MQTT fallito dopo " + MAX_TENTATIVI + " tentativi");
            }
            mqttOutboxRepository.save(entry);
        }
    }
}
