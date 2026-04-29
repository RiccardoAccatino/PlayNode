package com.playnode.stats_service.entity;

import jakarta.persistence.*;

@Entity
public class StatisticaUtente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idUtente;

    // NUOVI CAMPI AGGIUNTI PER GLI ADMIN!
    private String idLocale; // Es. "LOC-007"
    private String nomeGioco; // Es. "Calciobalilla"

    private int punteggioTotale;
    private int partiteGiocate;

    public StatisticaUtente() {}

    // Aggiungi i Getter e Setter per i nuovi campi
    public String getIdLocale() { return idLocale; }
    public void setIdLocale(String idLocale) { this.idLocale = idLocale; }

    public String getNomeGioco() { return nomeGioco; }
    public void setNomeGioco(String nomeGioco) { this.nomeGioco = nomeGioco; }

    // ... (Mantieni anche i vecchi Getter e Setter per idUtente, punteggioTotale, partiteGiocate)
}