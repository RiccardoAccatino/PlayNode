package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.StatisticaUtente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatisticaRepository extends JpaRepository<StatisticaUtente, Long> {

    @Query("SELECT s FROM StatisticaUtente s WHERE s.utenteId = :utenteId")
    Optional<StatisticaUtente> findByIdUtente(@Param("utenteId") Long utenteId);
}