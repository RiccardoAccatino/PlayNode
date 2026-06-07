package com.playnode.game_service.controller;

import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.repository.PartitaRepository;
import com.playnode.game_service.service.EventoIotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot")
public class EventoIotController {

    private final EventoIotService eventoIotService;
    private final PartitaRepository partitaRepository;

    public EventoIotController(EventoIotService eventoIotService,
                               PartitaRepository partitaRepository) {
        this.eventoIotService = eventoIotService;
        this.partitaRepository = partitaRepository;
    }

    // API: POST /api/iot/evento
    @PostMapping("/evento")
    public ResponseEntity<?> riceviEvento(
            @RequestParam Long idPartita,
            @RequestParam Long idSensore,
            @RequestParam String valore) {

        // Valida che la partita esista prima di inserire l'evento
        if (!partitaRepository.existsById(idPartita)) {
            return ResponseEntity.badRequest()
                    .body("Partita " + idPartita + " non trovata. Avvia prima una nuova partita.");
        }

        EventoIot evento = eventoIotService.registraEvento(idPartita, idSensore, valore);
        return ResponseEntity.ok(evento);
    }

    // API: GET /api/iot/partita/{idPartita}
    @GetMapping("/partita/{idPartita}")
    public List<EventoIot> getEventiDiPartita(@PathVariable Long idPartita) {
        return eventoIotService.ottieniEventiPartita(idPartita);
    }
}