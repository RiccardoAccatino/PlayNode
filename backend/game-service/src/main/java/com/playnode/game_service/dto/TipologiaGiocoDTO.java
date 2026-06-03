package com.playnode.game_service.dto;

public class TipologiaGiocoDTO {
    private Long id;
    private String nome;

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
}