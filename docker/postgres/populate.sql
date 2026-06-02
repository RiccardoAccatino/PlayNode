-- ==========================================
-- INSERIMENTO DATI DI PROVA MASSIVI (DML)
-- ==========================================

-- 1. UTENTI (Tutti con password: PlayNode2026!)
INSERT INTO Utente (username, email, password, ruolo, sesso) VALUES
('francesco_admin', 'francesco.dappiano@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'AdminPiattaforma', 'Maschio'), -- 1
('riccardo_gameadmin', 'riccardo.accatino@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'AdminGioco', 'Maschio'), -- 2
('mario_gestore', 'mario.rossi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Gestore', 'Maschio'), -- 3
('luigi_gestore', 'luigi.verdi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Gestore', 'Maschio'), -- 4
('angie_player', 'angie.albitres@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 5 (L'UTENTE PIU' GIOCANTE)
('lisa_player', 'lisa.bianchi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 6
('giulio_player', 'giulio.neri@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'), -- 7
('sara_player', 'sara.gialli@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 8
('marco_player', 'marco.blu@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'), -- 9
('elena_player', 'elena.viola@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 10
('paolo_player', 'paolo.rossi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'), -- 11
('chiara_player', 'chiara.verdi@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 12
('roberto_player', 'roberto.gialli@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Maschio'), -- 13
('lucia_player', 'lucia.blu@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Giocatore', 'Femmina'), -- 14
('giorgio_gestore', 'giorgio.locali@gmail.com', '$2a$10$eDRAe/spAEwY98k0phIUPunG1u4sx21qlC6BAFRD24FuF7u6NdhTi', 'Gestore', 'Maschio'); -- 15


-- 2. SQUADRE
INSERT INTO Squadra (nome_squadra) VALUES
('Leoni del Biliardino'), -- 1
('Ghepardi da Biliardino'), -- 2
('I Senza Speranza'),     -- 3
('Bocciofili DOC'),       -- 4
('Bocce D''Acciaio');       -- 5


-- 3. MEMBRI DELLE SQUADRE
INSERT INTO Membro_squadra (id_utente, id_squadra) VALUES
(5, 1), (7, 1), -- Angie e Giulio nella squadra 1
(6, 2), (8, 2), -- Lisa e Sara nella squadra 2
(9, 3), (10, 3),-- Marco ed Elena nella squadra 3
(11, 4), (13, 4),-- Paolo e Roberto nella squadra 4
(5, 5), (12, 5); -- Angie e Chiara nella squadra 5 (Angie è in due squadre)


-- 4. TIPOLOGIE DI GIOCO 
INSERT INTO Tipologia_gioco (nome_tipologia_gioco, descrizione, regole, admin_creatore_id) VALUES
('Calciobalilla Smart', 'Calcio balilla con sensori ottici 2v2', 'Vince la prima squadra che arriva a 9 goal. Vietato il gancio e la rullata.', 2),
('Bocce Elettroniche', 'Campo da bocce con telecamere e misurazione ottica', 'Partita a 13 punti. Penalità per lancio oltre linea.', 2);


-- 5. LOCALI
INSERT INTO Locale (nome, indirizzo, accesso, gestore_id) VALUES
('Taverna del Cinghiale', 'Via Roma 10, Torino', 'Luogo pubblico', 3), -- 1
('Circolo Sportivo Nord', 'Piazza Milano 5, Torino', 'Luogo privato', 4), -- 2
('Bar dello Sport', 'Corso Francia 45, Milano', 'Luogo pubblico', 15), -- 3
('Bocciofila La Rampa', 'Via Napoli 12, Roma', 'Luogo pubblico', 3); -- 4


-- 6. COMPONENTI EDGE
INSERT INTO Componente_edge (address, locale_id, stato) VALUES
('00:1B:44:11:3A:B7', 1, 'Online'),  -- 1
('AA:BB:CC:DD:EE:FF', 1, 'Offline'), -- 2
('11:22:33:44:55:66', 2, 'Online'),  -- 3
('22:33:44:55:66:77', 2, 'Online'),  -- 4
('33:44:55:66:77:88', 3, 'Online'),  -- 5
('44:55:66:77:88:99', 3, 'Offline'), -- 6
('55:66:77:88:99:AA', 4, 'Online');  -- 7


-- 7. GIOCHI FISICI 
INSERT INTO Gioco_fisico (tipologia_gioco_id, locale_id, edge_id) VALUES
(1, 1, 1), -- 1. Calciobalilla nella Taverna (ID 1)
(1, 1, 2), -- 2. Calciobalilla nella Taverna (ID 1)
(1, 2, 3), -- 3. Calciobalilla al Circolo (ID 1)
(1, 2, 4), -- 4. Calciobalilla al Circolo (ID 1)
(2, 3, 5), -- 5. Bocce al Bar Sport (ID 2)
(2, 3, 6), -- 6. Bocce al Bar Sport (ID 2)
(2, 4, 7); -- 7. Bocce alla Bocciofila (ID 2)


-- 8. TORNEI
INSERT INTO Torneo (nome_torneo, modalita, regole_del_torneo, classifica, tipologia_gioco_id, data_inizio, data_fine) VALUES
('Coppa Estiva Biliardino', 'Squadre', 'Eliminazione diretta. La finale si gioca al meglio di 3.', 'Da definire', 1, '2026-06-01', '2026-06-15'),
('Campionato Calciobalilla 1v1', 'Individuale', 'Gironi all''italiana seguiti da playoff.', 'In corso', 1, '2026-05-01', NULL),
('Master Bocce Milano', 'Individuale', 'Gara di accosto.', 'Terminato', 2, '2026-03-01', '2026-03-20'),
('Trofeo della Rampa', 'Squadre', 'Round Robin bocce a coppie.', 'Terminato', 2, '2026-04-10', '2026-04-15');


-- 9. TORNEO_LOCALE
INSERT INTO Torneo_locale (id_torneo, id_locale) VALUES
(1, 1), (1, 2), -- Coppa Biliardino in due locali
(2, 2),         -- Campionato Calciobalilla al Circolo
(3, 3),         -- Master Bocce al Bar Sport
(4, 4);         -- Trofeo Bocce alla Bocciofila


-- =========================================================================
-- 10. PARTITE INDIVIDUALI (Storico corposo per 'angie_player' id=5)
-- Tutte le partite hanno timestamp progressivi per popolare bene i grafici
-- =========================================================================

-- GENNAIO / FEBBRAIO (Bocce al Bar Sport, Gioco 5)
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(5, NULL, '2026-01-10 18:00:00', '2026-01-10 18:20:00', 'Sincronizzata_Offline'), -- Partita 1
(5, NULL, '2026-01-15 19:00:00', '2026-01-15 19:30:00', 'Realtime'), -- Partita 2
(5, NULL, '2026-02-05 21:00:00', '2026-02-05 21:45:00', 'Realtime'); -- Partita 3

INSERT INTO Partecipa (partita_id, giocatore_id, punteggio_finale, vittoria) VALUES
(1, 5, 13, true), (1, 6, 8, false),  -- Angie vince contro Lisa
(2, 5, 11, false), (2, 7, 13, true),  -- Angie perde contro Giulio
(3, 5, 13, true), (3, 8, 10, false);  -- Angie vince contro Sara

-- MARZO (Torneo Master Bocce Milano, Gioco 5)
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(5, 3, '2026-03-10 18:00:00', '2026-03-10 18:25:00', 'Realtime'), -- Partita 4
(5, 3, '2026-03-15 20:00:00', '2026-03-15 20:30:00', 'Realtime'), -- Partita 5
(5, 3, '2026-03-18 21:00:00', '2026-03-18 21:45:00', 'Realtime'); -- Partita 6

INSERT INTO Partecipa (partita_id, giocatore_id, punteggio_finale, vittoria) VALUES
(4, 5, 13, true), (4, 9, 5, false),  -- Angie batte Marco
(5, 5, 13, true), (5, 10, 9, false), -- Angie batte Elena
(6, 5, 12, false), (6, 11, 13, true); -- Angie perde la finale contro Paolo

-- APRILE (Calciobalilla Individuale al Circolo Sportivo, Gioco 3)
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(3, NULL, '2026-04-05 16:00:00', '2026-04-05 16:15:00', 'Realtime'), -- Partita 7
(3, NULL, '2026-04-12 17:00:00', '2026-04-12 17:25:00', 'Realtime'), -- Partita 8
(3, NULL, '2026-04-20 18:30:00', '2026-04-20 19:00:00', 'Realtime'); -- Partita 9

INSERT INTO Partecipa (partita_id, giocatore_id, punteggio_finale, vittoria) VALUES
(7, 5, 9, true), (7, 12, 6, false),    -- Angie batte Chiara
(8, 5, 8, false), (8, 13, 9, true),    -- Angie perde contro Roberto
(9, 5, 9, true), (9, 14, 4, false);    -- Angie batte Lucia

-- MAGGIO (Tante partite per alzare il volume mensile. Calciobalilla Torneo + Amichevoli)
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(3, 2, '2026-05-02 18:00:00', '2026-05-02 18:20:00', 'Realtime'), -- Partita 10
(3, 2, '2026-05-08 19:00:00', '2026-05-08 19:30:00', 'Realtime'), -- Partita 11
(3, 2, '2026-05-15 20:00:00', '2026-05-15 20:25:00', 'Realtime'), -- Partita 12
(3, NULL, '2026-05-20 17:00:00', '2026-05-20 17:15:00', 'Realtime'), -- Partita 13
(5, NULL, '2026-05-25 21:00:00', '2026-05-25 21:40:00', 'Realtime'); -- Partita 14 (Bocce Amichevole)

INSERT INTO Partecipa (partita_id, giocatore_id, punteggio_finale, vittoria) VALUES
(10, 5, 9, true), (10, 7, 5, false),
(11, 5, 9, true), (11, 8, 7, false),
(12, 5, 9, true), (12, 9, 6, false),
(13, 5, 9, true), (13, 10, 2, false),
(14, 5, 13, true), (14, 6, 11, false);


-- =========================================================================
-- 11. PARTITE A SQUADRE (Per testare il check del database)
-- =========================================================================

INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(1, NULL, '2026-05-10 21:00:00', '2026-05-10 21:30:00', 'Realtime'), -- Partita 15 (Squadra 1 vs Squadra 2 - Calciobalilla)
(1, NULL, '2026-05-12 21:00:00', '2026-05-12 21:45:00', 'Sincronizzata_Offline'), -- Partita 16 (Squadra 1 vs Squadra 3 - Calciobalilla)
(7, 4, '2026-04-12 15:00:00', '2026-04-12 16:30:00', 'Realtime'), -- Partita 17 (Bocce torneo: Squadra 4 vs Squadra 5)
(1, 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Realtime'), -- Partita 18 (Torneo Biliardino oggi)
(1, 1, CURRENT_TIMESTAMP, NULL, 'Realtime'); -- Partita 19 (IN CORSO ORA! Torneo Biliardino)

INSERT INTO Partecipa (partita_id, squadra_id, punteggio_finale, vittoria) VALUES
(15, 1, 9, true), (15, 2, 7, false),
(16, 1, 9, true), (16, 3, 5, false),
(17, 4, 13, true), (17, 5, 11, false),
(18, 1, 9, true), (18, 4, 2, false),
(19, 1, 5, false), (19, 2, 7, false); -- Partita in corso (vittoria ancora false per entrambe)

-- Altre partite individuali per variare i dati globali per gli altri utenti
INSERT INTO Partita (gioco_fisico_id, torneo_id, timestamp_inizio, timestamp_fine, stato_sync) VALUES
(3, NULL, '2026-06-01 10:00:00', '2026-06-01 10:30:00', 'Realtime'), -- Partita 20 (Calciobalilla)
(5, NULL, '2026-06-01 11:00:00', '2026-06-01 11:15:00', 'Realtime'); -- Partita 21 (Bocce)

INSERT INTO Partecipa (partita_id, giocatore_id, punteggio_finale, vittoria) VALUES
(20, 6, 9, true), (20, 7, 4, false),
(21, 8, 13, true), (21, 9, 9, false);


-- =========================================================================
-- 12. EVENTI IOT (Dati fisici finti per dare l'effetto real-time)
-- =========================================================================

INSERT INTO Evento_iot (partita_id, timestamp_evento, valore) VALUES
(15, '2026-05-10 21:05:12', 'Goal: Squadra 1'),
(15, '2026-05-10 21:07:34', 'Goal: Squadra 2'),
(15, '2026-05-10 21:10:05', 'Fallo: Rullata Squadra 2'),
(15, '2026-05-10 21:12:00', 'Goal: Squadra 1'),
(17, '2026-04-12 15:15:00', 'Accosto misurato: 15cm'),
(17, '2026-04-12 15:30:00', 'Bocciata a bersaglio'),
(19, CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'Goal: Squadra 2'),
(19, CURRENT_TIMESTAMP - INTERVAL '2 minutes', 'Goal: Squadra 1'),
(19, CURRENT_TIMESTAMP, 'Palla in centro');