package com.playnode.tournament_service.controller;

import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.service.TorneoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tornei")
@Tag(name = "Tornei", description = "API per la gestione del ciclo di vita dei tornei")
@CrossOrigin(origins = "*")
public class TorneoController {

    @Autowired
    private TorneoService torneoService;

    @Operation(summary = "Ottieni tutti i tornei", description = "Restituisce una lista di tutti i tornei presenti nel sistema.")
    @GetMapping
    public ResponseEntity<List<TorneoDTO>> getAllTornei() {
        List<TorneoDTO> tornei = torneoService.ottieniTuttiITornei();
        return ResponseEntity.ok(tornei);
    }

    @Operation(summary = "Crea un nuovo torneo", description = "Registra un nuovo torneo validando che la data di fine sia successiva a quella di inizio.")
    @ApiResponse(responseCode = "201", description = "Torneo creato con successo")
    @ApiResponse(responseCode = "400", description = "Dati del torneo non validi (es. errore nelle date)")
    @PostMapping
    public ResponseEntity<?> creaNuovoTorneo(@RequestBody TorneoDTO torneoDTO) {
        try {
            TorneoDTO torneoCreato = torneoService.creaTorneo(torneoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(torneoCreato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Ottieni torneo per ID", description = "Recupera i dettagli completi di un torneo specifico tramite il suo ID.")
    @ApiResponse(responseCode = "200", description = "Torneo trovato")
    @ApiResponse(responseCode = "404", description = "Torneo non trovato")
    @GetMapping("/{id}")
    public ResponseEntity<TorneoDTO> getTorneoById(@PathVariable Long id) {
        TorneoDTO torneo = torneoService.ottieniTorneoPerId(id);

        if (torneo != null) {
            return ResponseEntity.ok(torneo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Aggiorna un torneo", description = "Modifica i dati di un torneo esistente identificato dall'ID.")
    @ApiResponse(responseCode = "200", description = "Torneo aggiornato")
    @ApiResponse(responseCode = "404", description = "Torneo non trovato")
    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaTorneo(
            @PathVariable Long id,
            @RequestBody TorneoDTO torneoDTO) {
        try {
            TorneoDTO torneoAggiornato = torneoService.aggiornaTorneo(id, torneoDTO);

            if (torneoAggiornato != null) {
                return ResponseEntity.ok(torneoAggiornato);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Elimina un torneo", description = "Rimuove definitivamente un torneo dal database tramite il suo ID.")
    @ApiResponse(responseCode = "204", description = "Torneo eliminato correttamente")
    @ApiResponse(responseCode = "404", description = "Torneo non trovato")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminaTorneo(@PathVariable Long id) {
        boolean eliminato = torneoService.eliminaTorneo(id);

        if (eliminato) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}