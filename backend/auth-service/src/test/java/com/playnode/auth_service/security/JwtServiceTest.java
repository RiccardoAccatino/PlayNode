package com.playnode.auth_service.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test unitari per il JwtService.
 * Verifica la generazione, l'estrazione dei claims e la validazione del token.
 */
public class JwtServiceTest {

    private JwtService jwtService;

    // Chiave sufficientemente lunga per HMAC-SHA
    private final String testSecret = "SuperSecretTestKeyThatIsLongEnoughForHmacSha256!";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set properties
        ReflectionTestUtils.setField(jwtService, "secret", testSecret);
        ReflectionTestUtils.setField(jwtService, "expirationTime", 3600000L); // 1 hour
    }

    @Test
    void testGeneraToken_and_EstraiClaims_Success() {
        // Generazione del token
        String token = jwtService.generateToken(10L, "testuser", "test@test.com", "Giocatore");

        // Asserzioni esplicite
        assertNotNull(token);
        assertTrue(token.startsWith("eyJ")); // JWT headers start with this usually

        // Validazione
        boolean isValid = jwtService.validateToken(token);
        assertTrue(isValid);

        // Estrazione claims con assertEquals
        assertEquals("test@test.com", jwtService.extractEmail(token));
        assertEquals(10L, jwtService.extractUserId(token));
        assertEquals("Giocatore", jwtService.extractRole(token));
        assertEquals("testuser", jwtService.extractUsername(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void testTokenInvalido_throwsSignatureException() {
        String token = jwtService.generateToken(10L, "test", "test@test.com", "Giocatore");

        // Alterazione del token per renderlo invalido
        String invalidToken = token + "xyz";

        // Asserzione esplicita di assertThrows
        assertThrows(SignatureException.class, () -> {
            jwtService.extractAllClaims(invalidToken);
        });

        // Validazione deve fallire in modo sicuro
        assertFalse(jwtService.validateToken(invalidToken));
    }

    @Test
    void testTokenScaduto_throwsExpiredJwtException() throws InterruptedException {
        // Configuriamo un'espirazione brevissima (1 ms)
        ReflectionTestUtils.setField(jwtService, "expirationTime", 1L);

        String token = jwtService.generateToken(10L, "test", "test@test.com", "Giocatore");

        // Aspettiamo che scada
        Thread.sleep(10);

        // Verifica che l'eccezione lanciata sia ExpiredJwtException usando assertThrows
        assertThrows(ExpiredJwtException.class, () -> {
            jwtService.extractAllClaims(token);
        });

        assertTrue(jwtService.isTokenExpired(token));
        assertFalse(jwtService.validateToken(token));
    }
}
