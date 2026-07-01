package com.playnode.stats_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.playnode.stats_service.entity.Partecipa;
import com.playnode.stats_service.entity.Partita;
import com.playnode.stats_service.repository.PartecipaRepository;
import com.playnode.stats_service.repository.PartitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MqttMatchEndPersistenceService {

    private final PartecipaRepository partecipaRepository;
    private final PartitaRepository partitaRepository;

    public MqttMatchEndPersistenceService(PartecipaRepository partecipaRepository,
            PartitaRepository partitaRepository) {
        this.partecipaRepository = partecipaRepository;
        this.partitaRepository = partitaRepository;
    }

    @Transactional
    public boolean salvaFinePartita(JsonNode dati, String topic) {
        Long utenteId = dati.has("idUtente") ? dati.get("idUtente").asLong()
                : (dati.has("utenteId") ? dati.get("utenteId").asLong() : null);
        Long partitaId = dati.has("idPartita") ? dati.get("idPartita").asLong()
                : (dati.has("partitaId") ? dati.get("partitaId").asLong() : null);

        if (utenteId == null || partitaId == null) {
            return false;
        }

        int punteggio = dati.has("punteggio") ? dati.get("punteggio").asInt() : 0;
        boolean vittoria = dati.has("vittoria") && dati.get("vittoria").asBoolean();

        Optional<Partecipa> esistente = partecipaRepository.findByPartitaIdAndGiocatoreId(partitaId, utenteId);
        Partecipa partecipa = esistente.orElseGet(Partecipa::new);
        partecipa.setPartitaId(partitaId);
        partecipa.setGiocatoreId(utenteId);
        partecipa.setPunteggioFinale(punteggio);
        partecipa.setVittoria(vittoria);
        partecipaRepository.save(partecipa);

        Optional<Partita> partitaOp = partitaRepository.findById(partitaId);
        if (partitaOp.isPresent()) {
            Partita partita = partitaOp.get();
            if (partita.getTimestampFine() == null) {
                partita.setTimestampFine(LocalDateTime.now());
                partitaRepository.save(partita);
            }
        }

        return true;
    }
}
