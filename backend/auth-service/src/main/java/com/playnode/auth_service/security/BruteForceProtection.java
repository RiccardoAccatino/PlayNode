package com.playnode.auth_service.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Service per la protezione da attacchi brute force.
 * 
 * Meccanismo semplice e in-memory (senza Redis):
 * - Traccia i tentativi di login falliti per IP
 * - Blocca temporaneamente dopo N tentativi
 * - Sblocca automaticamente dopo il timeout
 * 
 * Configurazione:
 * - Max 5 tentativi per IP
 * - Blocco per 15 minuti (900 secondi)
 */
@Service
public class BruteForceProtection {

    private static class LoginAttempt {
        int count;
        long lastAttempt;
        long blockUntil;

        LoginAttempt() {
            this.count = 0;
            this.lastAttempt = System.currentTimeMillis();
            this.blockUntil = 0;
        }
    }

    private final ConcurrentHashMap<String, LoginAttempt> attempts = new ConcurrentHashMap<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 900;  // 15 minuti
    private static final long ATTEMPT_EXPIRY_SECONDS = 3600; // 1 ora

    /**
     * Registra un tentativo di login fallito
     *
     * @param clientIp Indirizzo IP del client
     */
    public void recordFailedAttempt(String clientIp) {
        lock.writeLock().lock();
        try {
            int att = attempts.computeIfAbsent(clientIp, k -> new LoginAttempt()).count;
            LoginAttempt attempt = attempts.get(clientIp);
            attempt.count++;
            attempt.lastAttempt = System.currentTimeMillis();

            // Se supera il limite, blocca per il timeout specificato
            if (attempt.count >= MAX_ATTEMPTS) {
                attempt.blockUntil = System.currentTimeMillis() + (BLOCK_DURATION_SECONDS * 1000);
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Registra un tentativo di login riuscito (reset dei contatori)
     *
     * @param clientIp Indirizzo IP del client
     */
    public void recordSuccessfulAttempt(String clientIp) {
        lock.writeLock().lock();
        try {
            attempts.remove(clientIp);
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Controlla se un IP è temporaneamente bloccato
     *
     * @param clientIp Indirizzo IP del client
     * @return true se bloccato, false altrimenti
     */
    public boolean isBlocked(String clientIp) {
        lock.readLock().lock();
        try {
            LoginAttempt attempt = attempts.get(clientIp);
            if (attempt == null) {
                return false;
            }

            long now = System.currentTimeMillis();

            // Se il blocco è scaduto, sblocca
            if (now > attempt.blockUntil && attempt.blockUntil > 0) {
                lock.readLock().unlock();
                lock.writeLock().lock();
                try {
                    attempts.remove(clientIp);
                    return false;
                } finally {
                    lock.writeLock().unlock();
                    lock.readLock().lock();
                }
            }

            // Se i tentativi sono scaduti, resetta
            if (now - attempt.lastAttempt > ATTEMPT_EXPIRY_SECONDS * 1000) {
                lock.readLock().unlock();
                lock.writeLock().lock();
                try {
                    attempts.remove(clientIp);
                    return false;
                } finally {
                    lock.writeLock().unlock();
                    lock.readLock().lock();
                }
            }

            return attempt.blockUntil > now;
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Ottiene il tempo rimanente di blocco in secondi
     *
     * @param clientIp Indirizzo IP del client
     * @return Secondi rimasti di blocco, 0 se non bloccato
     */
    public long getRemainingBlockTime(String clientIp) {
        lock.readLock().lock();
        try {
            LoginAttempt attempt = attempts.get(clientIp);
            if (attempt == null || attempt.blockUntil == 0) {
                return 0;
            }

            long remaining = attempt.blockUntil - System.currentTimeMillis();
            return Math.max(0, remaining / 1000);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Pulisce i dati vecchi
     * Rimuove gli IP che non hanno tentato nulla da 1 ora
     */
    public void cleanExpired() {
        lock.writeLock().lock();
        try {
            long now = System.currentTimeMillis();
            attempts.entrySet().removeIf(entry ->
                    now - entry.getValue().lastAttempt > ATTEMPT_EXPIRY_SECONDS * 1000
            );
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Resetta tutti i tentativi
     */
    public void reset() {
        lock.writeLock().lock();
        try {
            attempts.clear();
        } finally {
            lock.writeLock().unlock();
        }
    }
}
