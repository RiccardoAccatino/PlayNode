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
     * Quando qualcuno va sull'indirizzo /api/statistiche/{utenteId}, questo metodo si attiva.
     * Restituisce sempre un 200 OK con il DTO popolato (o azzerato).
     */
    @GetMapping("/{utenteId}")
    public ResponseEntity<StatisticaUtenteDTO> ottieniStatisticheUtente(@PathVariable Long utenteId) {

        // Il Service cercherà nel DB usando il metodo corretto o genererà un fallback a zero
        StatisticaUtenteDTO statisticheDto = statisticaService.ottieniStatistichePerUtente(utenteId);

        // Rispondiamo sempre con 200 OK inviando il DTO
        return ResponseEntity.ok(statisticheDto);
    }
}