package com.playnode.auth_service.controller;

import com.playnode.auth_service.dto.UtenteDTO;
import com.playnode.auth_service.dto.UtenteRequest;
import com.playnode.auth_service.service.UtenteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    private final UtenteService utenteService;

    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINPIATTAFORMA','ADMINGIOCO','GESTORE')")
    public List<UtenteDTO> getAllUtenti() {
        return utenteService.ottieniTutti();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINPIATTAFORMA','ADMINGIOCO') or (#id.toString() == authentication.principal)")
    public ResponseEntity<UtenteDTO> getUtente(@PathVariable Integer id) {
        UtenteDTO dto = utenteService.ottieniPerId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINPIATTAFORMA')")
    public ResponseEntity<?> creaUtente(@RequestBody UtenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utenteService.crea(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINPIATTAFORMA') or (#id.toString() == authentication.principal)")
    public ResponseEntity<?> aggiornaUtente(@PathVariable Integer id, @RequestBody UtenteRequest request, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINPIATTAFORMA"));
        UtenteDTO aggiornato = utenteService.aggiorna(id, request, isAdmin);
        if (aggiornato == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(aggiornato);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINPIATTAFORMA')")
    public ResponseEntity<Void> eliminaUtente(@PathVariable Integer id) {
        return utenteService.elimina(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
