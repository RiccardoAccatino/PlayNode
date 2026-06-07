package com.playnode.auth_service.controller;

import com.playnode.auth_service.dto.UtenteDTO;
import com.playnode.auth_service.dto.UtenteRequest;
import com.playnode.auth_service.service.UtenteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
@CrossOrigin(origins = "*")
public class UtenteController {

    private final UtenteService utenteService;

    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }

    @GetMapping
    public List<UtenteDTO> getAllUtenti() {
        return utenteService.ottieniTutti();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtenteDTO> getUtente(@PathVariable Integer id) {
        UtenteDTO dto = utenteService.ottieniPerId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> creaUtente(@RequestBody UtenteRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(utenteService.crea(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaUtente(@PathVariable Integer id, @RequestBody UtenteRequest request) {
        try {
            UtenteDTO aggiornato = utenteService.aggiorna(id, request);
            if (aggiornato == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(aggiornato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminaUtente(@PathVariable Integer id) {
        return utenteService.elimina(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
