package com.playnode.tournament_service.repository;

import com.playnode.tournament_service.entity.Torneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TorneoRepository extends JpaRepository<Torneo, Long> {
    // Spring Boot capisce da solo come fare le operazioni base (Salva, Trova tutti, Trova per ID)
}