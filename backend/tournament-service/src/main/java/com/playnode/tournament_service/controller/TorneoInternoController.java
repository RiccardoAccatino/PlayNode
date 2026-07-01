package com.playnode.tournament_service.controller;

import com.playnode.tournament_service.service.TorneoTabelloneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tornei/interno")
public class TorneoInternoController {

    private final TorneoTabelloneService torneoTabelloneService;

    public TorneoInternoController(TorneoTabelloneService torneoTabelloneService) {
        this.torneoTabelloneService = torneoTabelloneService;
    }

    @PostMapping("/partite/{partitaId}/avanza")
    public ResponseEntity<Void> avanzaDaPartita(@PathVariable Long partitaId) {
        torneoTabelloneService.avanzaDaPartita(partitaId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/incontri/{incontroId}/collega-partita")
    public ResponseEntity<Void> collegaPartita(
            @PathVariable Long incontroId,
            @RequestParam Long partitaId) {
        torneoTabelloneService.collegaPartita(incontroId, partitaId);
        return ResponseEntity.ok().build();
    }
}
