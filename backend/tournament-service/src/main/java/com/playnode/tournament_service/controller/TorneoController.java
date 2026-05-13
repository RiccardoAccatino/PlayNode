package com.playnode.tournament_service.controller;

import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.service.TorneoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tornei") // Tutti gli URL inizieranno con questo
@CrossOrigin(origins = "*")    // Permette al frontend di fare richieste
public class TorneoController {

    @Autowired
    private TorneoService torneoService;

    // API per ottenere la lista di tutti i tornei
    // GET: /api/tornei
    @GetMapping
    public ResponseEntity<List<TorneoDTO>> getAllTornei() {
        List<TorneoDTO> tornei = torneoService.ottieniTuttiITornei();
        return ResponseEntity.ok(tornei);
    }

    // API per creare un nuovo torneo
    // POST: /api/tornei
    @PostMapping
    public ResponseEntity<TorneoDTO> creaNuovoTorneo(@RequestBody TorneoDTO torneoDTO) {
        TorneoDTO torneoCreato = torneoService.creaTorneo(torneoDTO);
        // Ritorniamo lo stato 201 (Created)
        return ResponseEntity.status(HttpStatus.CREATED).body(torneoCreato);
    }

    // API per ottenere un singolo torneo tramite il suo ID
    // GET: /api/tornei/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TorneoDTO> getTorneoById(@PathVariable Long id) {
        TorneoDTO torneo = torneoService.ottieniTorneoPerId(id);

        if (torneo != null) {
            return ResponseEntity.ok(torneo); // 200 OK
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found se l'ID non esiste
        }
    }

    // Aggiungi questo metodo dentro TorneoController.java

    // API per modificare un torneo esistente
    // PUT: /api/tornei/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TorneoDTO> aggiornaTorneo(
            @PathVariable Long id,
            @RequestBody TorneoDTO torneoDTO) {

        // Chiamiamo il nostro Service passandogli l'ID da cercare e i nuovi dati
        TorneoDTO torneoAggiornato = torneoService.aggiornaTorneo(id, torneoDTO);

        // Se l'aggiornamento è andato a buon fine (il torneo esisteva)
        if (torneoAggiornato != null) {
            return ResponseEntity.ok(torneoAggiornato); // Rispondiamo con stato 200 (OK) e i nuovi dati
        } else {
            // Se il torneo con quell'ID non esiste, restituiamo 404 (Not Found)
            return ResponseEntity.notFound().build();
        }
    }

    // API per eliminare un torneo
    // DELETE: /api/tornei/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminaTorneo(@PathVariable Long id) {
        boolean eliminato = torneoService.eliminaTorneo(id);

        if (eliminato) {
            // 204 No Content è lo standard per una cancellazione andata a buon fine
            return ResponseEntity.noContent().build();
        } else {
            // 404 Not Found se proviamo a eliminare un torneo che non esiste
            return ResponseEntity.notFound().build();
        }
    }
}