package com.playnode.stats_service.dto;

public class StatisticaUtenteDTO {

    private Long utenteId;
    private int partiteGiocate;
    private int vittorie;
    private int punteggioTotale;

    // I NUOVI CAMPI AGGIUNTI
    private String idLocale;
    private String nomeGioco;

    public StatisticaUtenteDTO() {
    }

    // --- GETTER E SETTER ---

    public Long getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Long utenteId) {
        this.utenteId = utenteId;
    }

    public int getPartiteGiocate() {
        return partiteGiocate;
    }

    public void setPartiteGiocate(int partiteGiocate) {
        this.partiteGiocate = partiteGiocate;
    }

    public int getVittorie() {
        return vittorie;
    }

    public void setVittorie(int vittorie) {
        this.vittorie = vittorie;
    }

    public int getPunteggioTotale() {
        return punteggioTotale;
    }

    public void setPunteggioTotale(int punteggioTotale) {
        this.punteggioTotale = punteggioTotale;
    }

    public String getIdLocale() {
        return idLocale;
    }

    public void setIdLocale(String idLocale) {
        this.idLocale = idLocale;
    }

    public String getNomeGioco() {
        return nomeGioco;
    }

    public void setNomeGioco(String nomeGioco) {
        this.nomeGioco = nomeGioco;
    }
}