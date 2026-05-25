package com.playnode.auth_service.entity;

import jakarta.persistence.*;

    @Entity
    @Table(name = "Utente")
    public class Utente {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_utente")
        private Long id;

        @Column(nullable = false, unique = true)
        private String username;

        @Column(nullable = false, unique = true)
        private String email;

        @Column(nullable = false)
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private RuoloTipo ruolo;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private SessoTipo sesso;

        // costruttore vuoto
        public Utente() {}

        // Costruttore
        public Utente(String username, String email, String password, RuoloTipo ruolo, SessoTipo sesso) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.ruolo = ruolo;
            this.sesso = sesso;
        }
        //fetter e setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password){this.password = password; }
        public String getEmail() {return email;}
        public void setEmail(String email){this.email = email;}
        public RuoloTipo getRuolo() {return ruolo;}
        public void setRuolo(RuoloTipo ruolo) {this.ruolo = ruolo;}
        public SessoTipo getSesso() { return sesso; }
        public void setSesso(SessoTipo sesso) { this.sesso = sesso; }
    }

