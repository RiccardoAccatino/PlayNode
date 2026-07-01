package com.playnode.game_service.controller;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import com.playnode.game_service.service.LocaleEdgeService;
import com.playnode.game_service.service.LocaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locali")
public class LocaleController {

    private final LocaleService localeService;
    private final LocaleEdgeService localeEdgeService;

    public LocaleController(LocaleService localeService, LocaleEdgeService localeEdgeService) {
        this.localeService = localeService;
        this.localeEdgeService = localeEdgeService;
    }

    // API: GET /api/locali
    // Restituisce la lista di tutti i locali registrati
    @GetMapping
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA','GIOCATORE')")
    public List<LocaleDTO> getAllLocali() {
        return localeService.ottieniTuttiILocali();
    }

    @GetMapping("/{idLocale}")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA','GIOCATORE')")
    public ResponseEntity<LocaleDTO> getLocaleById(@PathVariable Long idLocale) {
        LocaleDTO dto = localeService.ottieniLocalePerId(idLocale);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    // API: GET /api/locali/{idLocale}/giochi
    @GetMapping("/{idLocale}/giochi")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA','GIOCATORE')")
    public List<GiocoInstallatoDTO> getGiochiByLocale(@PathVariable Long idLocale) {
        return localeService.ottieniGiochiPerLocale(idLocale);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINPIATTAFORMA')")
    public ResponseEntity<?> creaLocale(@RequestBody LocaleDTO dto) {
        try {
            LocaleDTO creato = localeService.creaLocale(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{idLocale}/host_broker")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#idLocale) or hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public String getHostBrokerByLocale(@PathVariable Long idLocale) {
        return localeService.ottieniHostLocale(idLocale);
    }

    @PutMapping("/{idLocale}")
    @PreAuthorize("hasRole('ADMINPIATTAFORMA')")
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
    @PreAuthorize("hasRole('ADMINPIATTAFORMA')")
    public ResponseEntity<Void> eliminaLocale(@PathVariable Long idLocale) {
        return localeService.eliminaLocale(idLocale)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PostMapping("/{idLocale}/edge/cambia-password")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#idLocale)")
    public ResponseEntity<?> cambiaPasswordEdge(@PathVariable Long idLocale,
            @RequestBody java.util.Map<String, String> body) {
        try {
            return localeEdgeService.cambiaPasswordEdge(idLocale, body.get("password"))
                    .<ResponseEntity<?>>map(msg -> ResponseEntity.ok(java.util.Map.of("message", msg)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{idLocale}/edge/rigenera-token")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#idLocale)")
    public ResponseEntity<?> rigeneraTokenEdge(@PathVariable Long idLocale) {
        return localeEdgeService.rigeneraTokenApi(idLocale)
                .<ResponseEntity<?>>map(token -> ResponseEntity.ok(java.util.Map.of("token", token)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{idLocale}/edge/disconnetti")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#idLocale)")
    public ResponseEntity<?> disconnettiLocale(@PathVariable Long idLocale) {
        return localeEdgeService.disconnettiLocale(idLocale)
                ? ResponseEntity.ok(java.util.Map.of("message", "Componenti edge impostati su Offline."))
                : ResponseEntity.notFound().build();
    }
}
