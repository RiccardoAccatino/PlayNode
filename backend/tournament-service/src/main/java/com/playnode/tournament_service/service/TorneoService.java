package com.playnode.tournament_service.service;

import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.entity.Torneo;
import com.playnode.tournament_service.repository.TorneoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

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
        torneo.setClassifica("Da definire");

        // NUOVA RIGA: Salviamo anche i locali!
        if (nuovoTorneoDTO.getLocaliIds() != null) {
            torneo.setLocaliIds(nuovoTorneoDTO.getLocaliIds());
        }

        if (nuovoTorneoDTO.getDataFine() != null && nuovoTorneoDTO.getDataFine().isBefore(nuovoTorneoDTO.getDataInizio())) {
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

        // NUOVA RIGA: Estraiamo anche i locali per il frontend!
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

    // Aggiungi questo metodo dentro TorneoService.java

    public TorneoDTO aggiornaTorneo(Long id, TorneoDTO torneoAggiornatoDTO) {
        // 1. Cerchiamo il torneo nel database usando l'ID
        Optional<Torneo> torneoEsistenteOpzionale = torneoRepository.findById(id);

        // 2. Controlliamo se il torneo esiste davvero
        if (torneoEsistenteOpzionale.isPresent()) {

            // Estraiamo l'entità Torneo dal contenitore Optional
            Torneo torneoDaModificare = torneoEsistenteOpzionale.get();

            // 3. Sovrascriviamo i vecchi dati con quelli nuovi arrivati dal DTO
            torneoDaModificare.setNomeTorneo(torneoAggiornatoDTO.getNome());
            torneoDaModificare.setModalita(torneoAggiornatoDTO.getModalita());
            torneoDaModificare.setRegoleDelTorneo(torneoAggiornatoDTO.getRegole());
            torneoDaModificare.setTipologiaGiocoId(torneoAggiornatoDTO.getIdTipologiaGioco());
            torneoDaModificare.setDataInizio(torneoAggiornatoDTO.getDataInizio());
            torneoDaModificare.setDataFine(torneoAggiornatoDTO.getDataFine());

            // Aggiorniamo anche i locali associati, se ci sono stati passati
            if (torneoAggiornatoDTO.getLocaliIds() != null) {
                torneoDaModificare.setLocaliIds(torneoAggiornatoDTO.getLocaliIds());
            }

            // 4. Salviamo il torneo modificato nel database
            // Spring Data JPA capisce in automatico che, avendo già un ID, deve fare un "UPDATE" e non un "INSERT"
            Torneo torneoSalvato = torneoRepository.save(torneoDaModificare);

            // 5. Trasformiamo l'entità salvata di nuovo in un DTO per restituirla al Controller
            return convertiInDTO(torneoSalvato);
        }

        // Se non abbiamo trovato nessun torneo con quell'ID, restituiamo null
        return null;
    }

    // 4. Metodo per eliminare un torneo
    public boolean eliminaTorneo(Long id) {
        // Controlliamo se il torneo esiste nel database
        if (torneoRepository.existsById(id)) {
            // Se esiste, lo eliminiamo
            torneoRepository.deleteById(id);
            return true; // Restituiamo true per dire "tutto ok, eliminato"
        }
        return false; // Restituiamo false se l'ID non c'era
    }
}