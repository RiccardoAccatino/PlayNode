package com.playnode.auth_service.model;

public class modelUtente {
    private Long id;
    private String username;
    private String email;
    private tipoSesso sesso;
    private String password;
    private tipoRuolo ruolo;

    // Enum per i ruoli, come da documento
    public enum tipoRuolo {
        Giocatore,
        Gestore,
        AdminGioco,
        AdminPiattaforma
    }

    public enum tipoSesso{
        Maschio,
        Femmina,
        Altro
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }

    public tipoRuolo getRuolo() {
        return ruolo;
    }
}