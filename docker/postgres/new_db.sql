-- ==========================================
-- CREAZIONE TIPI ENUM
-- ==========================================

CREATE TYPE sesso_tipo          AS ENUM ('Maschio', 'Femmina', 'Altro');
CREATE TYPE ruolo_tipo          AS ENUM ('Giocatore', 'Gestore', 'AdminGioco', 'AdminPiattaforma');
CREATE TYPE accesso_tipo        AS ENUM ('Luogo pubblico', 'Luogo privato');
CREATE TYPE stato_tipo          AS ENUM ('Online', 'Offline');
CREATE TYPE modalita_gioco_tipo AS ENUM ('Individuale', 'Squadre');
CREATE TYPE stato_sync_tipo     AS ENUM ('Realtime', 'Sincronizzata_Offline');


-- ==========================================
-- CREAZIONE TABELLE (DDL)
-- ==========================================

-- 1. Utente
CREATE TABLE Utente (
                        id_utente      SERIAL       PRIMARY KEY,
                        username       VARCHAR(50)  NOT NULL UNIQUE,
                        email          VARCHAR(100) NOT NULL UNIQUE,
                        password       VARCHAR      NOT NULL,
                        ruolo          ruolo_tipo   NOT NULL,
                        sesso          sesso_tipo   NOT NULL,
                        oauth_provider VARCHAR(50)
);

-- 2. Tipologia del gioco
CREATE TABLE Tipologia_gioco (
                                 id_tipologia_gioco  SERIAL       PRIMARY KEY,
                                 nome_tipologia_gioco VARCHAR(100) NOT NULL,
                                 descrizione         VARCHAR(250) NOT NULL,
                                 regole              VARCHAR(300) NOT NULL,
                                 admin_creatore_id   INT,
                                 FOREIGN KEY (admin_creatore_id) REFERENCES Utente (id_utente)
                                     ON UPDATE CASCADE
                                     ON DELETE SET NULL
);

-- 3. Squadra
-- FIX: rimossa la doppia dichiarazione PRIMARY KEY (era un errore sintattico).
-- La PK è ora composta (id_squadra, id_utente) per supportare squadre
-- con più membri: filtrando per id_squadra si ottengono tutti i componenti.
CREATE TABLE Squadra (
                         id_squadra          SERIAL      NOT NULL,
                         nome_squadra        VARCHAR(100) NOT NULL UNIQUE,
                         id_utente           INT         NOT NULL,
                         id_tipologia_gioco  INT         NOT NULL,
                         PRIMARY KEY (id_squadra, id_utente),
                         FOREIGN KEY (id_utente)          REFERENCES Utente (id_utente)
                             ON UPDATE CASCADE
                             ON DELETE CASCADE,
                         FOREIGN KEY (id_tipologia_gioco) REFERENCES Tipologia_gioco (id_tipologia_gioco)
                             ON UPDATE CASCADE
                             ON DELETE RESTRICT
);

-- 4. Locale
CREATE TABLE Locale (
                        id_locale  SERIAL       PRIMARY KEY,
                        nome       VARCHAR(100) NOT NULL,
                        indirizzo  VARCHAR(255) NOT NULL,
                        accesso    accesso_tipo NOT NULL,
                        gestore_id INT          NOT NULL,
                        FOREIGN KEY (gestore_id) REFERENCES Utente (id_utente)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT
);

-- 5. Componente edge
CREATE TABLE Componente_edge (
                                 id_componente_edge SERIAL      PRIMARY KEY,
                                 address            VARCHAR(17) NOT NULL UNIQUE,  -- MAC address (xx:xx:xx:xx:xx:xx)
                                 locale_id          INT         NOT NULL,
                                 stato              stato_tipo  NOT NULL DEFAULT 'Offline',
                                 FOREIGN KEY (locale_id) REFERENCES Locale (id_locale)
                                     ON UPDATE CASCADE
                                     ON DELETE CASCADE
);

-- 6. Gioco fisico
CREATE TABLE Gioco_fisico (
                              id_gioco_fisico    SERIAL PRIMARY KEY,
                              tipologia_gioco_id INT    NOT NULL,
                              locale_id          INT    NOT NULL,
                              edge_id            INT    NOT NULL,
                              FOREIGN KEY (tipologia_gioco_id) REFERENCES Tipologia_gioco (id_tipologia_gioco)
                                  ON UPDATE CASCADE
                                  ON DELETE RESTRICT,
                              FOREIGN KEY (locale_id) REFERENCES Locale (id_locale)
                                  ON UPDATE CASCADE
                                  ON DELETE CASCADE,
                              FOREIGN KEY (edge_id)   REFERENCES Componente_edge (id_componente_edge)
                                  ON UPDATE CASCADE
                                  ON DELETE RESTRICT
);

-- 7. Torneo
-- FIX: classifica cambiata da VARCHAR(500) a JSONB per gestire strutture
-- di classifica arbitrarie (posizioni, punteggi, squadre/giocatori) in modo
-- flessibile e interrogabile con operatori JSON nativi di PostgreSQL.
CREATE TABLE Torneo (
                        id_torneo          SERIAL             PRIMARY KEY,
                        nome_torneo        VARCHAR(100)       NOT NULL,
                        modalita           modalita_gioco_tipo NOT NULL,
                        regole_del_torneo  VARCHAR(300)       NOT NULL,
                        classifica         JSONB,
                        tipologia_gioco_id INT                NOT NULL,
                        data_inizio        DATE               NOT NULL,
                        data_fine          DATE,
                        CONSTRAINT chk_date_torneo CHECK (data_fine IS NULL OR data_fine >= data_inizio),
                        FOREIGN KEY (tipologia_gioco_id) REFERENCES Tipologia_gioco (id_tipologia_gioco)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT
);

