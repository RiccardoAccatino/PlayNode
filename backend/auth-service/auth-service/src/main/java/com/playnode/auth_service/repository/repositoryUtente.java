package com.playnode.auth_service.repository;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface repositoryUtente extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}