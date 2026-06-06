package com.playnode.game_service.dto;

public class SensoreDTO {
    private Long id;
    private Long idGiocoFisico;
    private String tipo;
    private String posizione;
    // frontend fields
    private String nomeSensore;
    private String descrizione;
    private String unitaMisura;
    private Double valoreMin;
    private Double valoreMax;
    private Boolean attivo;
    private Long tipologiaId;

    public SensoreDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdGiocoFisico() {
        return idGiocoFisico;
    }

    public void setIdGiocoFisico(Long idGiocoFisico) {
        this.idGiocoFisico = idGiocoFisico;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getPosizione() {
        return posizione;
    }

    public void setPosizione(String posizione) {
        this.posizione = posizione;
    }

    public String getNomeSensore() {
        return nomeSensore;
    }

    public void setNomeSensore(String nomeSensore) {
        this.nomeSensore = nomeSensore;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public String getUnitaMisura() {
        return unitaMisura;
    }

    public void setUnitaMisura(String unitaMisura) {
        this.unitaMisura = unitaMisura;
    }

    public Double getValoreMin() {
        return valoreMin;
    }

    public void setValoreMin(Double valoreMin) {
        this.valoreMin = valoreMin;
    }

    public Double getValoreMax() {
        return valoreMax;
    }

    public void setValoreMax(Double valoreMax) {
        this.valoreMax = valoreMax;
    }

    public Boolean getAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
    }

    public Long getTipologiaId() {
        return tipologiaId;
    }

    public void setTipologiaId(Long tipologiaId) {
        this.tipologiaId = tipologiaId;
    }
}