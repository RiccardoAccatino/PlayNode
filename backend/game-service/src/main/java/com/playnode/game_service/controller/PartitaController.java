package com.playnode.game_service.controller;

import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.service.PartitaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/partite")
public class PartitaController {

    private final PartitaService partitaService;

    public PartitaController(PartitaService partitaService) {
        this.partitaService = partitaService;
    }

    @GetMapping
    public List<PartitaDTO> getAllPartite() {
        return partitaService.ottieniTutteLePartite();
    }

    @PostMapping("/avvia/{idGiocoInstallato}")
    public PartitaDTO avviaPartita(@PathVariable Long idGiocoInstallato) {
        return partitaService.avviaNuovaPartita(idGiocoInstallato);
    }
    // API: PUT /api/partite/{idPartita}/punteggio?squadra=1
    // Aggiorna il punteggio della partita specificata
    @PutMapping("/{idPartita}/punteggio")
    public PartitaDTO registraPunto(
            @PathVariable Long idPartita,
            @RequestParam int squadra) {

        // Chiamiamo il Service passandogli l'ID della partita e la squadra che ha segnato
        return partitaService.aggiornaPunteggio(idPartita, squadra);
    }
    // API: PUT /api/partite/{idPartita}/termina
    // Segna la partita come conclusa
    @PutMapping("/{idPartita}/termina")
    public PartitaDTO terminaPartita(@PathVariable Long idPartita) {

        // Chiamiamo il Service per terminare la partita
        return partitaService.terminaPartita(idPartita);
    }
}