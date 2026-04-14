package com.playnode.game_service.dto;

public class PartitaDTO {
    private Long id;
    private Long idGiocoInstallato;
    private String stato; // Esempi: "IN_CORSO", "TERMINATA"

    // Usiamo campi generici per i punteggi (vanno bene per Calciobalilla, Freccette, Bowling, ecc.)
    private int punteggio1;
    private int punteggio2;

    public PartitaDTO() {}

    // Getter e Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdGiocoInstallato() { return idGiocoInstallato; }
    public void setIdGiocoInstallato(Long idGiocoInstallato) { this.idGiocoInstallato = idGiocoInstallato; }
    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }
    public int getPunteggio1() { return punteggio1; }
    public void setPunteggio1(int punteggio1) { this.punteggio1 = punteggio1; }
    public int getPunteggio2() { return punteggio2; }
    public void setPunteggio2(int punteggio2) { this.punteggio2 = punteggio2; }
}