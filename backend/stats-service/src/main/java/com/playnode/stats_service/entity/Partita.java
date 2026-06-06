package com.playnode.stats_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Questa classe rappresenta la tabella "Partita" nel database.
 */
@Entity
@Table(name = "partita")
public class Partita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partita")
    private Long idPartita;

    @Column(name = "gioco_fisico_id")
    private Long giocoFisicoId;

    @Column(name = "timestamp_inizio")
    private LocalDateTime timestampInizio;

    @Column(name = "timestamp_fine")
    private LocalDateTime timestampFine;

    public Partita() {
    }

    public Long getIdPartita() {
        return idPartita;
    }

    public void setIdPartita(Long idPartita) {
        this.idPartita = idPartita;
    }

    public Long getGiocoFisicoId() {
        return giocoFisicoId;
    }

    public void setGiocoFisicoId(Long giocoFisicoId) {
        this.giocoFisicoId = giocoFisicoId;
    }

    public LocalDateTime getTimestampInizio() {
        return timestampInizio;
    }

    public void setTimestampInizio(LocalDateTime timestampInizio) {
        this.timestampInizio = timestampInizio;
    }

    public LocalDateTime getTimestampFine() {
        return timestampFine;
    }

    public void setTimestampFine(LocalDateTime timestampFine) {
        this.timestampFine = timestampFine;
    }
}