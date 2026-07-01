package com.playnode.game_service.controller;

import com.playnode.game_service.dto.SquadraDTO;
import com.playnode.game_service.service.SquadraService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/squadre")
public class SquadraController {

    private final SquadraService squadraService;

    public SquadraController(SquadraService squadraService) {
        this.squadraService = squadraService;
    }

    @GetMapping
    public List<SquadraDTO> getAllSquadre() {
        return squadraService.getAllSquadre();
    }

    @GetMapping("/gioco/{idTipologiaGioco}")
    public List<SquadraDTO> getSquadreByGioco(@PathVariable Long idTipologiaGioco) {
        return squadraService.getSquadreByGioco(idTipologiaGioco);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SquadraDTO creaSquadra(@RequestBody SquadraDTO dto) {
        return squadraService.creaSquadra(dto);
    }
}
