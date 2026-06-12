package com.playnode.auth_service.controller;

import com.playnode.auth_service.dto.AuthResponse;
import com.playnode.auth_service.dto.LoginRequest;
import com.playnode.auth_service.dto.RegisterRequest;
import com.playnode.auth_service.security.TokenBlacklistService;
import com.playnode.auth_service.service.LoginService;
import com.playnode.auth_service.service.RegisterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller per la gestione dell'autenticazione (login, register, logout).
 * 
 * Tutti gli endpoint sono pubblici (non richiedono JWT).
 * Logout è un endpoint placeholder che restituisce successo (token invalidation è client-side).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:63342", "http://192.168.1.25:63342"})
public class AuthController {

    @Autowired
    private RegisterService registerService;

    @Autowired
    private LoginService loginService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    /**
     * Endpoint per registrazione
     * POST /api/auth/register
     * 
     * @param request Dati di registrazione (email, password, username, etc.)
     * @return AuthResponse con token JWT se successo, errore altrimenti
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = registerService.register(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Endpoint per login
     * POST /api/auth/login
     * 
     * Genera e ritorna un JWT token.
     * Protezione: Brute force (max 5 tentativi, blocco 15 minuti)
     * 
     * @param request Credenziali (email, password)
     * @param httpRequest ServletRequest per estrarre l'IP
     * @return AuthResponse con token JWT se successo, errore altrimenti
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        // Estrae l'IP del client per il brute force protection
        String clientIp = getClientIp(httpRequest);
        System.out.println("Login tentato con email: " + request.getEmail() + " da IP: " + clientIp);

        AuthResponse response = loginService.login(request, clientIp);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Endpoint per logout
     * POST /api/auth/logout
     * * Invalida il token inserendolo nella Blacklist lato server.
     * Contemporaneamente, il frontend si occuperà di rimuoverlo dal localStorage.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        // Estrae il token dall'header
        String authHeader = request.getHeader("Authorization");
        String token = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Se abbiamo trovato un token, lo mettiamo nella lista nera!
        if (token != null) {
            tokenBlacklistService.addToBlacklist(token);
            System.out.println("Token inserito nella blacklist con successo.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout completato con successo. Token invalidato nel backend.");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }

    /**
     * Estrae l'indirizzo IP del client dalla richiesta HTTP
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}