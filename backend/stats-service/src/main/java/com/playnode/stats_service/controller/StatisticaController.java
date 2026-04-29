package com.playnode.stats_service.controller;

import com.playnode.stats_service.repository.StoricoPartitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*") // Permette al frontend dei tuoi amici di leggere i dati senza blocchi di sicurezza
public class StatisticaController {

    // Colleghiamo il nostro nuovo Repository che sa fare i calcoli
    @Autowired
    private StoricoPartitaRepository repository;

    // 1. ENDPOINT PER IL GIOCATORE
    // Il frontend lo chiama per avere i totali di un utente specifico
    @GetMapping("/user/{idUtente}")
    public ResponseEntity<Map<String, Object>> getStatisticheUtente(@PathVariable Long idUtente) {

        // Chiediamo al database di fare i calcoli al volo!
        long partiteGiocate = repository.countByIdUtente(idUtente);
        long punteggioTotale = repository.sumPunteggioTotaleByIdUtente(idUtente);

        // Creiamo un pacchetto (Map) con i risultati da inviare al frontend
        Map<String, Object> risposta = new HashMap<>();
        risposta.put("partiteGiocate", partiteGiocate);
        risposta.put("punteggioTotale", punteggioTotale);

        return ResponseEntity.ok(risposta);
    }

    // 2. ENDPOINT PER L'ADMIN LOCALE
    // Il frontend lo chiama per sapere quante partite sono state fatte nel suo bar
    @GetMapping("/locale/{idLocale}")
    public ResponseEntity<Map<String, Object>> getStatisticheLocale(@PathVariable String idLocale) {

        long partiteTotaliLocale = repository.countByIdLocale(idLocale);

        Map<String, Object> risposta = new HashMap<>();
        risposta.put("partiteTotali", partiteTotaliLocale);

        return ResponseEntity.ok(risposta);
    }

    // 3. ENDPOINT PER L'ADMIN PIATTAFORMA
    // Il frontend lo chiama per avere le statistiche globali di un singolo gioco
    @GetMapping("/game/{nomeGioco}")
    public ResponseEntity<Map<String, Object>> getStatisticheGioco(@PathVariable String nomeGioco) {

        long partiteGlobali = repository.countByNomeGioco(nomeGioco);

        Map<String, Object> risposta = new HashMap<>();
        risposta.put("partiteGlobali", partiteGlobali);

        return ResponseEntity.ok(risposta);
    }
}