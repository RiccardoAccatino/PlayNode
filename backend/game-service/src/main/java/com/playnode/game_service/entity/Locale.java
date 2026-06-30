package com.playnode.game_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "locale")
public class Locale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_locale")
    private Long idLocale;

    @Column(name = "nome")
    private String nome;

    @Column(name = "indirizzo")
    private String indirizzo;

    @Column(name = "accesso", columnDefinition = "accesso_tipo")
    @ColumnTransformer(read = "accesso::text", write = "?::accesso_tipo")
    private String accesso;

    @Column(name = "gestore_id")
    private Long gestoreId;

    @Column(name = "host_broker")
    private String hostBroker;

    @Column(name = "edge_api_token")
    private String edgeApiToken;

    @Column(name = "edge_password")
    private String edgePassword;

    public Locale() {
    }

    public Long getIdLocale() {
        return idLocale;
    }

    public void setIdLocale(Long idLocale) {
        this.idLocale = idLocale;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getIndirizzo() {
        return indirizzo;
    }

    public void setIndirizzo(String indirizzo) {
        this.indirizzo = indirizzo;
    }

    public String getAccesso() {
        return accesso;
    }

    public void setAccesso(String accesso) {
        this.accesso = accesso;
    }

    public Long getGestoreId() {
        return gestoreId;
    }

    public void setGestoreId(Long gestoreId) {
        this.gestoreId = gestoreId;
    }

    public String getHostBroker() {
        return hostBroker;
    }

    public void setHostBroker(String hostBroker) {
        this.hostBroker = hostBroker;
    }

    public String getEdgeApiToken() {
        return edgeApiToken;
    }

    public void setEdgeApiToken(String edgeApiToken) {
        this.edgeApiToken = edgeApiToken;
    }

    public String getEdgePassword() {
        return edgePassword;
    }

    public void setEdgePassword(String edgePassword) {
        this.edgePassword = edgePassword;
    }
}
