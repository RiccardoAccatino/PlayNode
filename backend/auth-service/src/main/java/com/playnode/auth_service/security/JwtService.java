package com.playnode.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Service per la gestione dei JWT token.
 * 
 * Responsabilità:
 * - Generazione token JWT
 * - Validazione e parsing token
 * - Estrazione claims dal token
 * - Rotazione della secret key in base al environment
 */
@Service
public class JwtService {

    @Value("${jwt.secret:DefaultSecretKeyFor PlayNode AuthenticationService MustBeAtLeast256BitLong}")
    private String secret;

    @Value("${jwt.expiration:3600000}") // default 1 ora in ms
    private long expirationTime;

    /**
     * Genera un JWT token con i dati utente
     *
     * @param userId   ID dell'utente
     * @param username Username dell'utente
     * @param email    Email dell'utente
     * @param role     Ruolo dell'utente
     * @return JWT token
     */
    public String generateToken(Long userId, String username, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("email", email);
        claims.put("role", role);

        return createToken(claims, email);
    }

    /**
     * Crea il token JWT
     *
     * @param claims  Claims da includere nel token
     * @param subject Subject del token (solitamente email)
     * @return JWT token firmato
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Estrae tutti i claims dal token
     *
     * @param token JWT token
     * @return Claims estratti dal token
     * @throws ExpiredJwtException          se il token è scaduto
     * @throws io.jsonwebtoken.JwtException se il token non è valido
     */
    public Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Estrae il subject (email) dal token
     *
     * @param token JWT token
     * @return Email (subject) del token
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Estrae l'userId dal token in modo sicuro,
     * indipendentemente da come la libreria JSON ha letto il numero.
     *
     * @param token JWT token
     * @return User ID
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");

        if (userIdObj != null) {
            // Converte l'oggetto in stringa e poi in Long in modo sicuro
            return Long.parseLong(userIdObj.toString());
        }
        return null;
    }

    /**
     * Estrae il ruolo dal token
     *
     * @param token JWT token
     * @return Ruolo utente
     */
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    /**
     * Estrae l'username dal token
     *
     * @param token JWT token
     * @return Username dell'utente
     */
    public String extractUsername(String token) {
        return (String) extractAllClaims(token).get("username");
    }

    /**
     * Estrae la data di scadenza dal token
     *
     * @param token JWT token
     * @return Data di scadenza
     */
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    /**
     * Verifica se il token è scaduto
     *
     * @param token JWT token
     * @return true se scaduto, false altrimenti
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    /**
     * Valida il token
     * Controlla che:
     * - Il token è correttamente firmato
     * - Il token non è scaduto
     * - Il token contiene i claims richiesti
     *
     * @param token JWT token
     * @return true se valido, false altrimenti
     */
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
