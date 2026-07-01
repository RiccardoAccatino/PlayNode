package com.playnode.game_service.service;

import com.playnode.game_service.dto.SquadraDTO;
import com.playnode.game_service.entity.Squadra;
import com.playnode.game_service.repository.SquadraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SquadraService {

    private final SquadraRepository squadraRepository;

    public SquadraService(SquadraRepository squadraRepository) {
        this.squadraRepository = squadraRepository;
    }

    public List<SquadraDTO> getAllSquadre() {
        return squadraRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<SquadraDTO> getSquadreByGioco(Long idTipologiaGioco) {
        return squadraRepository.findByIdTipologiaGioco(idTipologiaGioco).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public SquadraDTO creaSquadra(SquadraDTO dto) {
        Squadra squadra = new Squadra();
        squadra.setNomeSquadra(dto.getNomeSquadra());
        squadra.setIdTipologiaGioco(dto.getIdTipologiaGioco());
        if (dto.getMembriIds() != null) {
            squadra.setMembriIds(dto.getMembriIds());
        }
        Squadra salvata = squadraRepository.save(squadra);
        return mapToDTO(salvata);
    }

    private SquadraDTO mapToDTO(Squadra entity) {
        SquadraDTO dto = new SquadraDTO();
        dto.setIdSquadra(entity.getIdSquadra());
        dto.setNomeSquadra(entity.getNomeSquadra());
        dto.setIdTipologiaGioco(entity.getIdTipologiaGioco());
        if (entity.getMembriIds() != null) {
            dto.setMembriIds(List.copyOf(entity.getMembriIds()));
        }
        return dto;
    }
}
