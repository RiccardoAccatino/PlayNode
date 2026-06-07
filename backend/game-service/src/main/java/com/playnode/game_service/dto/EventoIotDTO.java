package com.playnode.game_service.dto;

public class EventoIotDTO {
    private Long id;
    private Long idPartita;
    private Long idSensore;
    private String timestamp;
    private String valore;

    public EventoIotDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdPartita() {
        return idPartita;
    }

    public void setIdPartita(Long idPartita) {
        this.idPartita = idPartita;
    }

    public Long getIdSensore() {
        return idSensore;
    }

    public void setIdSensore(Long idSensore) {
        this.idSensore = idSensore;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getValore() {
        return valore;
    }

    public void setValore(String valore) {
        this.valore = valore;
    }
}
