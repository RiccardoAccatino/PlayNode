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
}