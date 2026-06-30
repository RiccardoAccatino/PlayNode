package com.playnode.game_service.dto;

public class PartecipaDTO {
    private Long id;
    private Long partitaId;
    private Long giocatoreId;
    private Long squadraId;
    private Integer punteggioFinale;
    private Boolean vittoria;

    public PartecipaDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPartitaId() {
        return partitaId;
    }

    public void setPartitaId(Long partitaId) {
        this.partitaId = partitaId;
    }

    public Long getGiocatoreId() {
        return giocatoreId;
    }

    public void setGiocatoreId(Long giocatoreId) {
        this.giocatoreId = giocatoreId;
    }

    public Long getSquadraId() {
        return squadraId;
    }

    public void setSquadraId(Long squadraId) {
        this.squadraId = squadraId;
    }

    public Integer getPunteggioFinale() {
        return punteggioFinale;
    }

    public void setPunteggioFinale(Integer punteggioFinale) {
        this.punteggioFinale = punteggioFinale;
    }

    public Boolean getVittoria() {
        return vittoria;
    }

    public void setVittoria(Boolean vittoria) {
        this.vittoria = vittoria;
    }
}
