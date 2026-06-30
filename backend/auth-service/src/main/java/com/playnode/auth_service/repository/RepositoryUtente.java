package com.playnode.auth_service.repository;

import com.playnode.auth_service.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositoryUtente extends JpaRepository<Utente, Integer> {
    List<Utente> findByEmailIgnoreCase(String email);
    List<Utente> findByUsernameIgnoreCase(String username);
}