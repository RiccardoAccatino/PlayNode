package com.playnode.game_service.controller;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import com.playnode.game_service.service.LocaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locali")
@CrossOrigin(origins = "*")
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

    @PostMapping
    public ResponseEntity<?> creaLocale(@RequestBody LocaleDTO dto) {
        try {
            LocaleDTO creato = localeService.creaLocale(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{idLocale}/host_broker")
    public String getHostBrokerByLocale(@PathVariable Long idLocale) {
        return localeService.ottieniHostBrokerPerLocale(idLocale);
    }

    @PutMapping("/{idLocale}")
    public ResponseEntity<?> aggiornaLocale(@PathVariable Long idLocale, @RequestBody LocaleDTO dto) {
        try {
            LocaleDTO aggiornato = localeService.aggiornaLocale(idLocale, dto);
            if (aggiornato == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(aggiornato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{idLocale}")
    public ResponseEntity<Void> eliminaLocale(@PathVariable Long idLocale) {
        return localeService.eliminaLocale(idLocale)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }


}
