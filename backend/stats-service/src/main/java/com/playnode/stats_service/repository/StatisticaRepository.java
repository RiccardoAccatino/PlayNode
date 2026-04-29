package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.StatisticaUtente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatisticaRepository extends JpaRepository<StatisticaUtente, Long> {

    Optional<StatisticaUtente> findByIdUtente(Long idUtente);

    // NOVITÀ: Questo metodo magico crea in automatico la classifica dei migliori 10!
    List<StatisticaUtente> findTop10ByOrderByPunteggioTotaleDesc();
}