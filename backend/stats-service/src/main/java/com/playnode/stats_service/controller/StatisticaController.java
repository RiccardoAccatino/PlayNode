package com.playnode.stats_service.controller;

import com.playnode.stats_service.dto.StatisticaUtenteDTO;
import com.playnode.stats_service.service.StatisticaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Questo è il Controller. Riceve le richieste da Internet.
 * @RestController e @RequestMapping dicono a Spring Boot che questa classe risponde agli URL che iniziano con "/api/statistiche"
 */
@RestController
@RequestMapping("/api/statistiche")
public class StatisticaController {

    // Colleghiamo il nostro nuovo Service! Non usiamo più il Repository qui.
    @Autowired
    private StatisticaService statisticaService;

    /**
     * Quando qualcuno va sull'indirizzo /api/statistiche/{id}, questo metodo si attiva.
     * Restituisce il nostro nuovo DTO invece dell'Entità.
     */
    @GetMapping("/{utenteId}")
    public ResponseEntity<StatisticaUtenteDTO> ottieniStatisticheUtente(@PathVariable Long utenteId) {

        // Chiediamo al Service di fare tutto il lavoro duro (cercare e trasformare)
        StatisticaUtenteDTO statisticheDto = statisticaService.ottieniStatistichePerUtente(utenteId);

        // Se il Service ha trovato i dati, rispondiamo con un bel "200 OK" e inviamo il DTO
        if (statisticheDto != null) {
            return ResponseEntity.ok(statisticheDto);
        } else {
            // Se non ha trovato nulla, rispondiamo con un "404 Not Found" (Non trovato)
            return ResponseEntity.notFound().build();
        }
    }
}