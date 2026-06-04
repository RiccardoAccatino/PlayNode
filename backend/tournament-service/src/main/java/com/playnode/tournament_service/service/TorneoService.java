package com.playnode.tournament_service.service;

import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.entity.Torneo;
import com.playnode.tournament_service.repository.TorneoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TorneoService {

    @Autowired
    private TorneoRepository torneoRepository;

    // 1. Metodo per leggere tutti i tornei
    public List<TorneoDTO> ottieniTuttiITornei() {
        List<Torneo> tornei = torneoRepository.findAll();
        List<TorneoDTO> torneiDTO = new ArrayList<>();

        for (Torneo t : tornei) {
            torneiDTO.add(convertiInDTO(t));
        }
        return torneiDTO;
    }

    // 2. Metodo per creare un nuovo torneo
    public TorneoDTO creaTorneo(TorneoDTO nuovoTorneoDTO) {
        Torneo torneo = new Torneo();
        torneo.setNomeTorneo(nuovoTorneoDTO.getNome());
        torneo.setModalita(nuovoTorneoDTO.getModalita());
        torneo.setRegoleDelTorneo(nuovoTorneoDTO.getRegole());
        torneo.setTipologiaGiocoId(nuovoTorneoDTO.getIdTipologiaGioco());
        torneo.setDataInizio(nuovoTorneoDTO.getDataInizio());
        torneo.setDataFine(nuovoTorneoDTO.getDataFine());

        if (nuovoTorneoDTO.getClassifica() != null && !nuovoTorneoDTO.getClassifica().isEmpty()) {
            torneo.setClassifica(nuovoTorneoDTO.getClassifica());
        } else {
            torneo.setClassifica("Da definire");
        }

        if (nuovoTorneoDTO.getLocaliIds() != null) {
            torneo.setLocaliIds(nuovoTorneoDTO.getLocaliIds());
        }

        if (nuovoTorneoDTO.getDataFine() != null
                && nuovoTorneoDTO.getDataFine().isBefore(nuovoTorneoDTO.getDataInizio())) {
            throw new IllegalArgumentException("La data di fine non può essere precedente alla data di inizio!");
        }

        // Salviamo nel DB
        Torneo torneoSalvato = torneoRepository.save(torneo);
        return convertiInDTO(torneoSalvato);
    }

    // Metodo di supporto per tradurre da Entità a DTO
    private TorneoDTO convertiInDTO(Torneo torneo) {
        TorneoDTO dto = new TorneoDTO();
        dto.setId(torneo.getIdTorneo());
        dto.setNome(torneo.getNomeTorneo());
        dto.setModalita(torneo.getModalita());
        dto.setRegole(torneo.getRegoleDelTorneo());
        dto.setIdTipologiaGioco(torneo.getTipologiaGiocoId());
        dto.setDataInizio(torneo.getDataInizio());
        dto.setDataFine(torneo.getDataFine());
        dto.setClassifica(torneo.getClassifica());
        dto.setLocaliIds(torneo.getLocaliIds());

        return dto;
    }

    public TorneoDTO ottieniTorneoPerId(Long id) {
        // Usiamo Optional perché il torneo potrebbe non esistere nel database
        Optional<Torneo> torneoOpzionale = torneoRepository.findById(id);

        if (torneoOpzionale.isPresent()) {
            return convertiInDTO(torneoOpzionale.get());
        }
        return null; // Se non lo trova, restituisce null
    }

    public TorneoDTO aggiornaTorneo(Long id, TorneoDTO torneoAggiornatoDTO) {
        Optional<Torneo> torneoEsistenteOpzionale = torneoRepository.findById(id);

        if (torneoEsistenteOpzionale.isPresent()) {
            Torneo torneoDaModificare = torneoEsistenteOpzionale.get();

            torneoDaModificare.setNomeTorneo(torneoAggiornatoDTO.getNome());
            torneoDaModificare.setModalita(torneoAggiornatoDTO.getModalita());
            torneoDaModificare.setRegoleDelTorneo(torneoAggiornatoDTO.getRegole());
            torneoDaModificare.setTipologiaGiocoId(torneoAggiornatoDTO.getIdTipologiaGioco());
            torneoDaModificare.setDataInizio(torneoAggiornatoDTO.getDataInizio());
            torneoDaModificare.setDataFine(torneoAggiornatoDTO.getDataFine());
            torneoDaModificare.setClassifica(torneoAggiornatoDTO.getClassifica());
            if (torneoAggiornatoDTO.getLocaliIds() != null) {
                torneoDaModificare.setLocaliIds(torneoAggiornatoDTO.getLocaliIds());
            }

            Torneo torneoSalvato = torneoRepository.save(torneoDaModificare);
            return convertiInDTO(torneoSalvato);
        }
        return null;
    }

    // 4. Metodo per eliminare un torneo
    public boolean eliminaTorneo(Long id) {
        if (torneoRepository.existsById(id)) {
            torneoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}