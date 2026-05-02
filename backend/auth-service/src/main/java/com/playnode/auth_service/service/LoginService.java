package com.playnode.auth_service.service;

import com.playnode.auth_service.dto.AuthResponse;
import com.playnode.auth_service.dto.LoginRequest;
import com.playnode.auth_service.entity.Utente;
import com.playnode.auth_service.repository.RepositoryUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    @Autowired
    private RepositoryUtente rutente;


    @Autowired
    private PasswordVerifyService passwordVerifyService;

    /**
     * Autentica un utente
     * @param request contiene email e password
     * @return AuthResponse con esito del login
     */
    public AuthResponse login(LoginRequest request) {
        // Elimina spazio
        String emailPulita = request.getEmail().trim().toLowerCase();

        // Cerca l'utente per email
        Utente u = rutente.findByEmail(emailPulita);

        if (u == null) {
            return new AuthResponse("Utente non trovato", false);
        }

        // Verifica la password
        if (!passwordVerifyService.verifyPassword(request.getPassword(), u.getPassword())) {
            return new AuthResponse("Password errata", false);
        }

        return new AuthResponse("Login completato con successo", true);
    }
}