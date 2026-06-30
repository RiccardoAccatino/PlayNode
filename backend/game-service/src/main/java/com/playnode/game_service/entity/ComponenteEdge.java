package com.playnode.game_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "componente_edge")
public class ComponenteEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_componente_edge")
    private Long idComponenteEdge;

    @Column(name = "address", nullable = false, unique = true)
    private String address;

    @Column(name = "locale_id", nullable = false)
    private Long localeId;

    @Column(name = "stato", columnDefinition = "stato_tipo")
    @ColumnTransformer(read = "stato::text", write = "?::stato_tipo")
    private String stato;

    @Column(name = "ultimo_heartbeat")
    private java.time.LocalDateTime ultimoHeartbeat;

    public ComponenteEdge() {
    }

    public Long getIdComponenteEdge() {
        return idComponenteEdge;
    }

    public void setIdComponenteEdge(Long idComponenteEdge) {
        this.idComponenteEdge = idComponenteEdge;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getLocaleId() {
        return localeId;
    }

    public void setLocaleId(Long localeId) {
        this.localeId = localeId;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public java.time.LocalDateTime getUltimoHeartbeat() {
        return ultimoHeartbeat;
    }

    public void setUltimoHeartbeat(java.time.LocalDateTime ultimoHeartbeat) {
        this.ultimoHeartbeat = ultimoHeartbeat;
    }
}
