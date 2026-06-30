package com.playnode.game_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mqtt_outbox")
public class MqttOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_outbox")
    private Long idOutbox;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "payload", nullable = false, columnDefinition = "text")
    private String payload;

    @Column(name = "broker_url", nullable = false)
    private String brokerUrl;

    @Column(name = "id_partita")
    private Long idPartita;

    @Column(name = "stato", nullable = false)
    private String stato = "PENDING";

    @Column(name = "tentativi", nullable = false)
    private int tentativi = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "error_message")
    private String errorMessage;

    public Long getIdOutbox() {
        return idOutbox;
    }

    public void setIdOutbox(Long idOutbox) {
        this.idOutbox = idOutbox;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getBrokerUrl() {
        return brokerUrl;
    }

    public void setBrokerUrl(String brokerUrl) {
        this.brokerUrl = brokerUrl;
    }

    public Long getIdPartita() {
        return idPartita;
    }

    public void setIdPartita(Long idPartita) {
        this.idPartita = idPartita;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public int getTentativi() {
        return tentativi;
    }

    public void setTentativi(int tentativi) {
        this.tentativi = tentativi;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
