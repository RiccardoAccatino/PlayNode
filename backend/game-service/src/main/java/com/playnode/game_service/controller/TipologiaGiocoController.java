package com.playnode.game_service.controller;

import com.playnode.game_service.dto.TipologiaGiocoDTO;
import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tipologie-gioco")
public class TipologiaGiocoController {

    @Autowired
    private TipologiaGiocoRepository tipologiaGiocoRepository;

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
}