# PlayNode

PlayNode è una piattaforma per la gestione di partite e tornei connessa a servizi backend Java/Spring Boot, un frontend web statico e componenti IoT/MQTT per la raccolta degli eventi di gioco.

Il progetto include:
- servizi backend per autenticazione, gioco, statistiche e tornei;
- un frontend web per l'interfaccia utente;
- un'infrastruttura Docker con PostgreSQL e Mosquitto;
- componenti edge (RaspBerry) e simulatori per i dispositivi IoT (Arduino/Raspberry).

## Installazione

### Prerequisiti
- Java JDK 11+
- Docker e Docker Compose
- Maven opzionale: ogni servizio backend include il wrapper `mvnw`/`mvnw.cmd`

### 1. Clona il progetto
```bash
git clone <URL_DELLA_REPO>
cd PlayNode
```

### 2. Configura le variabili d'ambiente
Copia il file `.env.example` in `.env` e compila i valori richiesti:

```bash
cp .env.example .env
```

Le variabili principali riguardano:
- database PostgreSQL (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`)
- MQTT/Mosquitto (`MQTT_PORT`, `MQTT_WS_PORT`, `MQTT_USER`, `MQTT_PASSWORD`)
- JWT (`JWT_SECRET`, `JWT_EXPIRATION`)
- CORS (`CORS_ALLOWED_ORIGINS`)

### 3. Avvia l'infrastruttura base
Da root progetto avvia PostgreSQL e Mosquitto con Docker:

```bash
docker-compose --env-file .env -f docker/docker-compose.yml up -d
```

Se vuoi ripartire da zero:

```bash
docker-compose --env-file .env -f docker/docker-compose.yml down -v
docker-compose --env-file .env -f docker/docker-compose.yml up -d
```

## Configurazione iniziale

Prima di avviare i servizi verifica che:
- il file `.env` sia presente nella root del progetto;
- il database sia raggiungibile sul servizio Docker `playnode_postgres`;
- il broker MQTT sia attivo su `playnode-mosquitto`;
- la `JWT_SECRET` sia valorizzata con una chiave sicura e sufficientemente lunga.

I servizi backend leggono le proprietà da `src/main/resources/application.properties` e usano, per default, queste porte:
- Auth Service: `8081`
- Game Service: `8080`
- Stats Service: `8082`
- Tournament Service: `8083`

## Guida all'avvio

Per accedere alla Piattaforma Dopo aver avviato l'Infrastruttura Basta solamente accedere alla porta messa a disposizione dal Docker:

```bash
localhost:63342
```
## Manuale utente

### Accesso e uso base
1. Avvia l'infrastruttura Docker.
2. Avvia i servizi backend.
3. Apri il frontend nel browser.
4. Accedi con un utente valido.
5. Naviga tra le sezioni disponibili per consultare partite, statistiche e tornei.

### Schermo gioco
La vista `frontend/ui-locale/` è pensata per la visualizzazione in tempo reale della partita. Mostra punteggio, stato connessione, timer e aggiornamenti provenienti dal backend e dai dispositivi IoT.

### Funzionalità principali
- login e gestione sessione JWT;
- consultazione dati di gioco e tornei;
- visualizzazione statistiche;
- aggiornamento eventi in tempo reale via MQTT;
- interfaccia dedicata allo schermo di gioco.
