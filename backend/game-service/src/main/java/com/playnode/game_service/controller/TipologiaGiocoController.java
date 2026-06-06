package com.playnode.game_service.controller;

import com.playnode.game_service.dto.TipologiaGiocoDTO;
import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import com.playnode.game_service.service.TipologiaGiocoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tipologie-gioco")
@CrossOrigin(origins = "*") // Importante per il frontend
public class TipologiaGiocoController {

    @Autowired
    private TipologiaGiocoRepository tipologiaGiocoRepository;

    @Autowired
    private TipologiaGiocoService tipologiaGiocoService; // Iniettiamo il service!

    @GetMapping
    public ResponseEntity<List<TipologiaGiocoDTO>> ottieniTutteLeTipologie() {
        List<TipologiaGioco> tipologie = tipologiaGiocoRepository.findAll();
        List<TipologiaGiocoDTO> dtos = new ArrayList<>();

        for (TipologiaGioco t : tipologie) {
            TipologiaGiocoDTO dto = new TipologiaGiocoDTO();
            dto.setId(t.getIdTipologiaGioco());
            dto.setNome(t.getNomeTipologiaGioco());
            dtos.add(dto);
        }

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<TipologiaGioco> creaNuovaTipologia(@RequestBody TipologiaGioco tipologia) {
        // Usiamo l'istanza del service iniettata e chiamiamo il metodo 'save'
        TipologiaGioco salvata = tipologiaGiocoService.save(tipologia);
        return new ResponseEntity<>(salvata, HttpStatus.CREATED);
    }
}