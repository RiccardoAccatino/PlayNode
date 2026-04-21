package com.playnode.game_service.controller;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import com.playnode.game_service.service.LocaleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locali")
public class LocaleController {

    private final LocaleService localeService;

    public LocaleController(LocaleService localeService) {
        this.localeService = localeService;
    }

    // API: GET /api/locali
    // Restituisce la lista di tutti i locali registrati
    @GetMapping
    public List<LocaleDTO> getAllLocali() {
        return localeService.ottieniTuttiILocali();
    }

    // API: GET /api/locali/{idLocale}/giochi
    // Restituisce la lista dei giochi fisici presenti in un determinato locale
    @GetMapping("/{idLocale}/giochi")
    public List<GiocoInstallatoDTO> getGiochiByLocale(@PathVariable Long idLocale) {
        return localeService.ottieniGiochiPerLocale(idLocale);
    }
}