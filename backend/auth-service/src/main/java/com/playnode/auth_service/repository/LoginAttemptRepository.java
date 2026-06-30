package com.playnode.auth_service.repository;

import com.playnode.auth_service.entity.LoginAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttemptEntity, String> {
}
