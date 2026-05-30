package com.playnode.auth_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller temporaneo per testare il funzionamento del JWT.
 * Dato che l'URL /api/test/me non è stato inserito nei "permitAll()"
 * del SecurityConfig, Spring Security bloccherà in automatico chiunque
 * provi ad entrarci senza un token valido.
 */
@RestController
public class TestSecurityController {

    @GetMapping("/api/test/log")
    public ResponseEntity<String> testAreaPrivata() {
        // Estraiamo i dati dell'utente dal SecurityContext, che il nostro
        // JwtAuthenticationFilter ha riempito leggendo il token!
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String messaggio = "Bravissimo! Il token funziona alla grande.\n" +
                "Sei loggato come: " + auth.getName() + "\n" +
                "Permessi riconosciuti: " + auth.getAuthorities();

        return ResponseEntity.ok(messaggio);
    }
}