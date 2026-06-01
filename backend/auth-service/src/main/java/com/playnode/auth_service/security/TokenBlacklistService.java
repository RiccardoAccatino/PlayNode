package com.playnode.auth_service.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service per gestire la "Lista Nera" (Blacklist) dei token invalidati tramite Logout.
 */
@Service
public class TokenBlacklistService {

    // Usiamo un Set thread-safe per memorizzare i token invalidati
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    /**
     * Aggiunge un token alla lista nera
     */
    public void addToBlacklist(String token) {
        if (token != null && !token.isEmpty()) {
            blacklistedTokens.add(token);
        }
    }

    /**
     * Controlla se un token è nella lista nera
     * @return true se il token è stato invalidato
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}