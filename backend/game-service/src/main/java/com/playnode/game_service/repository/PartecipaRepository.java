package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Partecipa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartecipaRepository extends JpaRepository<Partecipa, Long> {

    Optional<Partecipa> findByPartitaIdAndSquadraId(Long partitaId, Long squadraId);

    Optional<Partecipa> findByPartitaIdAndGiocatoreId(Long partitaId, Long giocatoreId);

    List<Partecipa> findByPartitaIdOrderByIdPartecipaAsc(Long partitaId);

    @Query("""
            SELECT COUNT(DISTINCT p.giocatoreId) FROM Partecipa p
            JOIN Partita pa ON p.partitaId = pa.idPartita
            JOIN GiocoFisico g ON pa.giocoFisicoId = g.idGiocoFisico
            WHERE g.localeId = :localeId AND p.giocatoreId IS NOT NULL
            AND pa.timestampInizio >= :from AND pa.timestampInizio < :to
            """)
    long countGiocatoriUniciByLocaleBetween(@Param("localeId") Long localeId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}