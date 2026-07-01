package com.playnode.game_service.dto;

import java.util.List;

public class SquadraDTO {
    private Long idSquadra;
    private String nomeSquadra;
    private Long idTipologiaGioco;
    private List<Long> membriIds;

    public SquadraDTO() {}

    public Long getIdSquadra() {
        return idSquadra;
    }

    public void setIdSquadra(Long idSquadra) {
        this.idSquadra = idSquadra;
    }

    public String getNomeSquadra() {
        return nomeSquadra;
    }

    public void setNomeSquadra(String nomeSquadra) {
        this.nomeSquadra = nomeSquadra;
    }

    public Long getIdTipologiaGioco() {
        return idTipologiaGioco;
    }

    public void setIdTipologiaGioco(Long idTipologiaGioco) {
        this.idTipologiaGioco = idTipologiaGioco;
    }

    public List<Long> getMembriIds() {
        return membriIds;
    }

    public void setMembriIds(List<Long> membriIds) {
        this.membriIds = membriIds;
    }
}
