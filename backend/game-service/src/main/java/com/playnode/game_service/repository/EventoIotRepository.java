package com.playnode.game_service.repository;

import com.playnode.game_service.entity.EventoIot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoIotRepository extends JpaRepository<EventoIot, Long> {
    // Ci tornerà utile per recuperare tutti gli eventi di una specifica partita!
    List<EventoIot> findByPartitaIdOrderByTimestampEventoAsc(Long partitaId);
}