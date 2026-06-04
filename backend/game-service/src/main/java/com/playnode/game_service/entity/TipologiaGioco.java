package com.playnode.game_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tipologia_gioco")
public class TipologiaGioco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipologia_gioco")
    private Long idTipologiaGioco;

    @Column(name = "nome_tipologia_gioco", nullable = false)
    private String nomeTipologiaGioco;

    @Column(name = "descrizione", nullable = false)
    private String descrizione;

    @Column(name = "regole", nullable = false)
    private String regole;

    @Column(name = "admin_creatore_id")
    private Long adminCreatoreId;

    public TipologiaGioco() {
    }

    // --- GETTER E SETTER ---
    public Long getIdTipologiaGioco() {
        return idTipologiaGioco;
    }

    public void setIdTipologiaGioco(Long idTipologiaGioco) {
        this.idTipologiaGioco = idTipologiaGioco;
    }

    public String getNomeTipologiaGioco() {
        return nomeTipologiaGioco;
    }

    public void setNomeTipologiaGioco(String nomeTipologiaGioco) {
        this.nomeTipologiaGioco = nomeTipologiaGioco;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public String getRegole() {
        return regole;
    }

    public void setRegole(String regole) {
        this.regole = regole;
    }

    public Long getAdminCreatoreId() {
        return adminCreatoreId;
    }

    public void setAdminCreatoreId(Long adminCreatoreId) {
        this.adminCreatoreId = adminCreatoreId;
    }
}