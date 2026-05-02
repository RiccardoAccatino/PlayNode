-- ==========================================
-- INSERIMENTO DATI DI PROVA (DMLPOP)
-- ==========================================


-- 1. UTENTI (1 Admin Piattaforma, 1 Admin Gioco, 2 Gestori, 6 Giocatori)
-- PASSWORD :PlayNode2026!
INSERT INTO Utente (username, email, password, ruolo, sesso) VALUES
     ('francesco_admin', 'francesco.dappiano@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'AdminPiattaforma', 'Maschio'),
     ('riccardo_gameadmin', 'riccardo.accatino@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'AdminGioco', 'Maschio'),
     ('mario_gestore', 'mario.rossi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Gestore', 'Maschio'),
     ('luigi_gestore', 'luigi.verdi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Gestore', 'Maschio'),
     ('angie_player', 'angie.albitres@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'),
     ('lisa_player', 'lisa.bianchi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'),
     ('giulio_player', 'giulio.neri@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'),
     ('sara_player', 'sara.gialli@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'),
     ('marco_player', 'marco.blu@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'),
     ('elena_player', 'elena.viola@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina');

-- 2. SQUADRE
INSERT INTO Squadra (nome_squadra) VALUES
    ('Leoni del Biliardino'),
    ('Tigri del Ping Pong'),
    ('I Senza Speranza');


-- 3. MEMBRI DELLE SQUADRE
INSERT INTO Membro_squadra (id_utente, id_squadra) VALUES
    (5, 1), (7, 1), -- Angie e Giulio nella squadra 1
    (6, 2), (8, 2), -- Lisa e Sara nella squadra 2
    (9, 3), (10, 3); -- Marco ed Elena nella squadra 3


-- 4. TIPOLOGIE DI GIOCO
INSERT INTO Tipologia_gioco (nome_tipologia_gioco, descrizione, regole, admin_creatore_id) VALUES
    ('Biliardino Smart', 'Calcio balilla con sensori ottici 2v2', 'Vince la prima squadra che arriva a 10 goal. Vietato il gancio.', 2),
    ('Ping Pong IoT', 'Tavolo da ping pong con rilevamento rimbalzi', 'Al meglio dei 3 set da 11 punti.', 2),
    ('Freccette Digitali', 'Bersaglio smart con calcolo automatico dei punti', 'Modalità 501 classica.', 2);


-- 5. LOCALI
INSERT INTO Locale (nome, indirizzo, accesso, gestore_id) VALUES
    ('Taverna del Cinghiale', 'Via Roma 10, Torino', 'Luogo pubblico', 3),
    ('Circolo Sportivo Nord', 'Piazza Milano 5, Torino', 'Luogo privato', 4);


-- 6. COMPONENTI EDGE
INSERT INTO Componente_edge (address, locale_id, stato) VALUES
    ('00:1B:44:11:3A:B7', 1, 'Online'),
    ('AA:BB:CC:DD:EE:FF', 1, 'Offline'),
    ('11:22:33:44:55:66', 2, 'Online');


-- 7. GIOCHI FISICI (Nei locali e collegati agli Edge)
INSERT INTO Gioco_fisico (tipologia_gioco_id, locale_id, edge_id) VALUES
    (1, 1, 1), -- Biliardino Smart nella Taverna (Edge 1)
    (3, 1, 2), -- Freccette nella Taverna (Edge 2)
    (2, 2, 3); -- Ping Pong al Circolo (Edge 3)


-- 8. TORNEI
INSERT INTO Torneo (nome_torneo, modalita, regole_del_torneo, classifica, tipologia_gioco_id, data_inizio, data_fine) VALUES
    ('Coppa Estiva Biliardino', 'Squadre', 'Eliminazione diretta. La finale si gioca al meglio di 3 partite.', 'Da definire', 1, '2026-06-01', '2026-06-15'),
    ('Campionato Ping Pong 1v1', 'Individuale', 'Gironi all''italiana seguiti da playoff.', 'In corso', 2, '2026-05-01', NULL);


-- 9. TORNEO_LOCALE (In quali locali si gioca il torneo)
INSERT INTO Torneo_locale (id_torneo, id_locale) VALUES
    (1, 1), -- Coppa Biliardino nella Taverna
    (2, 2); -- Coppa Ping Pong al Circolo


-- 10. PARTITE (Alcune terminate, altre in corso)
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
    (1, 1, '2026-06-01 18:00:00', '2026-06-01 18:25:30', 'Realtime'), -- Partita 1 (Terminata, a squadre)
    (3, 2, '2026-05-05 20:00:00', '2026-05-05 21:10:00', 'Sincronizzata_Offline'), -- Partita 2 (Terminata, individuale)
    (1, NULL, CURRENT_TIMESTAMP, NULL, 'Realtime'); -- Partita 3 (Partita amichevole in corso adesso, no torneo)


-- 11. PARTECIPA (Chi ha giocato nelle partite. Nota il check: null sul giocatore se gioca la squadra, e viceversa)
INSERT INTO Partecipa (partita_id, giocatore_id, squadra_id, punteggio_finale, vittoria) VALUES
    -- Partita 1 (Squadra 1 vs Squadra 2 a Biliardino)
    (1, NULL, 1, 10, true),
    (1, NULL, 2, 8, false),
    -- Partita 2 (Giocatore 9 vs Giocatore 10 a Ping Pong)
    (2, 9, NULL, 1, false),
    (2, 10, NULL, 2, true),
    -- Partita 3 (Amichevole in corso Squadra 1 vs Squadra 3)
    (3, NULL, 1, 5, false),
    (3, NULL, 3, 2, false);


-- 12. EVENTI IOT (Dati fisici finti generati dai sensori)
INSERT INTO Evento_iot (partita_id, timestamp_evento, valore) VALUES
    (1, '2026-06-01 18:05:12', 'Goal: Squadra 1'),
    (1, '2026-06-01 18:07:34', 'Goal: Squadra 2'),
    (1, '2026-06-01 18:10:05', 'Fallo: Frullata'),
    (3, CURRENT_TIMESTAMP, 'Goal: Squadra 1');