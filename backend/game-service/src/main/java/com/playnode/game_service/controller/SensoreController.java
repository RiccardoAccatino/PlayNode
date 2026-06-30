package com.playnode.game_service.controller;

import com.playnode.game_service.dto.SensoreDTO;
import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Sensore;
import com.playnode.game_service.repository.SensoreRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/sensori")
public class SensoreController {

    private final SensoreRepository sensoreRepository;
    private final EntityManager em;

    @Autowired
    public SensoreController(SensoreRepository sensoreRepository, EntityManager em) {
        this.sensoreRepository = sensoreRepository;
        this.em = em;
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<SensoreDTO> createSensore(@RequestBody SensoreDTO dto) {
        if (dto == null || dto.getIdGiocoFisico() == null) {
            return ResponseEntity.badRequest().build();
        }

        GiocoFisico giocoRef = em.getReference(GiocoFisico.class, dto.getIdGiocoFisico());

        Sensore s = new Sensore();
        s.setGiocoFisico(giocoRef);
        s.setTipo(dto.getTipo());
        s.setPosizione(dto.getPosizione());
        s.setAttivo(dto.getAttivo() != null ? dto.getAttivo() : true);

        Sensore saved = sensoreRepository.save(s);
        dto.setId(saved.getIdSensore());
        dto.setAttivo(saved.getAttivo());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getIdSensore())
                .toUri();

        return ResponseEntity.created(location).body(dto);
    }

    @GetMapping("/gioco/{giocoFisicoId}")
    @PreAuthorize("hasAnyRole('GESTORE','ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<List<SensoreDTO>> getSensoriByGioco(@PathVariable Long giocoFisicoId) {
        if (giocoFisicoId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Sensore> sens = sensoreRepository.findByGiocoFisicoIdGiocoFisico(giocoFisicoId);
        return ResponseEntity.ok(mapSensoriToDto(sens));
    }

    @GetMapping("/tipologia/{tipologiaId}")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<List<SensoreDTO>> getSensoriByTipologia(@PathVariable Long tipologiaId) {
        if (tipologiaId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Sensore> sens = sensoreRepository.findByGiocoFisicoTipologiaGiocoId(tipologiaId);
        return ResponseEntity.ok(mapSensoriToDto(sens));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<Void> deleteSensore(@PathVariable Long id) {
        if (!sensoreRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sensoreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<SensoreDTO> toggleSensore(@PathVariable Long id) {
        return sensoreRepository.findById(id)
                .map(s -> {
                    boolean nuovoStato = !Boolean.TRUE.equals(s.getAttivo());
                    s.setAttivo(nuovoStato);
                    Sensore saved = sensoreRepository.save(s);
                    return ResponseEntity.ok(mapSensoreToDto(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private List<SensoreDTO> mapSensoriToDto(List<Sensore> sens) {
        List<SensoreDTO> out = new ArrayList<>();
        for (Sensore s : sens) {
            out.add(mapSensoreToDto(s));
        }
        return out;
    }

    private SensoreDTO mapSensoreToDto(Sensore s) {
        SensoreDTO d = new SensoreDTO();
        d.setId(s.getIdSensore());
        if (s.getGiocoFisico() != null) {
            d.setIdGiocoFisico(s.getGiocoFisico().getIdGiocoFisico());
            d.setTipologiaId(s.getGiocoFisico().getTipologiaGiocoId());
        }
        d.setTipo(s.getTipo());
        d.setPosizione(s.getPosizione());
        d.setNomeSensore(
                s.getPosizione() != null ? s.getPosizione()
                        : (s.getTipo() != null ? s.getTipo() : "Sensore"));
        d.setDescrizione(null);
        d.setUnitaMisura(null);
        d.setValoreMin(null);
        d.setValoreMax(null);
        d.setAttivo(Boolean.TRUE.equals(s.getAttivo()));
        return d;
    }
}
