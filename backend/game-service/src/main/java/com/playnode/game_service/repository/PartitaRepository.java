package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Partita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartitaRepository extends JpaRepository<Partita, Long> {

    @Query(value = """
        WITH PartiteInCorso AS (
            SELECT 
                pa.id_partita,
                pa.gioco_fisico_id,
                pa.timestamp_inizio,
                p.punteggio_finale AS punteggio,
                ROW_NUMBER() OVER (PARTITION BY pa.id_partita ORDER BY p.id_partecipa) AS riga_partecipante
            FROM Partita pa
            JOIN Gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
            LEFT JOIN Partecipa p ON pa.id_partita = p.partita_id
            WHERE 
                gf.locale_id = :idLocale
                AND pa.timestamp_fine IS NULL
        )
        SELECT 
            id_partita,
            gioco_fisico_id,
            timestamp_inizio,
            COALESCE(MAX(CASE WHEN riga_partecipante = 1 THEN punteggio END), 0) AS punteggio1,
            COALESCE(MAX(CASE WHEN riga_partecipante = 2 THEN punteggio END), 0) AS punteggio2
        FROM PartiteInCorso
        GROUP BY id_partita, gioco_fisico_id, timestamp_inizio
        """, nativeQuery = true)
    List<Object[]> trovaPartiteLiveGrezzePerLocale(@Param("idLocale") Long idLocale);
}