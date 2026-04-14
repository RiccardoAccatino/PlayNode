package com.playnode.auth_service.entity;

import jakarta.persistence.*;

    @Entity
    @Table(name = "Utente")
    public class utente {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_utente")
        private String id;

        @Column(nullable = false, unique = true)
        private String username;

        @Column(nullable = false, unique = true)
        private String email;

        @Column(nullable = false)
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ruoloTipo ruolo;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private sessoTipo sesso;

        // costruttore vuoto
        public utente() {}

        // Costruttore
        public utente(String username, String email, String password, ruoloTipo ruolo, sessoTipo sesso) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.ruolo = ruolo;
            this.sesso = sesso;
        }
        //fetter e setter
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password){this.password = password; }

    }

