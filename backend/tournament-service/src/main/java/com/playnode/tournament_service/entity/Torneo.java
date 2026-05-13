package com.playnode.tournament_service.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "torneo")
public class Torneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_torneo")
    private Long idTorneo;

    @Column(name = "nome_torneo", nullable = false)
    private String nomeTorneo;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalita", nullable = false)
    private ModalitaGiocoTipo modalita;

    @Column(name = "regole_del_torneo", nullable = false)
    private String regoleDelTorneo;

    @Column(name = "classifica")
    private String classifica;

    @Column(name = "tipologia_gioco_id", nullable = false)
    private Long tipologiaGiocoId;

    @Column(name = "data_inizio", nullable = false)
    private LocalDate dataInizio;

    @Column(name = "data_fine")
    private LocalDate dataFine;

    // Costruttore vuoto obbligatorio per Spring
    public Torneo() {}

    // --- GETTER E SETTER ---
    public Long getIdTorneo() { return idTorneo; }
    public void setIdTorneo(Long idTorneo) { this.idTorneo = idTorneo; }

    public String getNomeTorneo() { return nomeTorneo; }
    public void setNomeTorneo(String nomeTorneo) { this.nomeTorneo = nomeTorneo; }

    public ModalitaGiocoTipo getModalita() { return modalita; }
    public void setModalita(ModalitaGiocoTipo modalita) { this.modalita = modalita; }

    public String getRegoleDelTorneo() { return regoleDelTorneo; }
    public void setRegoleDelTorneo(String regoleDelTorneo) { this.regoleDelTorneo = regoleDelTorneo; }

    public String getClassifica() { return classifica; }
    public void setClassifica(String classifica) { this.classifica = classifica; }

    public Long getTipologiaGiocoId() { return tipologiaGiocoId; }
    public void setTipologiaGiocoId(Long tipologiaGiocoId) { this.tipologiaGiocoId = tipologiaGiocoId; }

    public LocalDate getDataInizio() { return dataInizio; }
    public void setDataInizio(LocalDate dataInizio) { this.dataInizio = dataInizio; }

    public LocalDate getDataFine() { return dataFine; }
    public void setDataFine(LocalDate dataFine) { this.dataFine = dataFine; }
}