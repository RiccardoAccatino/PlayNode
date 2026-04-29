package com.playnode.auth_service.repository;

import com.playnode.auth_service.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryUtente extends JpaRepository<Utente, Long> {
    Utente findByEmail(String email);

}