package com.playnode.game_service.controller;

import com.playnode.game_service.dto.IotStatoLocaleDTO;
import com.playnode.game_service.dto.StatisticaLocaleDTO;
import com.playnode.game_service.service.IotStatoService;
import com.playnode.game_service.service.StatisticaLocaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatisticaLocaleController {

    private final StatisticaLocaleService statisticaLocaleService;
    private final IotStatoService iotStatoService;

    public StatisticaLocaleController(StatisticaLocaleService statisticaLocaleService,
            IotStatoService iotStatoService) {
        this.statisticaLocaleService = statisticaLocaleService;
        this.iotStatoService = iotStatoService;
    }

    @GetMapping("/statistiche/locale/{localeId}")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#localeId) or hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<StatisticaLocaleDTO> statisticheLocale(@PathVariable Long localeId) {
        return statisticaLocaleService.ottieniStatistichePerLocale(localeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/iot/stato/{localeId}")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#localeId) or hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<IotStatoLocaleDTO> statoIotLocale(@PathVariable Long localeId) {
        return iotStatoService.ottieniStatoPerLocale(localeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
