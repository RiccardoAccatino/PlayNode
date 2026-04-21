package com.playnode.auth_service.repository;

import com.playnode.auth_service.entity.utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repositoryUtente extends JpaRepository<utente, String> {
    utente findByEmail(String email);

}