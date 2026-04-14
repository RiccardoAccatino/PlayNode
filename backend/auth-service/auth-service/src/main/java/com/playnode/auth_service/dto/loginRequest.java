package com.playnode.auth_service.dto;

import com.playnode.auth_service.entity.ruoloTipo;
import com.playnode.auth_service.entity.sessoTipo;

public class loginRequest {
    private String email;
    private String password;
    private ruoloTipo ruolo;
    private String username;

    public ruoloTipo getRuolo() { return ruolo; }
    public void setRuolo(ruoloTipo ruolo) { this.ruolo = ruolo; }
    public String getUsername() { return username; }
    public void setUsername(String username){this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email){this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password){this.password = password; }
}