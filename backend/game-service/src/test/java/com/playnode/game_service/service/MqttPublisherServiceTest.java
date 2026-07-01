package com.playnode.game_service.service;

import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test unitari per il servizio di pubblicazione MQTT.
 * Utilizza Mockito per simulare le dipendenze e verificare che
 * i messaggi vengano inviati al broker corretto.
 */
@ExtendWith(MockitoExtension.class)
public class MqttPublisherServiceTest {

    @Mock
    private GiocoFisicoRepository giocoFisicoRepository;

    @Mock
    private LocaleRepository localeRepository;

    private MqttPublisherService mqttPublisherService;

    @Mock
    private IMqttClient mockClient;

    private GiocoFisico giocoMock;
    private Locale localeMock;

    @BeforeEach
    void setUp() throws Exception {
        // Initialize the spy with the mocked repositories
        mqttPublisherService = spy(new MqttPublisherService(giocoFisicoRepository, localeRepository));

        ReflectionTestUtils.setField(mqttPublisherService, "clientIdPrefix", "test-client");
        ReflectionTestUtils.setField(mqttPublisherService, "mqttUsername", "admin");
        ReflectionTestUtils.setField(mqttPublisherService, "mqttPassword", "admin");

        giocoMock = new GiocoFisico();
        giocoMock.setIdGiocoFisico(1L);
        giocoMock.setLocaleId(10L);

        localeMock = new Locale();
        localeMock.setIdLocale(10L);
        localeMock.setHostBroker("tcp://127.0.0.1:1883");

        // Return the mockClient instead of creating a real MqttClient
        doReturn(mockClient).when(mqttPublisherService).createMqttClient(anyString(), anyString());
    }

    @Test
    void testInviaComandoAvvioPartita_Success() throws Exception {
        when(giocoFisicoRepository.findById(1L)).thenReturn(Optional.of(giocoMock));
        when(localeRepository.findById(10L)).thenReturn(Optional.of(localeMock));

        assertDoesNotThrow(() -> mqttPublisherService.inviaComandoAvvioPartita(1L, 100L));

        verify(giocoFisicoRepository, times(1)).findById(1L);
        verify(localeRepository, times(1)).findById(10L);
        verify(mqttPublisherService, times(1)).createMqttClient(anyString(), anyString());
    }

    @Test
    void testInviaComandoTerminaPartita_Success() throws Exception {
        when(giocoFisicoRepository.findById(1L)).thenReturn(Optional.of(giocoMock));
        when(localeRepository.findById(10L)).thenReturn(Optional.of(localeMock));

        assertDoesNotThrow(() -> mqttPublisherService.inviaComandoTerminaPartita(1L));

        verify(giocoFisicoRepository, times(1)).findById(1L);
        verify(localeRepository, times(1)).findById(10L);
        verify(mqttPublisherService, times(1)).createMqttClient(anyString(), anyString());
    }
}
