// Aggiungi questi metodi dentro il tuo PartecipaRepository.java (o simile)

@Repository
public interface PartitaRepository extends JpaRepository<Partecipa, Long> {

    // 1. Conta le partite totali giocate dall'utente
    @Query("SELECT COUNT(p) FROM Partecipa p WHERE p.utenteId = :utenteId")
    int contaPartiteGiocate(@Param("utenteId") Long utenteId);

    // 2. Conta quante volte ha vinto
    @Query("SELECT COUNT(p) FROM Partecipa p WHERE p.utenteId = :utenteId AND p.vittoria = true")
    int contaVittorie(@Param("utenteId") Long utenteId);

    // 3. Somma tutti i punteggi ottenuti (coalesce per evitare null se non ha mai giocato)
    @Query("SELECT COALESCE(SUM(p.punteggio), 0) FROM Partecipa p WHERE p.utenteId = :utenteId")
    int calcolaPunteggioTotale(@Param("utenteId") Long utenteId);

    // 4. Recupera lo storico (tutte le sue partecipazioni) ordinato per data
    // Presuppone che Partecipa abbia una relazione con Partita (es. p.partita.data)
    @Query("SELECT p FROM Partecipa p WHERE p.utenteId = :utenteId ORDER BY p.partita.dataPartita DESC")
    List<Partecipa> findStoricoByUtente(@Param("utenteId") Long utenteId);
}