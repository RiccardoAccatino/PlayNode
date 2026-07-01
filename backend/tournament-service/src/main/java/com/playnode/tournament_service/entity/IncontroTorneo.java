package com.playnode.tournament_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "incontro_torneo")
public class IncontroTorneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incontro")
    private Long idIncontro;

    @Column(name = "id_torneo", nullable = false)
    private Long idTorneo;

    @Column(name = "round_num", nullable = false)
    private Integer roundNum;

    @Column(name = "slot_num", nullable = false)
    private Integer slotNum;

    @Column(name = "giocatore1_id")
    private Long giocatore1Id;

    @Column(name = "giocatore2_id")
    private Long giocatore2Id;

    @Column(name = "vincitore_id")
    private Long vincitoreId;

    @Column(name = "id_partita")
    private Long idPartita;

    public IncontroTorneo() {
    }

    public Long getIdIncontro() {
        return idIncontro;
    }

    public void setIdIncontro(Long idIncontro) {
        this.idIncontro = idIncontro;
    }

    public Long getIdTorneo() {
        return idTorneo;
    }

    public void setIdTorneo(Long idTorneo) {
        this.idTorneo = idTorneo;
    }

    public Integer getRoundNum() {
        return roundNum;
    }

    public void setRoundNum(Integer roundNum) {
        this.roundNum = roundNum;
    }

    public Integer getSlotNum() {
        return slotNum;
    }

    public void setSlotNum(Integer slotNum) {
        this.slotNum = slotNum;
    }

    public Long getGiocatore1Id() {
        return giocatore1Id;
    }

    public void setGiocatore1Id(Long giocatore1Id) {
        this.giocatore1Id = giocatore1Id;
    }

    public Long getGiocatore2Id() {
        return giocatore2Id;
    }

    public void setGiocatore2Id(Long giocatore2Id) {
        this.giocatore2Id = giocatore2Id;
    }

    public Long getVincitoreId() {
        return vincitoreId;
    }

    public void setVincitoreId(Long vincitoreId) {
        this.vincitoreId = vincitoreId;
    }

    public Long getIdPartita() {
        return idPartita;
    }

    public void setIdPartita(Long idPartita) {
        this.idPartita = idPartita;
    }
}
