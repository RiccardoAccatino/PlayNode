package com.playnode.auth_service.security;

import com.playnode.auth_service.entity.LoginAttemptEntity;
import com.playnode.auth_service.repository.LoginAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class BruteForceProtection {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 900;
    private static final long ATTEMPT_EXPIRY_SECONDS = 3600;

    private final LoginAttemptRepository repository;

    public BruteForceProtection(LoginAttemptRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void recordFailedAttempt(String clientIp) {
        LoginAttemptEntity attempt = repository.findById(clientIp).orElseGet(() -> {
            LoginAttemptEntity e = new LoginAttemptEntity();
            e.setClientIp(clientIp);
            e.setAttemptCount(0);
            return e;
        });
        attempt.setAttemptCount(attempt.getAttemptCount() + 1);
        attempt.setLastAttempt(LocalDateTime.now());
        if (attempt.getAttemptCount() >= MAX_ATTEMPTS) {
            attempt.setBlockUntil(LocalDateTime.now().plusSeconds(BLOCK_DURATION_SECONDS));
        }
        repository.save(attempt);
    }

    @Transactional
    public void recordSuccessfulAttempt(String clientIp) {
        repository.deleteById(clientIp);
    }

    @Transactional(readOnly = true)
    public boolean isBlocked(String clientIp) {
        Optional<LoginAttemptEntity> op = repository.findById(clientIp);
        if (op.isEmpty()) {
            return false;
        }
        LoginAttemptEntity attempt = op.get();
        LocalDateTime now = LocalDateTime.now();
        if (attempt.getLastAttempt().plusSeconds(ATTEMPT_EXPIRY_SECONDS).isBefore(now)) {
            return false;
        }
        return attempt.getBlockUntil() != null && attempt.getBlockUntil().isAfter(now);
    }

    @Transactional(readOnly = true)
    public long getRemainingBlockTime(String clientIp) {
        return repository.findById(clientIp)
                .filter(a -> a.getBlockUntil() != null && a.getBlockUntil().isAfter(LocalDateTime.now()))
                .map(a -> java.time.Duration.between(LocalDateTime.now(), a.getBlockUntil()).getSeconds())
                .orElse(0L);
    }

    @Transactional
    public void cleanExpired() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(ATTEMPT_EXPIRY_SECONDS);
        repository.findAll().stream()
                .filter(a -> a.getLastAttempt().isBefore(cutoff))
                .forEach(a -> repository.deleteById(a.getClientIp()));
    }

    @Transactional
    public void reset() {
        repository.deleteAll();
    }
}
