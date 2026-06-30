package com.playnode.tournament_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "iscrizione_torneo")
@IdClass(IscrizioneTorneoId.class)
public class IscrizioneTorneo {

    @Id
    @Column(name = "id_torneo")
    private Long idTorneo;

    @Id
    @Column(name = "id_utente")
    private Long idUtente;

    @Column(name = "data_iscrizione", nullable = false)
    private LocalDateTime dataIscrizione = LocalDateTime.now();

    public IscrizioneTorneo() {
    }

    public Long getIdTorneo() {
        return idTorneo;
    }

    public void setIdTorneo(Long idTorneo) {
        this.idTorneo = idTorneo;
    }

    public Long getIdUtente() {
        return idUtente;
    }

    public void setIdUtente(Long idUtente) {
        this.idUtente = idUtente;
    }

    public LocalDateTime getDataIscrizione() {
        return dataIscrizione;
    }

    public void setDataIscrizione(LocalDateTime dataIscrizione) {
        this.dataIscrizione = dataIscrizione;
    }
}
