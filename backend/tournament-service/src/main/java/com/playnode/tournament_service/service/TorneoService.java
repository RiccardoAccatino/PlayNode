package com.playnode.tournament_service.service;

import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.entity.Torneo;
import com.playnode.tournament_service.repository.TorneoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        torneo.setClassifica("Da definire"); // Impostazione di default

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
        return dto;
    }
}