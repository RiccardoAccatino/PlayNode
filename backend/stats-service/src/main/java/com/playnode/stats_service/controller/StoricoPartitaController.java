package com.playnode.stats_service.controller;

import com.playnode.stats_service.dto.StoricoPartitaDTO;
import com.playnode.stats_service.service.StoricoPartitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/storico") // L'indirizzo base per queste richieste
public class StoricoPartitaController {

    @Autowired
    private StoricoPartitaService storicoPartitaService;

    /**
     * Quando qualcuno va sull'indirizzo /api/storico/utente/{utenteId}, si attiva questo metodo.
     */
    @GetMapping("/utente/{utenteId}")
    public ResponseEntity<List<StoricoPartitaDTO>> ottieniStoricoUtente(@PathVariable Long utenteId) {

        // Chiediamo al Service di tradurre i dati
        List<StoricoPartitaDTO> storico = storicoPartitaService.ottieniStoricoPerUtente(utenteId);

        // Anche se la lista è vuota, restituiamo 200 OK (significa: "L'utente non ha ancora giocato, ma la richiesta è corretta")
        return ResponseEntity.ok(storico);
    }
}