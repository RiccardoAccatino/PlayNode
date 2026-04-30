-- ==========================================
-- CREAZIONE TABELLE (DDL)
-- ==========================================


-- tipi enum
create type sesso_tipo as enum ('Maschio','Femmina','Altro');
create type ruolo_tipo as enum ('Giocatore', 'Gestore', 'AdminGioco', 'AdminPiattaforma');
create type accesso_tipo as enum ('Luogo pubblico', 'Luogo privato');
create type stato_tipo as enum ('Online', 'Offline');
create type modalita_gioco_tipo as enum ('Individuale', 'Squadre');
create type stato_sync_tipo as enum ('Realtime', 'Sincronizzata_Offline');

-- Utente
create table Utente(
    id_utente serial primary key,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password varchar not null,
    ruolo ruolo_tipo not null,
    sesso sesso_tipo not null,
    oauth_provider varchar(50)
);

-- Squadra
create table Squadra(
    id_squadra serial primary key,
    nome_squadra varchar(100) not null unique
);

--Membro della squadra
create table Membro_squadra(
    id_utente int,
    id_squadra int,
    primary key(id_utente, id_squadra),
    foreign key(id_utente) references Utente(id_utente)
        on update cascade
        on delete cascade,
    foreign key(id_squadra) references Squadra(id_squadra)
        on update cascade
        on delete cascade
);

-- Tipologia del gioco
create table Tipologia_gioco(
    id_tipologia_gioco serial primary key,
    nome_tipologia_gioco varchar(100) not null,
    descrizione varchar(250) not null,
    regole varchar(300) not null,
    admin_creatore_id int,
    foreign key(admin_creatore_id) references Utente(id_utente)
        on update cascade
        on delete set null
);

-- Locale dove si possono trovare i giochi fisici
create table Locale(
    id_locale serial primary key,
    nome varchar(100) not null,
    indirizzo varchar(255) not null,
    accesso accesso_tipo not null,
    gestore_id int not null,
    foreign key(gestore_id) references Utente(id_utente)
        on update cascade
        on delete restrict
);

-- Componente Edge
create table Componente_edge(
    id_componente_edge serial primary key,
    address varchar(17) not null unique,
    locale_id int not null,
    stato stato_tipo default 'Offline',
    foreign key(locale_id) references Locale(id_locale)
        on update cascade
        on delete cascade
);

-- Gioco fisico
create table Gioco_fisico(
    id_gioco_fisico serial primary key,
    tipologia_gioco_id int not null,
    locale_id int not null,
    edge_id int not null,
    foreign key(tipologia_gioco_id) references Tipologia_gioco(id_tipologia_gioco)
        on update cascade
        on delete restrict,
    foreign key(locale_id) references Locale(id_locale)
        on update cascade
        on delete cascade,
    foreign key(edge_id) references Componente_edge(id_componente_edge)
        on update cascade
        on delete restrict
);

-- Torneo
create table Torneo(
    id_torneo serial primary key,
    nome_torneo varchar(100) not null,
    modalita modalita_gioco_tipo not null,
    regole_del_torneo varchar(300) not null,
    classifica varchar(500),
    tipologia_gioco_id int not null,
    data_inizio Date not null,
    data_fine Date,
    foreign key(tipologia_gioco_id) references Tipologia_gioco(id_tipologia_gioco)
        on update cascade
        on delete restrict
);

-- Collegamento torneo e locale
create table Torneo_locale(
    id_torneo int,
    id_locale int,
    primary key(id_torneo, id_locale),
    foreign key(id_torneo) references Torneo(id_torneo)
        on update cascade
        on delete cascade,
    foreign key(id_locale) references Locale(id_locale)
        on update cascade
        on delete cascade
);

-- Partita
create table Partita(
    id_partita serial primary key,
    gioco_fisico_id int not null,
    torneo_id int,
    timestamp_inizio timestamp not null,
    timestamp_fine timestamp,
    stato_sync stato_sync_tipo not null default 'Realtime',
    check (timestamp_fine IS NULL OR timestamp_fine > timestamp_inizio),
    foreign key(gioco_fisico_id) references Gioco_fisico(id_gioco_fisico)
        on update cascade
        on delete restrict,
    foreign key(torneo_id) references Torneo(id_torneo)
        on update cascade
        on delete set null
);

-- Collegamneto tra giocatore, squadra e partita
create table Partecipa(
    id_partecipa serial primary key,
    partita_id int not null,
    giocatore_id int,
    squadra_id int,
    punteggio_finale int default 0,
    vittoria boolean default false,
    check ((giocatore_id is not null and squadra_id is null) or (giocatore_id is null and squadra_id is not null)),
    foreign key(partita_id) references Partita(id_partita)
        on update cascade
        on delete cascade,
    foreign key(giocatore_id) references Utente(id_utente)
        on update cascade
        on delete cascade,
    foreign key(squadra_id) references Squadra(id_squadra)
        on update cascade
        on delete cascade
);

-- Evento Iot: salvataggio dei dati fisici
create table Evento_iot(
    id_evento serial primary key,
    partita_id int not null,
    timestamp_evento timestamp not null,
    valore varchar(50) not null,
    foreign key(partita_id) references Partita(id_partita)
        on update cascade
        on delete cascade
);

-- ==========================================
-- INSERIMENTO DATI DI PROVA (DMLPOP)
-- ==========================================

-- 1. UTENTI (1 Admin Piattaforma, 1 Admin Gioco, 2 Gestori, 6 Giocatori)
INSERT INTO Utente (username, email, password, ruolo, sesso) VALUES
    ('francesco_admin', 'francesco.dappiano@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'AdminPiattaforma', 'Maschio'),
    ('riccardo_gameadmin', 'riccardo.accatino@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'AdminGioco', 'Maschio'),
    ('mario_gestore', 'mario.rossi@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Gestore', 'Maschio'),
    ('luigi_gestore', 'luigi.verdi@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Gestore', 'Maschio'),
    ('angie_player', 'angie.albitres@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Femmina'),
    ('lisa_player', 'lisa.bianchi@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Femmina'),
    ('giulio_player', 'giulio.neri@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Maschio'),
    ('sara_player', 'sara.gialli@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Femmina'),
    ('marco_player', 'marco.blu@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Maschio'),
    ('elena_player', 'elena.viola@gmail.com', '$2a$12$GzsQcQNydjX0HBoMdYjaiuTeRoMW1.mgAM5HNCcB89CjCeSxnB3nS', 'Giocatore', 'Femmina');

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