package com.playnode.game_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "gioco_fisico")
public class GiocoFisico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gioco_fisico")
    private Long idGiocoFisico;

    // Per semplicità, salviamo solo l'ID del locale a cui appartiene
    @Column(name = "locale_id")
    private Long localeId;

    // riferimento alla tipologia di gioco (colonna tipologia_gioco_id nel DB)
    @Column(name = "tipologia_gioco_id")
    private Long tipologiaGiocoId;

    // Costruttori, Getter e Setter
    public GiocoFisico() {
    }

    public Long getIdGiocoFisico() {
        return idGiocoFisico;
    }

    public void setIdGiocoFisico(Long idGiocoFisico) {
        this.idGiocoFisico = idGiocoFisico;
    }

    public Long getLocaleId() {
        return localeId;
    }

    public void setLocaleId(Long localeId) {
        this.localeId = localeId;
    }

    public Long getTipologiaGiocoId() {
        return tipologiaGiocoId;
    }

    public void setTipologiaGiocoId(Long tipologiaGiocoId) {
        this.tipologiaGiocoId = tipologiaGiocoId;
    }
}