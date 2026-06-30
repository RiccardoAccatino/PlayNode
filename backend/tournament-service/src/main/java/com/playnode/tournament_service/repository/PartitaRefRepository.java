package com.playnode.tournament_service.repository;

import com.playnode.tournament_service.entity.PartitaRef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartitaRefRepository extends JpaRepository<PartitaRef, Long> {
}
