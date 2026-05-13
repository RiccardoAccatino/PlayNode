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
}