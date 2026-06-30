package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.Partita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartitaRepository extends JpaRepository<Partita, Long> {
}
