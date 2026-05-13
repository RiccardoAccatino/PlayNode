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
    public ResponseEntity<?> creaNuovoTorneo(@RequestBody TorneoDTO torneoDTO) {
        try {
            TorneoDTO torneoCreato = torneoService.creaTorneo(torneoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(torneoCreato);
        } catch (IllegalArgumentException e) {
            // Se le date sono sbagliate, catturiamo l'eccezione e mandiamo un "400 Bad Request"
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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



    // API per modificare un torneo esistente
    // PUT: /api/tornei/{id}
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
            // Anche qui, gestiamo l'errore se l'utente prova a modificare le date in modo errato
            return ResponseEntity.badRequest().body(e.getMessage());
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