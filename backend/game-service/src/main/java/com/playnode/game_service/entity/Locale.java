package com.playnode.game_service.entity;

import jakarta.persistence.*;

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

    // Costruttori, Getter e Setter
    public Locale() {}

    public Long getIdLocale() { return idLocale; }
    public void setIdLocale(Long idLocale) { this.idLocale = idLocale; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getIndirizzo() { return indirizzo; }
    public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }
}