package com.playnode.stats_service.dto;

import java.time.LocalDateTime;

/**
 * Questo DTO serve per inviare le informazioni di una singola partita finita.
 */
public class StoricoPartitaDTO {

    private Long id;
    private Long utenteId;
    private Long giocoId;
    private int punteggioOttenuto;
    private LocalDateTime dataPartita;

    public StoricoPartitaDTO() {
    }

    public StoricoPartitaDTO(Long id, Long utenteId, Long giocoId, int punteggioOttenuto, LocalDateTime dataPartita) {
        this.id = id;
        this.utenteId = utenteId;
        this.giocoId = giocoId;
        this.punteggioOttenuto = punteggioOttenuto;
        this.dataPartita = dataPartita;
    }

    // --- GETTER E SETTER ---

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