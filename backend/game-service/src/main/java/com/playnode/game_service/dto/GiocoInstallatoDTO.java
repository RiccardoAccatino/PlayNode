package com.playnode.game_service.dto;

public class GiocoInstallatoDTO {
    private Long id;
    private Long idLocale;
    private String tipoGioco; // Es. "Calciobalilla", "Freccette"
    private String stato; // Es. "LIBERO", "IN_USO", "GUASTO"

    public GiocoInstallatoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdLocale() { return idLocale; }
    public void setIdLocale(Long idLocale) { this.idLocale = idLocale; }
    public String getTipoGioco() { return tipoGioco; }
    public void setTipoGioco(String tipoGioco) { this.tipoGioco = tipoGioco; }
    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }
}