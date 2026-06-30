package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.entity.Partecipa;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.sql.Timestamp;

@Service
public class PartitaService {

    private final PartitaRepository partitaRepository;
    private final PartecipaRepository partecipaRepository;
    private final MqttPublisherService mqttPublisherService;
    private final MqttOutboxService mqttOutboxService;
    private final TournamentCallbackService tournamentCallbackService;
    private final String defaultBrokerUrl;

    public PartitaService(PartitaRepository partitaRepository,
            PartecipaRepository partecipaRepository,
            MqttPublisherService mqttPublisherService,
            MqttOutboxService mqttOutboxService,
            TournamentCallbackService tournamentCallbackService,
            @Value("${mqtt.broker.url}") String defaultBrokerUrl) {
        this.partitaRepository = partitaRepository;
        this.partecipaRepository = partecipaRepository;
        this.mqttPublisherService = mqttPublisherService;
        this.mqttOutboxService = mqttOutboxService;
        this.tournamentCallbackService = tournamentCallbackService;
        this.defaultBrokerUrl = defaultBrokerUrl;
    }

    public List<PartitaDTO> ottieniTutteLePartite() {
        List<Partita> partiteDalDb = partitaRepository.findAll();
        List<PartitaDTO> dtos = new ArrayList<>();

        for (Partita p : partiteDalDb) {
            dtos.add(convertiInDTO(p));
        }
        return dtos;
    }

    @Transactional
    public PartitaDTO avviaNuovaPartita(Long idGiocoInstallato, Long torneoId, Long incontroId) {
        if (partitaRepository.existsByGiocoFisicoIdAndTimestampFineIsNull(idGiocoInstallato)) {
            throw new IllegalStateException("Esiste già una partita in corso per questo gioco.");
        }

        String brokerUrl = mqttPublisherService.risolviBrokerUrl(idGiocoInstallato);
        if (brokerUrl == null || brokerUrl.isBlank()) {
            brokerUrl = defaultBrokerUrl;
        }
        if (brokerUrl == null || brokerUrl.isBlank()) {
            throw new IllegalStateException("Broker MQTT non configurato per il gioco " + idGiocoInstallato);
        }

        Partita nuovaPartita = new Partita();
        nuovaPartita.setGiocoFisicoId(idGiocoInstallato);
        nuovaPartita.setTorneoId(torneoId);
        nuovaPartita.setTimestampInizio(LocalDateTime.now());

        Partita partitaSalvata = partitaRepository.save(nuovaPartita);

        if (incontroId != null) {
            tournamentCallbackService.collegaPartitaAIncontro(incontroId, partitaSalvata.getIdPartita());
        }

        String topic = "playnode/server/comandi";
        String payload = "{\"idGiocoFisico\":" + partitaSalvata.getGiocoFisicoId() +",\"idPartita\":" + partitaSalvata.getIdPartita() + "}";
        mqttOutboxService.accoda("AVVIO_PARTITA", topic, payload, brokerUrl, partitaSalvata.getIdPartita());

        return convertiInDTO(partitaSalvata);
    }

    public PartitaDTO aggiornaPunteggio(Long idPartita, Long idSquadra) {
        Optional<Partita> partitaOp = partitaRepository.findById(idPartita);


        if (partitaOp.isPresent()) {
            Optional<Partecipa> partecipaOp = partecipaRepository.findByPartitaIdAndSquadraId(idPartita, idSquadra);

            Partecipa partecipa;
            if (partecipaOp.isPresent()) {
                partecipa = partecipaOp.get();
                partecipa.setPunteggioFinale(partecipa.getPunteggioFinale() + 1);
            } else {
                partecipa = new Partecipa();
                partecipa.setPartitaId(idPartita);
                partecipa.setSquadraId(idSquadra);
                partecipa.setPunteggioFinale(1);
            }

            partecipaRepository.save(partecipa);

            return convertiInDTO(partitaOp.get());
        }
        return null;
    }

    @Transactional
    public PartitaDTO terminaPartita(Long idPartita) {
        Optional<Partita> partitaOp = partitaRepository.findById(idPartita);

        if (partitaOp.isPresent()) {
            Partita partita = partitaOp.get();
            partita.setTimestampFine(LocalDateTime.now());

            Partita partitaAggiornata = partitaRepository.save(partita);

            String brokerUrl = mqttPublisherService.risolviBrokerUrl(partita.getGiocoFisicoId());
            if (brokerUrl != null && !brokerUrl.isBlank()) {
                String topic = "edge/gioco/" + partita.getGiocoFisicoId() + "/comandi";
                String payload = "{\"termina_partita\": true}";
                mqttOutboxService.accoda("TERMINA_PARTITA", topic, payload, brokerUrl, partita.getIdPartita());
            }

            tournamentCallbackService.notificaFinePartita(partita.getIdPartita());

            return convertiInDTO(partitaAggiornata);
        }
        return null;
    }

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public List<PartitaDTO> ottieniPartiteLivePerLocale(Long idLocale) {
        List<Object[]> risultati = partitaRepository.trovaPartiteLiveGrezzePerLocale(idLocale);
        List<PartitaDTO> dtos = new ArrayList<>();

        for (Object[] riga : risultati) {
            PartitaDTO dto = new PartitaDTO();

            dto.setId(((Number) riga[0]).longValue());
            dto.setIdGiocoInstallato(((Number) riga[1]).longValue());
            dto.setStato("IN_CORSO");

            if (riga[2] != null) {
                LocalDateTime inizio = ((Timestamp) riga[2]).toLocalDateTime();
                dto.setTimestampInizio(inizio.format(ISO_FORMATTER));
            }
            dto.setTimestampFine(null);

            dto.setPunteggio1(((Number) riga[3]).intValue());
            dto.setPunteggio2(((Number) riga[4]).intValue());

            dtos.add(dto);
        }
        return dtos;
    }

    private PartitaDTO convertiInDTO(Partita partita) {
        PartitaDTO dto = new PartitaDTO();
        dto.setId(partita.getIdPartita());
        dto.setIdGiocoInstallato(partita.getGiocoFisicoId());

        if (partita.getTimestampInizio() != null) {
            dto.setTimestampInizio(partita.getTimestampInizio().format(ISO_FORMATTER));
        }
        if (partita.getTimestampFine() != null) {
            dto.setTimestampFine(partita.getTimestampFine().format(ISO_FORMATTER));
            dto.setStato("TERMINATA");
        } else {
            dto.setStato("IN_CORSO");
        }

        List<Partecipa> partecipazioni = partecipaRepository
                .findByPartitaIdOrderByIdPartecipaAsc(partita.getIdPartita());
        if (!partecipazioni.isEmpty()) {
            dto.setPunteggio1(partecipazioni.get(0).getPunteggioFinale() != null
                    ? partecipazioni.get(0).getPunteggioFinale()
                    : 0);
            if (partecipazioni.size() > 1) {
                dto.setPunteggio2(partecipazioni.get(1).getPunteggioFinale() != null
                        ? partecipazioni.get(1).getPunteggioFinale()
                        : 0);
            }
        }

        return dto;
    }
}
