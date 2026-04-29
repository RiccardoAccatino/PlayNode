package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.StoricoPartita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StoricoPartitaRepository extends JpaRepository<StoricoPartita, Long> {

    // 1. Quante partite ha giocato questo utente in totale? (Spring lo capisce dal nome del metodo!)
    long countByIdUtente(Long idUtente);

    // 2. Qual è la somma di tutti i punti di questo utente?
    // Usiamo @Query per dire al database di fare la SOMMA (SUM) matematicamente
    @Query("SELECT COALESCE(SUM(s.punteggioOttenuto), 0) FROM StoricoPartita s WHERE s.idUtente = :idUtente")
    long sumPunteggioTotaleByIdUtente(@Param("idUtente") Long idUtente);

    // --- QUERY PER GLI ADMIN ---

    // Quante partite sono state fatte in un locale specifico?
    long countByIdLocale(String idLocale);

    // Quante partite in totale per un determinato gioco in tutta la piattaforma?
    long countByNomeGioco(String nomeGioco);
}