package com.playnode.tournament_service.dto;

import com.playnode.tournament_service.entity.ModalitaGiocoTipo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Oggetto di trasferimento dati per un Torneo")
public class TorneoDTO {

    @Schema(description = "ID univoco del torneo", example = "1")
    private Long id;

    @Schema(description = "Nome del torneo", example = "Coppa Estiva Biliardino")
    private String nome;

    @Schema(description = "Modalità di gioco (Individuale o Squadre)")
    private ModalitaGiocoTipo modalita;

    @Schema(description = "Regole specifiche del torneo", example = "Eliminazione diretta, finale al meglio di 3")
    private String regole;

    @Schema(description = "ID della tipologia di gioco associata", example = "1")
    private Long idTipologiaGioco;

    @Schema(description = "Data di inizio del torneo", example = "2026-06-01")
    private LocalDate dataInizio;

    @Schema(description = "Data di fine del torneo (opzionale)", example = "2026-06-15")
    private LocalDate dataFine;

    @Schema(description = "Stato attuale della classifica", example = "In corso")
    private String classifica;

    @Schema(description = "Lista degli ID dei locali in cui si svolge il torneo")
    private List<Long> localiIds = new ArrayList<>();

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

    public List<Long> getLocaliIds() { return localiIds; }
    public void setLocaliIds(List<Long> localiIds) { this.localiIds = localiIds; }

    public String getClassifica() { return classifica; }
    public void setClassifica(String classifica) { this.classifica = classifica; }
}