package com.playnode.stats_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

/**
 * Questa classe rappresenta la tabella "StatisticaUtente" nel database.
 */
@Entity
@Immutable
@Table(name = "statistica_utente")
public class StatisticaUtente {

    @Id
    private Long id;

    private Long utenteId;
    private String idLocale;
    private String nomeGioco;
    private int punteggioTotale;
    private int partiteGiocate;

    // Aggiunto il campo "vittorie" che mancava ed era richiesto dal Service
    private int vittorie;

    // Costruttore vuoto: Spring Boot lo richiede obbligatoriamente per leggere i
    // dati dal database
    public StatisticaUtente() {
    }

    // ==========================================
    // --- METODI GETTER E SETTER ---
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Long utenteId) {
        this.utenteId = utenteId;
    }

    public String getIdLocale() {
        return idLocale;
    }

    public void setIdLocale(String idLocale) {
        this.idLocale = idLocale;
    }

    public String getNomeGioco() {
        return nomeGioco;
    }

    public void setNomeGioco(String nomeGioco) {
        this.nomeGioco = nomeGioco;
    }

    public int getPunteggioTotale() {
        return punteggioTotale;
    }

    public void setPunteggioTotale(int punteggioTotale) {
        this.punteggioTotale = punteggioTotale;
    }

    public int getPartiteGiocate() {
        return partiteGiocate;
    }

    public void setPartiteGiocate(int partiteGiocate) {
        this.partiteGiocate = partiteGiocate;
    }

    public int getVittorie() {
        return vittorie;
    }

    public void setVittorie(int vittorie) {
        this.vittorie = vittorie;
    }
} // <-- La classe finisce correttamente qui, con un'unica parentesi di chiusura
  // finale!