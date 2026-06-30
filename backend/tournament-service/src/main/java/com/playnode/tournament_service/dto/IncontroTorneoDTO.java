package com.playnode.tournament_service.dto;

import java.util.ArrayList;
import java.util.List;

public class IncontroTorneoDTO {
    private Long id;
    private Integer round;
    private Integer slot;
    private Long giocatore1Id;
    private Long giocatore2Id;
    private Long vincitoreId;
    private Long partitaId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRound() {
        return round;
    }

    public void setRound(Integer round) {
        this.round = round;
    }

    public Integer getSlot() {
        return slot;
    }

    public void setSlot(Integer slot) {
        this.slot = slot;
    }

    public Long getGiocatore1Id() {
        return giocatore1Id;
    }

    public void setGiocatore1Id(Long giocatore1Id) {
        this.giocatore1Id = giocatore1Id;
    }

    public Long getGiocatore2Id() {
        return giocatore2Id;
    }

    public void setGiocatore2Id(Long giocatore2Id) {
        this.giocatore2Id = giocatore2Id;
    }

    public Long getVincitoreId() {
        return vincitoreId;
    }

    public void setVincitoreId(Long vincitoreId) {
        this.vincitoreId = vincitoreId;
    }

    public Long getPartitaId() {
        return partitaId;
    }

    public void setPartitaId(Long partitaId) {
        this.partitaId = partitaId;
    }
}
