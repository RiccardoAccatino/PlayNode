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