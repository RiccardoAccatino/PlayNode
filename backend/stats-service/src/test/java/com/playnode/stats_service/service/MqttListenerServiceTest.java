package com.playnode.stats_service.service;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test unitari per il Listener MQTT del servizio statistiche.
 * Verifica la corretta sottoscrizione ai topic e l'elaborazione
 * dei messaggi ricevuti senza connettersi a un broker reale.
 */
@ExtendWith(MockitoExtension.class)
public class MqttListenerServiceTest {

    private MqttListenerService mqttListenerService;

    @Mock
    private IMqttClient mockClient;

    @BeforeEach
    void setUp() throws Exception {
        mqttListenerService = spy(new MqttListenerService());
        ReflectionTestUtils.setField(mqttListenerService, "brokerUrl", "tcp://127.0.0.1:1883");
        ReflectionTestUtils.setField(mqttListenerService, "clientId", "stats-test-client");
        ReflectionTestUtils.setField(mqttListenerService, "topicName", "locale/#");

        doReturn(mockClient).when(mqttListenerService).createMqttClient(anyString(), anyString());
        doNothing().when(mockClient).connect(any(MqttConnectOptions.class));
        doNothing().when(mockClient).subscribe(anyString());
    }

    @Test
    void testAvviaAscolto_AndMessageArrived() throws Exception {
        assertDoesNotThrow(() -> mqttListenerService.avviaAscolto());

        verify(mockClient).connect(any(MqttConnectOptions.class));
        verify(mockClient).subscribe("locale/#");

        ArgumentCaptor<MqttCallback> callbackCaptor = ArgumentCaptor.forClass(MqttCallback.class);
        verify(mockClient).setCallback(callbackCaptor.capture());

        MqttCallback callback = callbackCaptor.getValue();
        assertNotNull(callback);

        String jsonPayload = "{\"idUtente\": 1, \"punteggio\": 10, \"giocoId\": 2, \"vittoria\": true}";
        MqttMessage message = new MqttMessage(jsonPayload.getBytes());
        
        assertDoesNotThrow(() -> callback.messageArrived("locale/1/match_end", message));
        
        assertDoesNotThrow(() -> callback.connectionLost(new RuntimeException("Connection lost test")));
    }
}
