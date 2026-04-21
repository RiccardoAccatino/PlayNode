package com.playnode.auth_service.service;

import com.playnode.auth_service.dto.authResponse;
import com.playnode.auth_service.dto.loginRequest;
import com.playnode.auth_service.entity.utente;
import com.playnode.auth_service.repository.repositoryUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class loginService {

    @Autowired
    private repositoryUtente rutente;


    @Autowired
    private passwordVerifyService passwordVerifyService;

    /**
     * Autentica un utente
     * @param request contiene email e password
     * @return AuthResponse con esito del login
     */
    public authResponse login(loginRequest request) {

        // Cerca l'utente per email
        utente u = rutente.findByEmail(request.getEmail());

        if (u == null) {
            return new authResponse("Utente non trovato", false);
        }

        // Verifica la password
        if (!passwordVerifyService.verifyPassword(request.getPassword(), u.getPassword())) {
            return new authResponse("Password errata", false);
        }

        return new authResponse("Login completato con successo", true);
    }
}