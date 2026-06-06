package com.playnode.game_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Sensore")
public class Sensore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sensore")
    private Long idSensore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gioco_fisico_id")
    private GiocoFisico giocoFisico;

    private String tipo;
    private String posizione;

    public Sensore() {
    }

    public Long getIdSensore() {
        return idSensore;
    }

    public void setIdSensore(Long idSensore) {
        this.idSensore = idSensore;
    }

    public GiocoFisico getGiocoFisico() {
        return giocoFisico;
    }

    public void setGiocoFisico(GiocoFisico giocoFisico) {
        this.giocoFisico = giocoFisico;
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
}
