package com.playnode.stats_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Questa classe rappresenta la tabella "StoricoPartita" nel database.
 */
@Entity
public class StoricoPartita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long utenteId;
    private Long giocoId;
    private int punteggioOttenuto;
    private LocalDateTime dataPartita;

    // Costruttore vuoto obbligatorio per Spring Boot
    public StoricoPartita() {
    }

    // ==========================================
    // --- METODI GETTER E SETTER ---
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Long utenteId) {
        this.utenteId = utenteId;
    }

    public Long getGiocoId() {
        return giocoId;
    }

    public void setGiocoId(Long giocoId) {
        this.giocoId = giocoId;
    }

    public int getPunteggioOttenuto() {
        return punteggioOttenuto;
    }

    public void setPunteggioOttenuto(int punteggioOttenuto) {
        this.punteggioOttenuto = punteggioOttenuto;
    }

    public LocalDateTime getDataPartita() {
        return dataPartita;
    }

    public void setDataPartita(LocalDateTime dataPartita) {
        this.dataPartita = dataPartita;
    }
}