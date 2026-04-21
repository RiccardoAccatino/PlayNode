package com.playnode.game_service.controller;

import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.service.EventoIotService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot")
public class EventoIotController {

    private final EventoIotService eventoIotService;

    public EventoIotController(EventoIotService eventoIotService) {
        this.eventoIotService = eventoIotService;
    }

    // API: POST /api/iot/evento
    // Il dispositivo Edge userà questa API per inviare i dati.
    @PostMapping("/evento")
    public EventoIot riceviEvento(
            @RequestParam Long idPartita,
            @RequestParam Long idSensore,
            @RequestParam String valore) {

        return eventoIotService.registraEvento(idPartita, idSensore, valore);
    }

    // API: GET /api/iot/partita/{idPartita}
    // Utile per vedere tutti gli eventi registrati in una partita
    @GetMapping("/partita/{idPartita}")
    public List<EventoIot> getEventiDiPartita(@PathVariable Long idPartita) {
        return eventoIotService.ottieniEventiPartita(idPartita);
    }
}