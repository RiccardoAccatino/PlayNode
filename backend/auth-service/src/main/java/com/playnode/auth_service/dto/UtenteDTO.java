package com.playnode.auth_service.dto;

import com.playnode.auth_service.entity.RuoloTipo;
import com.playnode.auth_service.entity.SessoTipo;

public class UtenteDTO {
    private Integer id;
    private String username;
    private String email;
    private RuoloTipo ruolo;
    private SessoTipo sesso;

    public UtenteDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public RuoloTipo getRuolo() {
        return ruolo;
    }

    public void setRuolo(RuoloTipo ruolo) {
        this.ruolo = ruolo;
    }

    public SessoTipo getSesso() {
        return sesso;
    }

    public void setSesso(SessoTipo sesso) {
        this.sesso = sesso;
    }
}
