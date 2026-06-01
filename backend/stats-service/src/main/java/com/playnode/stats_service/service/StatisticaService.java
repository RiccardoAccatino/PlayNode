package com.playnode.stats_service.service;

import com.playnode.stats_service.dto.StatisticaUtenteDTO;
import com.playnode.stats_service.entity.StatisticaUtente;
import com.playnode.stats_service.repository.StatisticaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Questa classe è il "cervello" per le statistiche.
 * L'annotazione @Service dice a Spring Boot di gestire questa classe automaticamente.
 */
@Service
public class StatisticaService {

    // @Autowired collega automaticamente il Repository al nostro Service.
    // In questo modo possiamo interrogare il database.
    @Autowired
    private StatisticaRepository statisticaRepository;

    /**
     * Questo metodo cerca le statistiche di un utente nel database e le trasforma in un DTO.
     * Se l'utente non ha ancora statistiche, restituisce un DTO azzerato invece di null.
     * @param utenteId l'ID dell'utente da cercare.
     * @return Il DTO con le statistiche, oppure null se l'utente non esiste.
     */
    public StatisticaUtenteDTO ottieniStatistichePerUtente(Long utenteId) {
        // 1. Chiediamo al Repository di cercare l'Entità nel database
        Optional<StatisticaUtente> statisticaOpzionale = statisticaRepository.findById(utenteId);

        // Creiamo la scatola DTO da restituire
        StatisticaUtenteDTO dto = new StatisticaUtenteDTO();

        // 2. Se l'abbiamo trovata nel database, la mappiamo normalmente
        if (statisticaOpzionale.isPresent()) {
            StatisticaUtente entita = statisticaOpzionale.get();

            dto.setUtenteId(entita.getUtenteId());
            dto.setPartiteGiocate(entita.getPartiteGiocate());
            dto.setVittorie(entita.getVittorie());
            dto.setPunteggioTotale(entita.getPunteggioTotale());
            dto.setIdLocale(entita.getIdLocale());
            dto.setNomeGioco(entita.getNomeGioco());
        } else {
            // Se l'utente non ha ancora statistiche nel DB,
            // invece di dare errore generiamo un profilo pulito con tutti zeri
            dto.setUtenteId(utenteId);
            dto.setPartiteGiocate(0);
            dto.setVittorie(0);
            dto.setPunteggioTotale(0);
            dto.setIdLocale("1");
            dto.setNomeGioco("Nessuno");
        }

        return dto;
    }
}