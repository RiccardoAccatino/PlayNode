package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Partita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

        @Query("""
                        SELECT COUNT(p) FROM Partita p
                        JOIN GiocoFisico g ON p.giocoFisicoId = g.idGiocoFisico
                        WHERE g.localeId = :localeId AND p.timestampInizio >= :from AND p.timestampInizio < :to
                        """)
        long countByLocaleBetween(@Param("localeId") Long localeId,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to);

        @Query(value = """
                        SELECT tg.nome_tipologia_gioco, COUNT(*) AS cnt
                        FROM partita pa
                        JOIN gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
                        JOIN tipologia_gioco tg ON gf.tipologia_gioco_id = tg.id_tipologia_gioco
                        WHERE gf.locale_id = :localeId
                        GROUP BY tg.id_tipologia_gioco, tg.nome_tipologia_gioco
                        ORDER BY cnt DESC
                        LIMIT 1
                        """, nativeQuery = true)
        List<Object[]> trovaGiocoPiuUsato(@Param("localeId") Long localeId);

        @Query(value = """
                        SELECT CAST(EXTRACT(HOUR FROM pa.timestamp_inizio) AS INTEGER) AS ora, COUNT(*) AS cnt
                        FROM partita pa
                        JOIN gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
                        WHERE gf.locale_id = :localeId
                        GROUP BY ora
                        ORDER BY cnt DESC
                        LIMIT 1
                        """, nativeQuery = true)
        List<Object[]> trovaOraPunta(@Param("localeId") Long localeId);

        @Query(value = """
                        SELECT tg.nome_tipologia_gioco, COUNT(*) AS cnt
                        FROM partita pa
                        JOIN gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
                        JOIN tipologia_gioco tg ON gf.tipologia_gioco_id = tg.id_tipologia_gioco
                        WHERE gf.locale_id = :localeId
                        GROUP BY tg.id_tipologia_gioco, tg.nome_tipologia_gioco
                        ORDER BY cnt DESC
                        """, nativeQuery = true)
        List<Object[]> conteggioPartitePerGioco(@Param("localeId") Long localeId);

        @Query(value = """
                        SELECT CAST(EXTRACT(HOUR FROM e.timestamp_evento) AS INTEGER) AS ora, COUNT(*) AS cnt
                        FROM evento_iot e
                        JOIN partita pa ON e.partita_id = pa.id_partita
                        JOIN gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
                        WHERE gf.locale_id = :localeId AND e.timestamp_evento >= CURRENT_DATE
                        GROUP BY ora
                        ORDER BY cnt DESC
                        LIMIT 1
                        """, nativeQuery = true)
        List<Object[]> trovaPiccoEventiOggi(@Param("localeId") Long localeId);

        boolean existsByGiocoFisicoIdAndTimestampFineIsNull(Long giocoFisicoId);

        @Query("SELECT DISTINCT p.giocoFisicoId FROM Partita p WHERE p.timestampFine IS NULL AND p.giocoFisicoId IS NOT NULL")
        List<Long> findGiocoFisicoIdsConPartitaAttiva();

        @Query(value = """
                        SELECT DISTINCT pa.gioco_fisico_id
                        FROM partita pa
                        JOIN gioco_fisico gf ON pa.gioco_fisico_id = gf.id_gioco_fisico
                        WHERE gf.locale_id = :localeId AND pa.timestamp_fine IS NULL
                        """, nativeQuery = true)
        List<Long> findGiocoFisicoIdsAttiviPerLocale(@Param("localeId") Long localeId);
}