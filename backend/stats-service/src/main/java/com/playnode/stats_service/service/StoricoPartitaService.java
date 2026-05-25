package com.playnode.stats_service.service;

import com.playnode.stats_service.dto.StoricoPartitaDTO;
import com.playnode.stats_service.entity.StoricoPartita;
import com.playnode.stats_service.repository.StoricoPartitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StoricoPartitaService {

    @Autowired
    private StoricoPartitaRepository storicoPartitaRepository;

    /**
     * Trova tutte le partite giocate da un utente e le trasforma in DTO.
     */
    public List<StoricoPartitaDTO> ottieniStoricoPerUtente(Long utenteId) {
        // 1. Chiediamo al database tutte le partite dell'utente
        List<StoricoPartita> partite = storicoPartitaRepository.findByUtenteId(utenteId);

        // 2. Prepariamo una lista vuota per le nostre scatole DTO
        List<StoricoPartitaDTO> listaDto = new ArrayList<>();

        // 3. Trasformiamo ogni Entità in un DTO
        for (StoricoPartita partita : partite) {
            StoricoPartitaDTO dto = new StoricoPartitaDTO();
            dto.setId(partita.getId());
            dto.setUtenteId(partita.getUtenteId());
            dto.setGiocoId(partita.getGiocoId());
            dto.setPunteggioOttenuto(partita.getPunteggioOttenuto());
            dto.setDataPartita(partita.getDataPartita());

            // Aggiungiamo il DTO alla nostra lista pronta per la spedizione
            listaDto.add(dto);
        }

        return listaDto;
    }
}