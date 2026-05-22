package com.playnode.auth_service.dto;

import com.playnode.auth_service.entity.RuoloTipo;

public class AuthResponse {
    private String message;
    private boolean success;

    private Long userId;
    private String username;
    private String email;
    private RuoloTipo ruolo;

    public AuthResponse() {}

    public AuthResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    // Costruttore con i dati dell'utente
    public AuthResponse(String message, boolean success, Long userId, String username, String email, RuoloTipo ruolo) {
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.ruolo = ruolo;
    }

    // Getters e Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public RuoloTipo getRuolo() { return ruolo; }
    public void setRuolo(RuoloTipo ruolo) { this.ruolo = ruolo; }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "message='" + message + '\'' +
                ", success=" + success +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", ruolo=" + ruolo +
                '}';
    }
}