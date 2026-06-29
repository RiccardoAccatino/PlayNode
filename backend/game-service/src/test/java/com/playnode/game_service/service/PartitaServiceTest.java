package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.entity.Partecipa;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test unitari per il servizio di gestione delle Partite.
 * Copre la logica di business: avvio, aggiornamento punteggio e terminazione,
 * simulando il DB e l'invio di messaggi MQTT.
 */
@ExtendWith(MockitoExtension.class)
public class PartitaServiceTest {

    @Mock
    private PartitaRepository partitaRepository;

    @Mock
    private PartecipaRepository partecipaRepository;

    @Mock
    private MqttPublisherService mqttPublisherService;

    @InjectMocks
    private PartitaService partitaService;

    private Partita partitaMock;
    private Partecipa partecipaMock;

    @BeforeEach
    void setUp() {
        partitaMock = new Partita();
        partitaMock.setIdPartita(100L);
        partitaMock.setGiocoFisicoId(10L);
        partitaMock.setTimestampInizio(LocalDateTime.now());

        partecipaMock = new Partecipa();
        partecipaMock.setIdPartecipa(1L);
        partecipaMock.setPartitaId(100L);
        partecipaMock.setSquadraId(1L);
        partecipaMock.setPunteggioFinale(0);
    }

    @Test
    void testAvviaNuovaPartita_Success() {
        // Configurazione mock: il salvataggio restituisce la partita mockata
        when(partitaRepository.save(any(Partita.class))).thenReturn(partitaMock);
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.emptyList());

        PartitaDTO result = partitaService.avviaNuovaPartita(10L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(10L, result.getIdGiocoInstallato());
        assertTrue("IN_CORSO".equals(result.getStato()));

        verify(partitaRepository, times(1)).save(any(Partita.class));
        verify(mqttPublisherService, times(1)).inviaComandoAvvioPartita(10L, 100L);
    }

    @Test
    void testAggiornaPunteggio_PartitaEsistente_PrimoPunto() {
        when(partitaRepository.findById(100L)).thenReturn(Optional.of(partitaMock));
        when(partecipaRepository.findByPartitaIdAndSquadraId(100L, 1L)).thenReturn(Optional.empty());
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.singletonList(partecipaMock));

        // When
        PartitaDTO result = partitaService.aggiornaPunteggio(100L, 1L);

        // Then
        assertNotNull(result);
        verify(partecipaRepository, times(1)).save(any(Partecipa.class));
    }

    @Test
    void testAggiornaPunteggio_PartitaEsistente_PuntoSuccessivo() {
        partecipaMock.setPunteggioFinale(2);
        when(partitaRepository.findById(100L)).thenReturn(Optional.of(partitaMock));
        when(partecipaRepository.findByPartitaIdAndSquadraId(100L, 1L)).thenReturn(Optional.of(partecipaMock));
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.singletonList(partecipaMock));

        // When
        PartitaDTO result = partitaService.aggiornaPunteggio(100L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(3, partecipaMock.getPunteggioFinale()); // 2 + 1
        verify(partecipaRepository, times(1)).save(partecipaMock);
    }

    @Test
    void testAggiornaPunteggio_PartitaNonTrovata_RestituisceNull() {
        when(partitaRepository.findById(999L)).thenReturn(Optional.empty());

        PartitaDTO result = partitaService.aggiornaPunteggio(999L, 1L);

        assertNull(result); // Asserzione esplicita se partita non trovata
    }

    @Test
    void testTerminaPartita_Success() {
        when(partitaRepository.findById(100L)).thenReturn(Optional.of(partitaMock));
        when(partitaRepository.save(any(Partita.class))).thenReturn(partitaMock);
        when(partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(100L)).thenReturn(Collections.emptyList());

        PartitaDTO result = partitaService.terminaPartita(100L);

        assertNotNull(result);
        assertNotNull(partitaMock.getTimestampFine());
        assertTrue("TERMINATA".equals(result.getStato())); // Uso esplicito di assertTrue
        verify(mqttPublisherService, times(1)).inviaComandoTerminaPartita(10L);
        verify(partitaRepository, times(1)).save(partitaMock);
    }
}
