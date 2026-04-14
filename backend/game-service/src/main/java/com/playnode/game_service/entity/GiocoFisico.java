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

    // Costruttori, Getter e Setter
    public GiocoFisico() {}

    public Long getIdGiocoFisico() { return idGiocoFisico; }
    public void setIdGiocoFisico(Long idGiocoFisico) { this.idGiocoFisico = idGiocoFisico; }

    public Long getLocaleId() { return localeId; }
    public void setLocaleId(Long localeId) { this.localeId = localeId; }
}