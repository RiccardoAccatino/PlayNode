package com.playnode.auth_service.service;

import com.playnode.auth_service.dto.AuthResponse;
import com.playnode.auth_service.dto.LoginRequest;
import com.playnode.auth_service.entity.Utente;
import com.playnode.auth_service.repository.RepositoryUtente;
import com.playnode.auth_service.security.BruteForceProtection;
import com.playnode.auth_service.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service per la gestione del login dell'utente.
 * 
 * Responsabilità:
 * - Autenticazione utente (email + password)
 * - Validazione credenziali via BCrypt
 * - Generazione JWT token
 * - Protezione da brute force
 **/
@Service
public class LoginService {

    @Autowired
    private RepositoryUtente rutente;

    @Autowired
    private PasswordVerifyService passwordVerifyService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BruteForceProtection bruteForceProtection;

    /**
     * Autentica l'utente e genera JWT token
     *
     * @param request  Richiesta di login (email, password)
     * @param clientIp Indirizzo IP del client (per brute force protection)
     * @return AuthResponse con token JWT se successo, errore altrimenti
     */
    public AuthResponse login(LoginRequest request, String clientIp) {
        // Verifica se l'IP è bloccato per brute force
        if (bruteForceProtection.isBlocked(clientIp)) {
            long remainingSeconds = bruteForceProtection.getRemainingBlockTime(clientIp);
            return new AuthResponse(
                    "Troppi tentativi di login falliti. Riprova tra " + remainingSeconds + " secondi",
                    false);
        }

        // Pulisce email
        String emailPulita = request.getEmail().trim().toLowerCase();

        // Cerca l'utente per email
        Utente u = rutente.findByEmail(emailPulita);

        if (u == null) {
            bruteForceProtection.recordFailedAttempt(clientIp);
            return new AuthResponse("Credenziali non valide", false);
        }

        // Verifica la password
        if (!passwordVerifyService.verifyPassword(request.getPassword(), u.getPassword())) {
            bruteForceProtection.recordFailedAttempt(clientIp);
            return new AuthResponse("Credenziali non valide", false);
        }

        // Login riuscito: resetta i contatori di brute force
        bruteForceProtection.recordSuccessfulAttempt(clientIp);

        // Genera JWT token
        String token = jwtService.generateToken(
                u.getId().longValue(),
                u.getUsername(),
                u.getEmail(),
                u.getRuolo().name());

        return new AuthResponse(
                "Login completato con successo",
                true,
                u.getId().longValue(),
                u.getUsername(),
                u.getEmail(),
                u.getRuolo(),
                token);
    }

    /**
     * Autentica l'utente senza brute force protection (per backward compatibility)
     * Usa "unknown" come IP
     */
    public AuthResponse login(LoginRequest request) {
        return login(request, "unknown");
    }
}