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

    // API: GET /api/partite
    @GetMapping
    public List<PartitaDTO> getAllPartite() {
        return partitaService.ottieniTutteLePartite();
    }

    // API: GET /api/partite/locale/{idLocale}
    @GetMapping("/locale/{idLocale}")
    public List<PartitaDTO> ottieniPartiteLivePerLocale(@PathVariable Long idLocale) {
        return partitaService.ottieniPartiteLivePerLocale(idLocale);
    }

    @PostMapping("/avvia/{idGiocoInstallato}")
    public PartitaDTO avviaPartita(@PathVariable Long idGiocoInstallato) {
        return partitaService.avviaNuovaPartita(idGiocoInstallato);
    }

    // API: PUT /api/partite/{idPartita}/punteggio?idSquadra=5
    @PutMapping("/{idPartita}/punteggio")
    public PartitaDTO registraPunto(
            @PathVariable Long idPartita,
            @RequestParam Long idSquadra) {

        return partitaService.aggiornaPunteggio(idPartita, idSquadra);
    }

    @PutMapping("/{idPartita}/termina")
    public PartitaDTO terminaPartita(@PathVariable Long idPartita) {
        return partitaService.terminaPartita(idPartita);
    }
}