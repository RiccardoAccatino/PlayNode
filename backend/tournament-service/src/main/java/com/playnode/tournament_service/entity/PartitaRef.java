package com.playnode.tournament_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "partita")
public class PartitaRef {

    @Id
    @Column(name = "id_partita")
    private Long idPartita;

    @Column(name = "torneo_id")
    private Long torneoId;

    @Column(name = "timestamp_fine")
    private LocalDateTime timestampFine;

    public Long getTorneoId() {
        return torneoId;
    }

    public LocalDateTime getTimestampFine() {
        return timestampFine;
    }
}
