package com.playnode.stats_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StoricoPartita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idUtente;
    private String idLocale;
    private String nomeGioco;

    // I punti ottenuti IN QUESTA SINGOLA partita
    private int punteggioOttenuto;

    // La data e l'ora esatta in cui è finita la partita
    private LocalDateTime dataPartita;

    public StoricoPartita() {}

    // Getter e Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdUtente() { return idUtente; }
    public void setIdUtente(Long idUtente) { this.idUtente = idUtente; }

    public String getIdLocale() { return idLocale; }
    public void setIdLocale(String idLocale) { this.idLocale = idLocale; }

    public String getNomeGioco() { return nomeGioco; }
    public void setNomeGioco(String nomeGioco) { this.nomeGioco = nomeGioco; }

    public int getPunteggioOttenuto() { return punteggioOttenuto; }
    public void setPunteggioOttenuto(int punteggioOttenuto) { this.punteggioOttenuto = punteggioOttenuto; }

    public LocalDateTime getDataPartita() { return dataPartita; }
    public void setDataPartita(LocalDateTime dataPartita) { this.dataPartita = dataPartita; }
}