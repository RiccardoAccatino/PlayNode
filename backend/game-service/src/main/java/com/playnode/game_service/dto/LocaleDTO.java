package com.playnode.game_service.dto;

public class LocaleDTO {
    private Long id;
    private String nome;
    private String indirizzo;
    private String accesso;
    private Long gestoreId;

    public LocaleDTO() {
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

    public String getIndirizzo() {
        return indirizzo;
    }

    public void setIndirizzo(String indirizzo) {
        this.indirizzo = indirizzo;
    }

    public String getAccesso() {
        return accesso;
    }

    public void setAccesso(String accesso) {
        this.accesso = accesso;
    }

    public Long getGestoreId() {
        return gestoreId;
    }

    public void setGestoreId(Long gestoreId) {
        this.gestoreId = gestoreId;
    }
}
