package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartecipaDTO;
import com.playnode.game_service.entity.Partecipa;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PartecipaService {

    private final PartecipaRepository partecipaRepository;
    private final PartitaRepository partitaRepository;

    public PartecipaService(PartecipaRepository partecipaRepository, PartitaRepository partitaRepository) {
        this.partecipaRepository = partecipaRepository;
        this.partitaRepository = partitaRepository;
    }

    public List<PartecipaDTO> elencaPerPartita(Long partitaId) {
        if (!partitaRepository.existsById(partitaId)) {
            throw new IllegalArgumentException("Partita non trovata: " + partitaId);
        }
        List<PartecipaDTO> out = new ArrayList<>();
        for (Partecipa p : partecipaRepository.findByPartitaIdOrderByIdPartecipaAsc(partitaId)) {
            out.add(toDto(p));
        }
        return out;
    }

    @Transactional
    public PartecipaDTO aggiungi(Long partitaId, Long giocatoreId, Long squadraId) {
        Partita partita = partitaRepository.findById(partitaId)
                .orElseThrow(() -> new IllegalArgumentException("Partita non trovata: " + partitaId));
        if (partita.getTimestampFine() != null) {
            throw new IllegalStateException("Impossibile aggiungere partecipanti a una partita terminata.");
        }
        boolean hasGiocatore = giocatoreId != null;
        boolean hasSquadra = squadraId != null;
        if (hasGiocatore == hasSquadra) {
            throw new IllegalArgumentException("Specificare esattamente giocatoreId oppure squadraId.");
        }
        if (hasGiocatore) {
            Optional<Partecipa> esistente = partecipaRepository.findByPartitaIdAndGiocatoreId(partitaId, giocatoreId);
            if (esistente.isPresent()) {
                throw new IllegalStateException("Il giocatore è già iscritto a questa partita.");
            }
        } else {
            Optional<Partecipa> esistente = partecipaRepository.findByPartitaIdAndSquadraId(partitaId, squadraId);
            if (esistente.isPresent()) {
                throw new IllegalStateException("La squadra è già iscritta a questa partita.");
            }
        }

        Partecipa partecipa = new Partecipa();
        partecipa.setPartitaId(partitaId);
        partecipa.setGiocatoreId(giocatoreId);
        partecipa.setSquadraId(squadraId);
        partecipa.setPunteggioFinale(0);
        partecipa.setVittoria(false);
        return toDto(partecipaRepository.save(partecipa));
    }

    @Transactional
    public boolean rimuovi(Long partitaId, Long partecipaId) {
        Optional<Partecipa> op = partecipaRepository.findById(partecipaId);
        if (op.isEmpty() || !partitaId.equals(op.get().getPartitaId())) {
            return false;
        }
        partecipaRepository.deleteById(partecipaId);
        return true;
    }

    private PartecipaDTO toDto(Partecipa p) {
        PartecipaDTO dto = new PartecipaDTO();
        dto.setId(p.getIdPartecipa());
        dto.setPartitaId(p.getPartitaId());
        dto.setGiocatoreId(p.getGiocatoreId());
        dto.setSquadraId(p.getSquadraId());
        dto.setPunteggioFinale(p.getPunteggioFinale());
        dto.setVittoria(p.getVittoria());
        return dto;
    }
}
