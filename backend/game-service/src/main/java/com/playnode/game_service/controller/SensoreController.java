package com.playnode.game_service.controller;

import com.playnode.game_service.dto.SensoreDTO;
import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Sensore;
import com.playnode.game_service.repository.SensoreRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

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
    public ResponseEntity<SensoreDTO> createSensore(@RequestBody SensoreDTO dto) {
        if (dto == null || dto.getIdGiocoFisico() == null) {
            return ResponseEntity.badRequest().build();
        }

        // otteniamo un riferimento al GiocoFisico esistente (non carichiamo l'entità
        // interamente)
        GiocoFisico giocoRef = em.getReference(GiocoFisico.class, dto.getIdGiocoFisico());

        Sensore s = new Sensore();
        s.setGiocoFisico(giocoRef);
        s.setTipo(dto.getTipo());
        s.setPosizione(dto.getPosizione());

        Sensore saved = sensoreRepository.save(s);

        // popola DTO di ritorno
        dto.setId(saved.getIdSensore());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getIdSensore())
                .toUri();

        return ResponseEntity.created(location).body(dto);
    }

    @GetMapping("/gioco/{giocoFisicoId}")
    public ResponseEntity<java.util.List<SensoreDTO>> getSensoriByGioco(@PathVariable Long giocoFisicoId) {
        if (giocoFisicoId == null) {
            return ResponseEntity.badRequest().build();
        }

        java.util.List<Sensore> sens = sensoreRepository.findByGiocoFisicoIdGiocoFisico(giocoFisicoId);
        return ResponseEntity.ok(mapSensoriToDto(sens));
    }

    @GetMapping("/tipologia/{tipologiaId}")
    public ResponseEntity<java.util.List<SensoreDTO>> getSensoriByTipologia(@PathVariable Long tipologiaId) {
        if (tipologiaId == null)
            return ResponseEntity.badRequest().build();

        java.util.List<Sensore> sens = sensoreRepository.findByGiocoFisicoTipologiaGiocoId(tipologiaId);
        return ResponseEntity.ok(mapSensoriToDto(sens));
    }

    private java.util.List<SensoreDTO> mapSensoriToDto(java.util.List<Sensore> sens) {
        java.util.List<SensoreDTO> out = new java.util.ArrayList<>();
        for (Sensore s : sens) {
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
            d.setAttivo(true);
            out.add(d);
        }
        return out;
    }
}