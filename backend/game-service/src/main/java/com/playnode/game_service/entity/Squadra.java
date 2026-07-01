package com.playnode.game_service.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "squadra")
public class Squadra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_squadra")
    private Long idSquadra;

    @Column(name = "nome_squadra", unique = true, nullable = false)
    private String nomeSquadra;

    @Column(name = "id_tipologia_gioco")
    private Long idTipologiaGioco;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "membro_squadra", joinColumns = @JoinColumn(name = "id_squadra"))
    @Column(name = "id_utente")
    private List<Long> membriIds = new ArrayList<>();

    public Squadra() {}

    public Long getIdSquadra() {
        return idSquadra;
    }

    public void setIdSquadra(Long idSquadra) {
        this.idSquadra = idSquadra;
    }

    public String getNomeSquadra() {
        return nomeSquadra;
    }

    public void setNomeSquadra(String nomeSquadra) {
        this.nomeSquadra = nomeSquadra;
    }

    public Long getIdTipologiaGioco() {
        return idTipologiaGioco;
    }

    public void setIdTipologiaGioco(Long idTipologiaGioco) {
        this.idTipologiaGioco = idTipologiaGioco;
    }

    public List<Long> getMembriIds() {
        return membriIds;
    }

    public void setMembriIds(List<Long> membriIds) {
        this.membriIds = membriIds;
    }
}
