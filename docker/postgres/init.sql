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

-- 1. Utente
create table Utente(
    id_utente serial primary key,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password varchar not null,
    ruolo ruolo_tipo not null,
    sesso sesso_tipo not null,
    oauth_provider varchar(50)
);

-- 2. Tipologia del gioco
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

-- 3. Squadra
create table Squadra(
    id_squadra serial primary key,
    nome_squadra varchar(100) not null unique,
    id_tipologia_gioco INT,
    foreign key(id_tipologia_gioco) references Tipologia_gioco(id_tipologia_gioco)
);

-- 4. Membro della squadra
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

-- 5. Locale
create table Locale(
    id_locale serial primary key,
    nome varchar(100) not null,
    indirizzo varchar(255) not null,
    accesso accesso_tipo not null,
    -- host_broker varchar default 'tcp://broker:1883',
    host_broker varchar default 'tcp://playnode-mosquitto:1883',
    edge_api_token varchar(64),
    edge_password varchar(255),
    gestore_id int not null,
    foreign key(gestore_id) references Utente(id_utente)
        on update cascade
        on delete restrict
);

-- 6. Componente Edge
create table Componente_edge(
    id_componente_edge serial primary key,
    address varchar(17) not null unique,
    locale_id int not null,
    stato stato_tipo default 'Offline',
    ultimo_heartbeat timestamp,
    foreign key(locale_id) references Locale(id_locale)
        on update cascade
        on delete cascade
);

-- 7. Gioco fisico
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

-- 8. Sensore IoT
create table Sensore(
    id_sensore serial primary key,
    gioco_fisico_id int not null,
    tipo varchar(50) not null,
    posizione varchar(100) not null,
    attivo boolean not null default true,
    foreign key(gioco_fisico_id) references Gioco_fisico(id_gioco_fisico)
        on update cascade
        on delete cascade
);

-- 9. Torneo
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

-- 10. Collegamento torneo e locale
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

-- 10b. Iscrizione giocatori a torneo
create table Iscrizione_torneo(
    id_torneo int not null,
    id_utente int not null,
    data_iscrizione timestamp not null default now(),
    primary key(id_torneo, id_utente),
    foreign key(id_torneo) references Torneo(id_torneo)
        on update cascade
        on delete cascade,
    foreign key(id_utente) references Utente(id_utente)
        on update cascade
        on delete cascade
);

-- 11. Partita
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

-- 11b. Incontri tabellone torneo
create table Incontro_torneo(
    id_incontro serial primary key,
    id_torneo int not null,
    round_num int not null,
    slot_num int not null,
    giocatore1_id int,
    giocatore2_id int,
    vincitore_id int,
    id_partita int,
    unique(id_torneo, round_num, slot_num),
    foreign key(id_torneo) references Torneo(id_torneo)
        on update cascade
        on delete cascade,
    foreign key(giocatore1_id) references Utente(id_utente)
        on update cascade
        on delete set null,
    foreign key(giocatore2_id) references Utente(id_utente)
        on update cascade
        on delete set null,
    foreign key(vincitore_id) references Utente(id_utente)
        on update cascade
        on delete set null,
    foreign key(id_partita) references Partita(id_partita)
        on update cascade
        on delete set null
);

-- 12. Partecipa
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

-- 13. Evento Iot
create table Evento_iot(
    id_evento serial primary key,
    partita_id int not null,
    sensore_id int,
    timestamp_evento timestamp not null,
    valore varchar(50) not null,
    foreign key(partita_id) references Partita(id_partita)
        on update cascade
        on delete cascade,
    foreign key(sensore_id) references Sensore(id_sensore)
        on update cascade
        on delete set null
);

-- 14. Tentativi login (brute-force protection persistente)
create table login_attempt(
    client_ip varchar(45) primary key,
    attempt_count int not null default 0,
    last_attempt timestamp not null default now(),
    block_until timestamp
);

-- 15. Outbox MQTT (Transactional Outbox per comandi Edge)
create table mqtt_outbox(
    id_outbox serial primary key,
    tipo varchar(50) not null,
    topic varchar(255) not null,
    payload text not null,
    broker_url varchar(255) not null,
    id_partita int,
    stato varchar(20) not null default 'PENDING',
    tentativi int not null default 0,
    created_at timestamp not null default now(),
    processed_at timestamp,
    error_message varchar(500),
    foreign key(id_partita) references Partita(id_partita)
        on update cascade
        on delete set null
);

-- ==========================================
-- CREAZIONE VISTE
-- ==========================================

-- 1. Vista per lo Storico Partite
-- Estrapola dinamicamente i dati ogni volta che viene richiesta
CREATE OR REPLACE VIEW storico_partita AS
SELECT 
    p.id_partecipa AS id,
    p.giocatore_id AS utente_id,
    pa.gioco_fisico_id AS gioco_id,
    pa.timestamp_inizio AS data_partita,
    p.punteggio_finale AS punteggio_ottenuto
FROM Partecipa p
JOIN Partita pa ON p.partita_id = pa.id_partita
WHERE p.giocatore_id IS NOT NULL;


-- 2. Vista per le Statistiche Utente
-- Aggrega in tempo reale tutte le partecipazioni calcolando il totale
CREATE OR REPLACE VIEW statistica_utente AS
SELECT 
    p.giocatore_id AS id, 
    p.giocatore_id AS utente_id,
    COUNT(p.id_partecipa) AS partite_giocate,
    SUM(CASE WHEN p.vittoria THEN 1 ELSE 0 END) AS vittorie,
    SUM(p.punteggio_finale) AS punteggio_totale,
    
    -- Subquery per recuperare l'ID del locale dell'ultima partita giocata
    (SELECT CAST(gf.locale_id AS VARCHAR) 
     FROM Partita pa2 
     JOIN Gioco_fisico gf ON pa2.gioco_fisico_id = gf.id_gioco_fisico 
     JOIN Partecipa p2 ON p2.partita_id = pa2.id_partita 
     WHERE p2.giocatore_id = p.giocatore_id 
     ORDER BY pa2.timestamp_inizio DESC LIMIT 1) AS id_locale,
     
    -- Subquery per recuperare il nome dell'ultimo gioco utilizzato
    (SELECT tg.nome_tipologia_gioco 
     FROM Partita pa2 
     JOIN Gioco_fisico gf ON pa2.gioco_fisico_id = gf.id_gioco_fisico 
     JOIN Tipologia_gioco tg ON gf.tipologia_gioco_id = tg.id_tipologia_gioco
     JOIN Partecipa p2 ON p2.partita_id = pa2.id_partita 
     WHERE p2.giocatore_id = p.giocatore_id 
     ORDER BY pa2.timestamp_inizio DESC LIMIT 1) AS nome_gioco
     
FROM Partecipa p
WHERE p.giocatore_id IS NOT NULL
GROUP BY p.giocatore_id;