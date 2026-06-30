package com.playnode.auth_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempt")
public class LoginAttemptEntity {

    @Id
    @Column(name = "client_ip", length = 45)
    private String clientIp;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "last_attempt", nullable = false)
    private LocalDateTime lastAttempt;

    @Column(name = "block_until")
    private LocalDateTime blockUntil;

    public String getClientIp() {
        return clientIp;
    }

    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public LocalDateTime getLastAttempt() {
        return lastAttempt;
    }

    public void setLastAttempt(LocalDateTime lastAttempt) {
        this.lastAttempt = lastAttempt;
    }

    public LocalDateTime getBlockUntil() {
        return blockUntil;
    }

    public void setBlockUntil(LocalDateTime blockUntil) {
        this.blockUntil = blockUntil;
    }
}
