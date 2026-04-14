package com.playnode.auth_service.dto;

import main.java.com.playnode.auth_service.model.modelUtente;

public class registerRequest {
    private Long id;
    private String username;
    private String email;
    private modelUtente.tipoSesso sesso;
    private String password;
    private modelUtente.tipoRuolo ruolo;
}