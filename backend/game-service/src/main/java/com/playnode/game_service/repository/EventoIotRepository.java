package com.playnode.game_service.repository;

import com.playnode.game_service.entity.EventoIot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoIotRepository extends JpaRepository<EventoIot, Long> {
    List<EventoIot> findByPartitaIdOrderByTimestampEventoAsc(Long partitaId);

    @Query("""
            SELECT COUNT(e) FROM EventoIot e
            JOIN Partita p ON e.partitaId = p.idPartita
            JOIN GiocoFisico g ON p.giocoFisicoId = g.idGiocoFisico
            WHERE g.localeId = :localeId AND e.timestampEvento >= :since
            """)
    long countByLocaleSince(@Param("localeId") Long localeId, @Param("since") LocalDateTime since);

    @Query("""
            SELECT e FROM EventoIot e
            JOIN Partita p ON e.partitaId = p.idPartita
            JOIN GiocoFisico g ON p.giocoFisicoId = g.idGiocoFisico
            WHERE g.localeId = :localeId
            ORDER BY e.timestampEvento DESC
            """)
    List<EventoIot> findRecentByLocale(@Param("localeId") Long localeId, org.springframework.data.domain.Pageable pageable);
}