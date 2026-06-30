package com.playnode.game_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class TipologiaGiocoDTO {

    private Long id;
    @JsonAlias({ "nomeTipologiaGioco", "nome_tipologia_gioco" })
    private String nome;
    private String descrizione;
    private String regole;

    public TipologiaGiocoDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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
}