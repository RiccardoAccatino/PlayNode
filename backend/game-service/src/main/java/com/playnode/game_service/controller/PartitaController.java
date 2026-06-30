package com.playnode.game_service.controller;

import com.playnode.game_service.dto.PartecipaDTO;
import com.playnode.game_service.dto.PartitaDTO;
import com.playnode.game_service.service.PartecipaService;
import com.playnode.game_service.service.PartitaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partite")
public class PartitaController {

    private final PartitaService partitaService;
    private final PartecipaService partecipaService;

    public PartitaController(PartitaService partitaService, PartecipaService partecipaService) {
        this.partitaService = partitaService;
        this.partecipaService = partecipaService;
    }

    // API: GET /api/partite
    @GetMapping
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA','GIOCATORE')")
    public List<PartitaDTO> getAllPartite() {
        return partitaService.ottieniTutteLePartite();
    }

    // API: GET /api/partite/locale/{idLocale}
    @GetMapping("/locale/{idLocale}")
    @PreAuthorize("@localeSecurity.isGestoreOfLocale(#idLocale) or hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public List<PartitaDTO> ottieniPartiteLivePerLocale(@PathVariable Long idLocale) {
        return partitaService.ottieniPartiteLivePerLocale(idLocale);
    }

    @PostMapping("/avvia/{idGiocoInstallato}")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA')")
    public PartitaDTO avviaPartita(
            @PathVariable Long idGiocoInstallato,
            @RequestParam(required = false) Long torneoId,
            @RequestParam(required = false) Long incontroId) {
        return partitaService.avviaNuovaPartita(idGiocoInstallato, torneoId, incontroId);
    }

    // API: PUT /api/partite/{idPartita}/punteggio?idSquadra=5
    @PutMapping("/{idPartita}/punteggio")
    public PartitaDTO registraPunto(
            @PathVariable Long idPartita,
            @RequestParam Long idSquadra) {

        return partitaService.aggiornaPunteggio(idPartita, idSquadra);
    }

    @PutMapping("/{idPartita}/termina")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA')")
    public PartitaDTO terminaPartita(@PathVariable Long idPartita) {
        return partitaService.terminaPartita(idPartita);
    }

    @GetMapping("/{idPartita}/partecipanti")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA','GIOCATORE')")
    public List<PartecipaDTO> elencaPartecipanti(@PathVariable Long idPartita) {
        return partecipaService.elencaPerPartita(idPartita);
    }

    @PostMapping("/{idPartita}/partecipanti")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<?> aggiungiPartecipante(
            @PathVariable Long idPartita,
            @RequestBody Map<String, Long> body) {
        try {
            PartecipaDTO dto = partecipaService.aggiungi(
                    idPartita, body.get("giocatoreId"), body.get("squadraId"));
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{idPartita}/partecipanti/{partecipaId}")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<Void> rimuoviPartecipante(
            @PathVariable Long idPartita,
            @PathVariable Long partecipaId) {
        return partecipaService.rimuovi(idPartita, partecipaId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}