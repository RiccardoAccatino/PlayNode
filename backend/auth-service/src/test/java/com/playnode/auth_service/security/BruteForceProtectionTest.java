package com.playnode.auth_service.security;

import com.playnode.auth_service.entity.LoginAttemptEntity;
import com.playnode.auth_service.repository.LoginAttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BruteForceProtectionTest {

    @Mock
    private LoginAttemptRepository repository;

    private BruteForceProtection protection;

    @BeforeEach
    void setUp() {
        protection = new BruteForceProtection(repository);
    }

    @Test
    void recordFailedAttempt_incrementaContatore() {
        LoginAttemptEntity entity = new LoginAttemptEntity();
        entity.setClientIp("1.2.3.4");
        entity.setAttemptCount(0);
        when(repository.findById("1.2.3.4")).thenReturn(Optional.of(entity));

        protection.recordFailedAttempt("1.2.3.4");

        ArgumentCaptor<LoginAttemptEntity> captor = ArgumentCaptor.forClass(LoginAttemptEntity.class);
        verify(repository).save(captor.capture());
        assertEquals(1, captor.getValue().getAttemptCount());
    }

    @Test
    void isBlocked_trueQuandoBlockUntilFuturo() {
        LoginAttemptEntity entity = new LoginAttemptEntity();
        entity.setClientIp("1.2.3.4");
        entity.setLastAttempt(LocalDateTime.now());
        entity.setBlockUntil(LocalDateTime.now().plusMinutes(5));
        when(repository.findById("1.2.3.4")).thenReturn(Optional.of(entity));

        assertTrue(protection.isBlocked("1.2.3.4"));
    }
}
