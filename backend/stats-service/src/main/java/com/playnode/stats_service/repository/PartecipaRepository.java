package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.Partecipa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository per Partecipa nel contesto del stats-service.
 * Usato per calcolare statistiche aggregate direttamente da JPQL
 * quando serve bypassare le view (es. per utenti senza partite).
 *
 */
@Repository
public interface PartecipaRepository extends JpaRepository<Partecipa, Long> {

    Optional<Partecipa> findByPartitaIdAndSquadraId(Long partitaId, Long squadraId);

    // 1. Conta le partite totali giocate dall'utente
    @Query("SELECT COUNT(p) FROM Partecipa p WHERE p.giocatoreId = :utenteId")
    int contaPartiteGiocate(@Param("utenteId") Long utenteId);

    // 2. Conta quante volte ha vinto
    @Query("SELECT COUNT(p) FROM Partecipa p WHERE p.giocatoreId = :utenteId AND p.vittoria = true")
    int contaVittorie(@Param("utenteId") Long utenteId);

    // 3. Somma tutti i punteggi ottenuti
    @Query("SELECT COALESCE(SUM(p.punteggioFinale), 0) FROM Partecipa p WHERE p.giocatoreId = :utenteId")
    int calcolaPunteggioTotale(@Param("utenteId") Long utenteId);

    // 4. Storico partecipazioni ordinate per data di inizio partita
    @Query("""
            SELECT p FROM Partecipa p
            JOIN Partita pa ON pa.idPartita = p.partitaId
            WHERE p.giocatoreId = :utenteId
            ORDER BY pa.timestampInizio DESC
            """)
    List<Partecipa> findStoricoByUtente(@Param("utenteId") Long utenteId);

    // 5. Tutte le partecipazioni di una partita (utile per il punteggio aggregato)
    List<Partecipa> findByPartitaId(Long partitaId);
}