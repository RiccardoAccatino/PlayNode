package com.playnode.tournament_service.dto;

import com.playnode.tournament_service.entity.ModalitaGiocoTipo;
import java.time.LocalDate;

public class TorneoDTO {
    private Long id;
    private String nome;
    private ModalitaGiocoTipo modalita;
    private String regole;
    private Long idTipologiaGioco;
    private LocalDate dataInizio;
    private LocalDate dataFine;

    // Costruttore vuoto
    public TorneoDTO() {}

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public ModalitaGiocoTipo getModalita() { return modalita; }
    public void setModalita(ModalitaGiocoTipo modalita) { this.modalita = modalita; }

    public String getRegole() { return regole; }
    public void setRegole(String regole) { this.regole = regole; }

    public Long getIdTipologiaGioco() { return idTipologiaGioco; }
    public void setIdTipologiaGioco(Long idTipologiaGioco) { this.idTipologiaGioco = idTipologiaGioco; }

    public LocalDate getDataInizio() { return dataInizio; }
    public void setDataInizio(LocalDate dataInizio) { this.dataInizio = dataInizio; }

    public LocalDate getDataFine() { return dataFine; }
    public void setDataFine(LocalDate dataFine) { this.dataFine = dataFine; }
}