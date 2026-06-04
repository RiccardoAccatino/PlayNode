package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.StatisticaUtente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatisticaRepository extends JpaRepository<StatisticaUtente, Long> {

    // NOVITÀ: L'annotazione @Query forza Spring a eseguire esattamente questa ricerca,
    // evitando l'errore "No property utente found for type Long".
    @Query("SELECT s FROM StatisticaUtente s WHERE s.utenteId = :idUtente")
    Optional<StatisticaUtente> findByIdUtente(@Param("idUtente") Long idUtente);

    // Questo metodo magico crea in automatico la classifica dei migliori 10!
    List<StatisticaUtente> findTop10ByOrderByPunteggioTotaleDesc();
}