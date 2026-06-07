package com.playnode.game_service.dto;

public class GiocoInstallatoDTO {
    private Long id;
    private Long idLocale;
    private Long tipologiaId;
    private String tipoGioco; // Es. "Calciobalilla Smart", "Bocce Elettroniche"
    private String stato; // Es. "LIBERO", "IN_USO", "GUASTO"
    private int numSensori;

    public GiocoInstallatoDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdLocale() {
        return idLocale;
    }

    public void setIdLocale(Long idLocale) {
        this.idLocale = idLocale;
    }

    public Long getTipologiaId() {
        return tipologiaId;
    }

    public void setTipologiaId(Long tipologiaId) {
        this.tipologiaId = tipologiaId;
    }

    public String getTipoGioco() {
        return tipoGioco;
    }

    public void setTipoGioco(String tipoGioco) {
        this.tipoGioco = tipoGioco;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public int getNumSensori() {
        return numSensori;
    }

    public void setNumSensori(int numSensori) {
        this.numSensori = numSensori;
    }
}