package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.entity.Partecipa;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PartitaService {

    private final PartitaRepository partitaRepository;
    private final PartecipaRepository partecipaRepository; // Aggiunto il nuovo magazziniere!

    public PartitaService(PartitaRepository partitaRepository, PartecipaRepository partecipaRepository) {
        this.partitaRepository = partitaRepository;
        this.partecipaRepository = partecipaRepository;
    }

    public List<PartitaDTO> ottieniTutteLePartite() {
        List<Partita> partiteDalDb = partitaRepository.findAll();
        List<PartitaDTO> dtos = new ArrayList<>();

        for(Partita p : partiteDalDb) {
            dtos.add(convertiInDTO(p));
        }
        return dtos;
    }

    public PartitaDTO avviaNuovaPartita(Long idGiocoInstallato) {
        Partita nuovaPartita = new Partita();
        nuovaPartita.setGiocoFisicoId(idGiocoInstallato);
        nuovaPartita.setTimestampInizio(LocalDateTime.now());

        Partita partitaSalvata = partitaRepository.save(nuovaPartita);
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

            Partita partitaAggiornata = partitaRepository.save(partita);
            return convertiInDTO(partitaAggiornata);
        }
        return null;
    }

    private PartitaDTO convertiInDTO(Partita partita) {
        PartitaDTO dto = new PartitaDTO();
        dto.setId(partita.getIdPartita());
        dto.setIdGiocoInstallato(partita.getGiocoFisicoId());

        if (partita.getTimestampFine() != null) {
            dto.setStato("TERMINATA");
        } else {
            dto.setStato("IN_CORSO");
        }
        return dto;
    }
}