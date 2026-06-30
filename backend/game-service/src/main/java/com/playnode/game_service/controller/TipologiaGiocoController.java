package com.playnode.game_service.controller;

import com.playnode.game_service.dto.TipologiaGiocoDTO;
import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import com.playnode.game_service.service.TipologiaGiocoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tipologie-gioco")
public class TipologiaGiocoController {

    @Autowired
    private TipologiaGiocoRepository tipologiaGiocoRepository;

    @Autowired
    private TipologiaGiocoService tipologiaGiocoService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TipologiaGiocoDTO>> ottieniTutteLeTipologie() {
        List<TipologiaGioco> tipologie = tipologiaGiocoRepository.findAll();
        List<TipologiaGiocoDTO> dtos = new ArrayList<>();

        for (TipologiaGioco t : tipologie) {
            dtos.add(toDto(t));
        }

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<TipologiaGiocoDTO> creaNuovaTipologia(@RequestBody TipologiaGiocoDTO body) {
        TipologiaGioco tipologia = new TipologiaGioco();
        tipologia.setNomeTipologiaGioco(body.getNome() != null ? body.getNome() : "Nuovo gioco");
        tipologia.setDescrizione(body.getDescrizione() != null ? body.getDescrizione() : "-");
        tipologia.setRegole(body.getRegole() != null ? body.getRegole() : "-");
        TipologiaGioco salvata = tipologiaGiocoService.save(tipologia);
        return new ResponseEntity<>(toDto(salvata), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<?> aggiornaTipologia(@PathVariable Long id, @RequestBody TipologiaGiocoDTO body) {
        return tipologiaGiocoService.aggiorna(
                id,
                body.getNome(),
                body.getDescrizione(),
                body.getRegole())
                .<ResponseEntity<?>>map(t -> ResponseEntity.ok(toDto(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public ResponseEntity<?> eliminaTipologia(@PathVariable Long id) {
        try {
            return tipologiaGiocoService.elimina(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    private TipologiaGiocoDTO toDto(TipologiaGioco t) {
        TipologiaGiocoDTO dto = new TipologiaGiocoDTO();
        dto.setId(t.getIdTipologiaGioco());
        dto.setNome(t.getNomeTipologiaGioco());
        dto.setDescrizione(t.getDescrizione());
        dto.setRegole(t.getRegole());
        return dto;
    }
}
