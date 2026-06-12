package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.entity.Partecipa;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PartitaService {

    private final PartitaRepository partitaRepository;
    private final PartecipaRepository partecipaRepository;
    private final MqttPublisherService mqttPublisherService; // 1. Aggiunto il Publisher

    // 2. Aggiunto al costruttore
    public PartitaService(PartitaRepository partitaRepository,
            PartecipaRepository partecipaRepository,
            MqttPublisherService mqttPublisherService) {
        this.partitaRepository = partitaRepository;
        this.partecipaRepository = partecipaRepository;
        this.mqttPublisherService = mqttPublisherService;
    }

    public List<PartitaDTO> ottieniTutteLePartite() {
        List<Partita> partiteDalDb = partitaRepository.findAll();
        List<PartitaDTO> dtos = new ArrayList<>();

        for (Partita p : partiteDalDb) {
            dtos.add(convertiInDTO(p));
        }
        return dtos;
    }

    public PartitaDTO avviaNuovaPartita(Long idGiocoInstallato ) {
        Partita nuovaPartita = new Partita();
        nuovaPartita.setGiocoFisicoId(idGiocoInstallato);
        nuovaPartita.setTimestampInizio(LocalDateTime.now());

        Partita partitaSalvata = partitaRepository.save(nuovaPartita);

        // 3. COMUNICAZIONE ALL'EDGE GATEWAY VIA MQTT
        mqttPublisherService.inviaComandoAvvioPartita(idGiocoInstallato, partitaSalvata.getIdPartita());

        return convertiInDTO(partitaSalvata);
    }

    // Ecco la nuova logica per i punteggi!
    public PartitaDTO aggiornaPunteggio(Long idPartita, Long idSquadra) {
        Optional<Partita> partitaOp = partitaRepository.findById(idPartita);

        if (partitaOp.isPresent()) {
            // Cerchiamo se la squadra sta già giocando questa partita
            Optional<Partecipa> partecipaOp = partecipaRepository.findByPartitaIdAndSquadraId(idPartita, idSquadra);

            Partecipa partecipa;
            if (partecipaOp.isPresent()) {
                // Se esiste già, aumentiamo il punteggio di 1
                partecipa = partecipaOp.get();
                partecipa.setPunteggioFinale(partecipa.getPunteggioFinale() + 1);
            } else {
                // Altrimenti è il primo punto! Creiamo il record.
                partecipa = new Partecipa();
                partecipa.setPartitaId(idPartita);
                partecipa.setSquadraId(idSquadra);
                partecipa.setPunteggioFinale(1);
            }

            // Salviamo il punto nel database!
            partecipaRepository.save(partecipa);

            return convertiInDTO(partitaOp.get());
        }
        return null; // Ritorna null se l'ID della partita è sbagliato
    }

    public PartitaDTO terminaPartita(Long idPartita) {
        Optional<Partita> partitaOp = partitaRepository.findById(idPartita);

        if (partitaOp.isPresent()) {
            Partita partita = partitaOp.get();
            partita.setTimestampFine(LocalDateTime.now());

            // 1. Salva la fine partita nel DB
            Partita partitaAggiornata = partitaRepository.save(partita);

            // 2. COMUNICAZIONE ALL'EDGE GATEWAY VIA MQTT
            // Diciamo al Raspberry di fermare il tracciamento dei punti
            mqttPublisherService.inviaComandoTerminaPartita(partita.getGiocoFisicoId());

            return convertiInDTO(partitaAggiornata);
        }
        return null;
    }

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

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