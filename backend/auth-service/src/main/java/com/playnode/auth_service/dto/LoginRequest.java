package com.playnode.auth_service.dto;

import com.playnode.auth_service.entity.RuoloTipo;

public class LoginRequest {
    private String email;
    private String password;
    private RuoloTipo ruolo;
    private String username;

    public RuoloTipo getRuolo() {
        return ruolo;
    }

    public void setRuolo(RuoloTipo ruolo) {
        this.ruolo = ruolo;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}