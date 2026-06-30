package com.playnode.game_service.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class MqttOutboxDispatcher {

    private final MqttOutboxProcessor mqttOutboxProcessor;

    public MqttOutboxDispatcher(MqttOutboxProcessor mqttOutboxProcessor) {
        this.mqttOutboxProcessor = mqttOutboxProcessor;
    }

    @Async
    public void dispatchPendingAsync() {
        mqttOutboxProcessor.processaOutbox();
    }
}
