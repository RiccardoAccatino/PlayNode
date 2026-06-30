package com.playnode.tournament_service.repository;

import com.playnode.tournament_service.entity.PartecipaRef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartecipaRefRepository extends JpaRepository<PartecipaRef, Long> {
    List<PartecipaRef> findByPartitaIdAndGiocatoreIdIsNotNull(Long partitaId);
}
