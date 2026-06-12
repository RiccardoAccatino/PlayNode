package com.playnode.game_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evento_iot")
public class EventoIot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idEvento;

    @Column(name = "partita_id")
    private Long partitaId;

    @Column(name = "sensore_id")
    private Long sensoreId;

    @Column(name = "timestamp_evento")
    private LocalDateTime timestampEvento;

    @Column(name = "valore")
    private String valore;

    public EventoIot() {}

    // Getter e Setter
    public Long getIdEvento() { return idEvento; }
    public void setIdEvento(Long idEvento) { this.idEvento = idEvento; }

    public Long getPartitaId() { return partitaId; }
    public void setPartitaId(Long partitaId) { this.partitaId = partitaId; }

    public Long getSensoreId() { return sensoreId; }
    public void setSensoreId(Long sensoreId) { this.sensoreId = sensoreId; }

    public LocalDateTime getTimestampEvento() { return timestampEvento; }
    public void setTimestampEvento(LocalDateTime timestampEvento) { this.timestampEvento = timestampEvento; }

    public String getValore() { return valore; }
    public void setValore(String valore) { this.valore = valore; }
}