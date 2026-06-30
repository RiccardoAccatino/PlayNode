package com.playnode.tournament_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "partecipa")
public class PartecipaRef {

    @Id
    @Column(name = "id_partecipa")
    private Long idPartecipa;

    @Column(name = "partita_id")
    private Long partitaId;

    @Column(name = "giocatore_id")
    private Long giocatoreId;

    @Column(name = "punteggio_finale")
    private Integer punteggioFinale;

    @Column(name = "vittoria")
    private Boolean vittoria;

    public Long getGiocatoreId() {
        return giocatoreId;
    }

    public Integer getPunteggioFinale() {
        return punteggioFinale != null ? punteggioFinale : 0;
    }

    public Boolean getVittoria() {
        return vittoria;
    }
}
