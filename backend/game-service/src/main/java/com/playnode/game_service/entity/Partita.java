package com.playnode.game_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import java.time.LocalDateTime;

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

    @Column(name = "stato_sync", columnDefinition = "stato_sync_tipo")
    @ColumnTransformer(read = "stato_sync::text", write = "?::stato_sync_tipo")
    private String statoSync = "Realtime"; // Valore di default

    // Costruttori, Getter e Setter
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

    public String getStatoSync() {
        return statoSync;
    }

    public void setStatoSync(String statoSync) {
        this.statoSync = statoSync;
    }
}