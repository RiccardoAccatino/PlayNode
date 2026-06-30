package com.playnode.game_service.service;

import com.playnode.game_service.entity.MqttOutbox;
import com.playnode.game_service.entity.Partita;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PartitaServiceTest {

    @Mock
    private com.playnode.game_service.repository.PartitaRepository partitaRepository;

    @Mock
    private com.playnode.game_service.repository.PartecipaRepository partecipaRepository;

    @Mock
    private MqttPublisherService mqttPublisherService;

    @Mock
    private MqttOutboxService mqttOutboxService;

    @Mock
    private TournamentCallbackService tournamentCallbackService;

    private PartitaService partitaService;

    private static final String DEFAULT_BROKER = "tcp://playnode-mosquitto:1883";

    private Partita partitaMock;
    private com.playnode.game_service.entity.Partecipa partecipaMock;

    @BeforeEach
    void setUp() {
        partitaService = new PartitaService(
                partitaRepository,
                partecipaRepository,
                mqttPublisherService,
                mqttOutboxService,
                tournamentCallbackService,
                DEFAULT_BROKER);

        partitaMock = new Partita();
        partitaMock.setIdPartita(100L);
        partitaMock.setGiocoFisicoId(10L);
        partitaMock.setTimestampInizio(LocalDateTime.now());

        partecipaMock = new com.playnode.game_service.entity.Partecipa();
        partecipaMock.setIdPartecipa(1L);
        partecipaMock.setPartitaId(100L);
        partecipaMock.setSquadraId(1L);
        partecipaMock.setPunteggioFinale(0);
    }

    @Test
    void testAvviaNuovaPartita_Success() {
        when(partitaRepository.existsByGiocoFisicoIdAndTimestampFineIsNull(10L)).thenReturn(false);
        when(mqttPublisherService.risolviBrokerUrl(10L)).thenReturn("tcp://broker:1883");
        when(partitaRepository.save(any(Partita.class))).thenReturn(partitaMock);
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.emptyList());
        when(mqttOutboxService.accoda(anyString(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(new MqttOutbox());

        var result = partitaService.avviaNuovaPartita(10L, null, null);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(partitaRepository, times(1)).save(any(Partita.class));
        verify(mqttOutboxService, times(1)).accoda(eq("AVVIO_PARTITA"), anyString(), anyString(),
                eq("tcp://broker:1883"), eq(100L));
    }

    @Test
    void testAvviaNuovaPartita_UsaBrokerDiDefaultSeMancanteNelLocale() {
        when(partitaRepository.existsByGiocoFisicoIdAndTimestampFineIsNull(10L)).thenReturn(false);
        when(mqttPublisherService.risolviBrokerUrl(10L)).thenReturn(null);
        when(partitaRepository.save(any(Partita.class))).thenReturn(partitaMock);
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.emptyList());
        when(mqttOutboxService.accoda(anyString(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(new MqttOutbox());

        var result = partitaService.avviaNuovaPartita(10L, null, null);

        assertNotNull(result);
        verify(mqttOutboxService).accoda(eq("AVVIO_PARTITA"), anyString(), anyString(),
                eq(DEFAULT_BROKER), eq(100L));
    }

    @Test
    void testAvviaNuovaPartita_BrokerMancante_LanciaEccezione() {
        partitaService = new PartitaService(
                partitaRepository,
                partecipaRepository,
                mqttPublisherService,
                mqttOutboxService,
                tournamentCallbackService,
                "");
        when(partitaRepository.existsByGiocoFisicoIdAndTimestampFineIsNull(10L)).thenReturn(false);
        when(mqttPublisherService.risolviBrokerUrl(10L)).thenReturn(null);
        assertThrows(IllegalStateException.class, () -> partitaService.avviaNuovaPartita(10L, null, null));
        verify(partitaRepository, never()).save(any());
    }

    @Test
    void testAvviaNuovaPartita_GiocoGiaInUso_LanciaEccezione() {
        when(partitaRepository.existsByGiocoFisicoIdAndTimestampFineIsNull(10L)).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> partitaService.avviaNuovaPartita(10L, null, null));
        verify(partitaRepository, never()).save(any());
    }

    @Test
    void testAggiornaPunteggio_PartitaEsistente_PrimoPunto() {
        when(partitaRepository.findById(100L)).thenReturn(Optional.of(partitaMock));
        when(partecipaRepository.findByPartitaIdAndSquadraId(100L, 1L)).thenReturn(Optional.empty());
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L))
                .thenReturn(Collections.singletonList(partecipaMock));

        var result = partitaService.aggiornaPunteggio(100L, 1L);

        assertNotNull(result);
        verify(partecipaRepository, times(1)).save(any(com.playnode.game_service.entity.Partecipa.class));
    }

    @Test
    void testTerminaPartita_Success() {
        when(partitaRepository.findById(100L)).thenReturn(Optional.of(partitaMock));
        when(partitaRepository.save(any(Partita.class))).thenReturn(partitaMock);
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.emptyList());
        when(mqttPublisherService.risolviBrokerUrl(10L)).thenReturn("tcp://broker:1883");
        when(mqttOutboxService.accoda(anyString(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(new MqttOutbox());

        var result = partitaService.terminaPartita(100L);

        assertNotNull(result);
        assertNotNull(partitaMock.getTimestampFine());
        verify(mqttOutboxService, times(1)).accoda(eq("TERMINA_PARTITA"), anyString(), anyString(),
                eq("tcp://broker:1883"), eq(100L));
        verify(tournamentCallbackService, times(1)).notificaFinePartita(100L);
    }
}