-- 8. Collegamento torneo ↔ locale (N:M)
CREATE TABLE Torneo_locale (
                               id_torneo INT NOT NULL,
                               id_locale INT NOT NULL,
                               PRIMARY KEY (id_torneo, id_locale),
                               FOREIGN KEY (id_torneo) REFERENCES Torneo (id_torneo)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
                               FOREIGN KEY (id_locale) REFERENCES Locale (id_locale)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE
);

-- 9. Partita
CREATE TABLE Partita (
                         id_partita      SERIAL          PRIMARY KEY,
                         gioco_fisico_id INT             NOT NULL,
                         torneo_id       INT,
                         timestamp_inizio TIMESTAMP      NOT NULL,
                         timestamp_fine   TIMESTAMP,
                         stato_sync      stato_sync_tipo NOT NULL DEFAULT 'Realtime',
                         CONSTRAINT chk_timestamp_partita
                             CHECK (timestamp_fine IS NULL OR timestamp_fine > timestamp_inizio),
                         FOREIGN KEY (gioco_fisico_id) REFERENCES Gioco_fisico (id_gioco_fisico)
                             ON UPDATE CASCADE
                             ON DELETE RESTRICT,
                         FOREIGN KEY (torneo_id) REFERENCES Torneo (id_torneo)
                             ON UPDATE CASCADE
                             ON DELETE SET NULL
);

-- 10. Partecipa
-- FIX: la CHECK garantisce XOR tra giocatore_id e squadra_id.
-- Nota: quando squadra_id è valorizzato, l'id_squadra usato deve corrispondere
-- al primo campo della PK composta di Squadra; la FK punta a id_squadra tramite
-- un indice univoco (aggiunto sotto).
CREATE TABLE Partecipa (
                           id_partecipa    SERIAL  PRIMARY KEY,
                           partita_id      INT     NOT NULL,
                           giocatore_id    INT,
                           squadra_id      INT,
                           punteggio_finale INT    NOT NULL DEFAULT 0,
                           vittoria        BOOLEAN NOT NULL DEFAULT FALSE,
                           CONSTRAINT chk_partecipante
                               CHECK (
                                   (giocatore_id IS NOT NULL AND squadra_id IS NULL) OR
                                   (giocatore_id IS NULL     AND squadra_id IS NOT NULL)
                                   ),
                           FOREIGN KEY (partita_id)   REFERENCES Partita (id_partita)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE,
                           FOREIGN KEY (giocatore_id) REFERENCES Utente (id_utente)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE,
                           FOREIGN KEY (squadra_id)   REFERENCES Squadra (id_squadra)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE
);

-- Indice univoco necessario per la FK di Partecipa → Squadra.id_squadra
-- (la PK di Squadra è composta, PostgreSQL richiede un indice univoco
--  sulla singola colonna per usarla come target di FK).
CREATE UNIQUE INDEX uq_squadra_id ON Squadra (id_squadra);


-- ==========================================
-- VISTE
-- ==========================================

-- 1. Storico partite (per singolo giocatore)
CREATE OR REPLACE VIEW storico_partita AS
SELECT
    p.id_partecipa               AS id,
    p.giocatore_id               AS utente_id,
    pa.gioco_fisico_id           AS gioco_id,
    pa.timestamp_inizio          AS data_partita,
    p.punteggio_finale           AS punteggio_ottenuto
FROM Partecipa p
         JOIN Partita pa ON p.partita_id = pa.id_partita
WHERE p.giocatore_id IS NOT NULL;


-- 2. Statistiche utente (aggregato real-time)
CREATE OR REPLACE VIEW statistica_utente AS
SELECT
    p.giocatore_id                           AS id,
    p.giocatore_id                           AS utente_id,
    COUNT(p.id_partecipa)                    AS partite_giocate,
    SUM(CASE WHEN p.vittoria THEN 1 ELSE 0 END) AS vittorie,
    SUM(p.punteggio_finale)                  AS punteggio_totale,

    -- Locale dell'ultima partita giocata
    (SELECT CAST(gf.locale_id AS VARCHAR)
     FROM Partita pa2
              JOIN Gioco_fisico gf ON pa2.gioco_fisico_id = gf.id_gioco_fisico
              JOIN Partecipa p2    ON p2.partita_id = pa2.id_partita
     WHERE p2.giocatore_id = p.giocatore_id
     ORDER BY pa2.timestamp_inizio DESC
        LIMIT 1) AS id_locale,

    -- Tipologia dell'ultimo gioco usato
    (SELECT tg.nome_tipologia_gioco
     FROM Partita pa2
     JOIN Gioco_fisico gf  ON pa2.gioco_fisico_id = gf.id_gioco_fisico
     JOIN Tipologia_gioco tg ON gf.tipologia_gioco_id = tg.id_tipologia_gioco
     JOIN Partecipa p2      ON p2.partita_id = pa2.id_partita
     WHERE p2.giocatore_id = p.giocatore_id
     ORDER BY pa2.timestamp_inizio DESC
     LIMIT 1) AS nome_gioco

FROM Partecipa p
WHERE p.giocatore_id IS NOT NULL
GROUP BY p.giocatore_id;
