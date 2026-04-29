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
     * @param utenteId l'ID dell'utente da cercare.
     * @return Il DTO con le statistiche, oppure null se l'utente non esiste.
     */
    public StatisticaUtenteDTO ottieniStatistichePerUtente(Long utenteId) {
        // 1. Chiediamo al Repository di cercare l'Entità nel database
        // Nota: Assicurati che nel tuo StatisticaRepository ci sia un metodo findById o simile!
        Optional<StatisticaUtente> statisticaOpzionale = statisticaRepository.findById(utenteId);

        // 2. Se l'abbiamo trovata, la trasformiamo nel nostro DTO
        if (statisticaOpzionale.isPresent()) {
            StatisticaUtente entita = statisticaOpzionale.get();

            // Creiamo una nuova "scatola" DTO e la riempiamo con i dati dell'Entità
            StatisticaUtenteDTO dto = new StatisticaUtenteDTO();
            dto.setUtenteId(entita.getUtenteId());
            dto.setPartiteGiocate(entita.getPartiteGiocate());
            dto.setVittorie(entita.getVittorie());
            dto.setPunteggioTotale(entita.getPunteggioTotale());

            // AGGIUNGI QUESTE DUE RIGHE PER I NUOVI CAMPI:
            dto.setIdLocale(entita.getIdLocale());
            dto.setNomeGioco(entita.getNomeGioco());

            // Restituiamo il DTO pronto per essere spedito!
            return dto;
        }

        // Se l'utente non ha statistiche nel database, per ora restituiamo null
        return null;
    }
}