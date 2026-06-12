package com.playnode.game_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "partecipa")
public class Partecipa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partecipa")
    private Long idPartecipa; // L'ID univoco che abbiamo aggiunto

    @Column(name = "partita_id")
    private Long partitaId;

    @Column(name = "giocatore_id")
    private Long giocatoreId;

    @Column(name = "squadra_id")
    private Long squadraId;

    @Column(name = "punteggio_finale")
    private Integer punteggioFinale = 0; // Parte da zero!

    @Column(name = "vittoria")
    private Boolean vittoria = false;

    public Partecipa() {}

    // Getter e Setter
    public Long getIdPartecipa() { return idPartecipa; }
    public void setIdPartecipa(Long idPartecipa) { this.idPartecipa = idPartecipa; }

    public Long getPartitaId() { return partitaId; }
    public void setPartitaId(Long partitaId) { this.partitaId = partitaId; }

    public Long getGiocatoreId() { return giocatoreId; }
    public void setGiocatoreId(Long giocatoreId) { this.giocatoreId = giocatoreId; }

    public Long getSquadraId() { return squadraId; }
    public void setSquadraId(Long squadraId) { this.squadraId = squadraId; }

    public Integer getPunteggioFinale() { return punteggioFinale; }
    public void setPunteggioFinale(Integer punteggioFinale) { this.punteggioFinale = punteggioFinale; }

    public Boolean getVittoria() { return vittoria; }
    public void setVittoria(Boolean vittoria) { this.vittoria = vittoria; }
}