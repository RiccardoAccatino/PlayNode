# Progetto_pissir
# PlayNode — Istruzioni di avvio (IntelliJ & Visual Studio Code)

Questa sezione contiene tutte le configurazioni e i comandi per avviare l'intera applicazione in ambiente di sviluppo sia con **IntelliJ IDEA** sia con **Visual Studio Code** (VS Code). Leggere i prerequisiti e seguire gli step nell'ordine indicato. La guida Git originale è preservata sotto questa sezione.

---

**Prerequisiti**
- Java JDK 11 o superiore installato (impostare `JAVA_HOME`).
- Maven (opzionale, i singoli servizi includono `mvnw`/`mvnw.cmd`).
- Node.js (v14+) e `npm` se si vuole servire il frontend con strumenti Node.
- Docker e Docker Compose per DB e broker MQTT locali.
- IntelliJ IDEA (consigliata Ultimate per Spring) o Visual Studio Code con estensioni Java.

**Servizi principali nella repo**
- Backend: `backend/auth-service`, `backend/game-service`, `backend/stats-service`, `backend/tournament-service` (servizi Maven/Java).
- Frontend: la cartella `frontend` contiene le risorse web statiche.
- Infrastruttura docker: `docker/docker-compose.yml`, `docker/postgres/init.sql`, `docker/mosquitto`.

---

## Avvio rapido con Docker (raccomandato per DB/MQTT)
1. Aprire una console nella root del progetto e avviare i servizi docker:

```powershell
# USARE QUESTO COMANDO non quello di base se no non legge il .env
# Se il file .env è nella root del progetto, eseguire dalla root specificando l'env-file:
docker-compose --env-file .env -f docker/docker-compose.yml up -d

```

2. Verificare che Postgres e Mosquitto siano attivi (controllare i log o `docker ps`). Se necessario, gli script di inizializzazione DB sono in `docker/postgres/init.sql` e `docker/postgres/populate.sql`.

---

## Avvio dei servizi Java
Note: ogni servizio backend è un progetto Maven separato con wrapper (`mvnw`/`mvnw.cmd`) nella sua cartella.

Opzione A — IntelliJ IDEA
- Aprire IntelliJ IDEA e scegliere `Open` → selezionare la cartella `c:\Users\angie\IdeaProjects\PlayNode` oppure aprire singolarmente `backend/<service>` se preferite progetti separati.
- IntelliJ rileverà i progetti Maven; attendere l'import.
- Per ogni servizio (es. `auth-service`):
  - Creare una Run Configuration di tipo Maven o Application. Metodo semplice: usare la configurazione Maven con goal `spring-boot:run` (se è Spring Boot) o usare `mvnw spring-boot:run` in terminal.
  - Per eseguire dalla GUI: `Run` → `Edit Configurations` → `+` → `Maven` → `Working directory`: la cartella del servizio (es. `backend/auth-service`) → `Command line`: `spring-boot:run`.
- Avviare più servizi in parallelo aprendo più configurazioni.

Opzione B — Visual Studio Code
- Installare le estensioni: `Language Support for Java(TM) by Red Hat`, `Debugger for Java`, `Maven for Java`.
- Aprire la cartella root del progetto in VS Code.
- Aprire un terminale integrato e per ciascun servizio eseguire (Windows PowerShell):

```powershell
cd backend\auth-service
.\mvnw.cmd spring-boot:run

cd ..\game-service
.\mvnw.cmd spring-boot:run

# ripetere per stats-service e tournament-service
```

- In alternativa, creare task `tasks.json` o configurazioni di debug (launch.json) per eseguire `mvnw spring-boot:run` per ogni servizio.

Note sulla porta e configurazioni: i singoli servizi leggono le proprietà da `src/main/resources/application.properties` o da variabili d'ambiente. Se necessario, modificare le porte o i parametri prima dell'avvio.

---

## Avvio del Frontend
Il frontend è una raccolta di file statici in `frontend` e `frontend/views`.

Opzione semplice (senza installare nulla): aprire `frontend/index.html` nel browser.

Opzione via server statico (consigliato per evitare problemi CORS):

```bash
# con Node (npx)
cd frontend
npx http-server -p 8080

# oppure con Python
cd frontend
python -m http.server 8080
```

Visitate `http://localhost:8080` (o la porta scelta).

---

## Altri componenti locali
- `edge-component`/`mqtt-client`/`iot-devices/python-simulators`: sono script Python/firmware per simulare dispositivi IoT. Seguire le istruzioni nelle rispettive cartelle per eseguire gli script (es. `python BocceCode.py`).

---

## Debug e suggerimenti
- Se usate IntelliJ, aggiungere breakpoints e avviare le applicazioni in modalità `Debug` dalle configurazioni Maven o Application.
- Per VS Code potete creare `launch.json` che esegue il comando Maven e si collega al debugger Java.
- Se i servizi non si connettono al DB, verificare che il servizio Postgres nel docker-compose sia pronto e che le variabili di connessione (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`) corrispondano a quelle usate dalle applicazioni.

---

Se volete, posso generare esempi di `launch.json` e `tasks.json` per VS Code o fornire passaggi passo-passo per importare correttamente tutti i service come moduli Maven in IntelliJ.

---

# 🚀 Guida di Sopravvivenza a Git e GitHub per il Team

Benvenuti nel progetto! Se non avete mai usato Git o GitHub, non preoccupatevi: questa guida contiene tutti i comandi essenziali e i passaggi per collaborare al codice senza fare danni. 

---

## 🛠️ 1. Configurazione Iniziale (Da fare solo la prima volta)

Prima di iniziare a lavorare, dovete scaricare una copia del progetto sul vostro computer.

1. Aprite il terminale.
2. Spostatevi nella cartella in cui volete salvare il progetto (es. `cd Documenti/Progetti`).
3. Eseguite il comando di clonazione:
   ```bash
   git clone <INSERIRE_QUI_URL_DELLA_REPO>
   ```
4. Entrate nella cartella appena creata:
   ```bash
   cd <NOME_DELLA_CARTELLA>
   ```

---
## 🌱 2. Lavorare con i Branch (Le "Ramificazioni")

**Regola d'oro:** Non lavorate mai direttamente sul branch `main`. Create sempre un vostro "ramo" separato per le nuove funzionalità o per le correzioni.

* **Vedere in quale branch vi trovate:**
    ```bash
    git status
    ```
* **Creare un nuovo branch e spostarsi lì per lavorare:**
    ```bash
    git switch -c nome-del-tuo-branch
    ```
    *(Consiglio: usate nomi descrittivi, es. `aggiunta-login` o `fix-errore-homepage`)*
* **Spostarsi su un branch già esistente:**
    ```bash
    git switch nome-del-branch
    ```

---

## 🔄 3. Il Flusso di Lavoro Quotidiano (Salvare e Condividere)

Avete scritto del codice nel vostro branch e volete salvarlo. Ecco i 3 passaggi fondamentali:

**Passo 1: Aggiungere le modifiche "al carrello" (Staging)**
Per preparare tutti i file modificati per il salvataggio:
```bash
git add .
```
*(Se volete aggiungere un solo file specifico: `git add nome-del-file.ext`)*

**Passo 2: "Imballare" le modifiche (Commit)**
Salvate le modifiche con un messaggio chiaro che spieghi cosa avete fatto:
```bash
git commit -m "Descrizione chiara di cosa è stato modificato o aggiunto"
```

**Passo 3: Inviare tutto su GitHub (Push)**
Per caricare il vostro lavoro online e renderlo visibile al team:
```bash
git push origin nome-del-tuo-branch
```

---

## ⬇️ 4. Aggiornare il proprio lavoro

Mentre voi lavorate, altri potrebbero aver aggiornato il progetto. È fondamentale scaricare queste novità regolarmente per evitare conflitti.

* **Per scaricare le ultime modifiche dal server:**
    ```bash
    git pull origin main
    ```
    *(Nota: fatelo spesso, specialmente prima di iniziare a scrivere nuovo codice).* 

---

## 🆘 5. Comandi di Emergenza

* **Voglio annullare le modifiche a un file non ancora aggiunto (prima del `git add`):**
    ```bash
    git restore nome-del-file.ext
    ```
* **Ho fatto un casino e voglio tornare alla situazione esatta dell'ultimo salvataggio:**
    ```bash
    git restore .
    ```
* **Voglio vedere lo storico di chi ha fatto cosa:**
    ```bash
    git log
    ```

---

## 💡 Riepilogo del ciclo di vita di una modifica
1. `git pull origin main` (Mi aggiorno)
2. `git switch -c mia-nuova-feature` (Creo il mio spazio di lavoro)
3. *...scrivo il codice...*
4. `git add .` (Preparo il salvataggio)
5. `git commit -m "Aggiunta nuova feature"` (Salvo in locale)
6. `git push origin mia-nuova-feature` (Mando su GitHub)
7. *Andare su GitHub e aprire una Pull Request!*

# 🚀 Guida di Sopravvivenza a Git e GitHub per il Team

Benvenuti nel progetto! Se non avete mai usato Git o GitHub, non preoccupatevi: questa guida contiene tutti i comandi essenziali e i passaggi per collaborare al codice senza fare danni. 

---

## 🛠️ 1. Configurazione Iniziale (Da fare solo la prima volta)

Prima di iniziare a lavorare, dovete scaricare una copia del progetto sul vostro computer.

1. Aprite il terminale.
2. Spostatevi nella cartella in cui volete salvare il progetto (es. `cd Documenti/Progetti`).
3. Eseguite il comando di clonazione:
   ```bash
   git clone <INSERIRE_QUI_URL_DELLA_REPO>
   ```
4. Entrate nella cartella appena creata:
   ```bash
   cd <NOME_DELLA_CARTELLA>
   ```

---
## 🌱 2. Lavorare con i Branch (Le "Ramificazioni")

**Regola d'oro:** Non lavorate mai direttamente sul branch `main`. Create sempre un vostro "ramo" separato per le nuove funzionalità o per le correzioni.

* **Vedere in quale branch vi trovate:**
    ```bash
    git status
    ```
* **Creare un nuovo branch e spostarsi lì per lavorare:**
    ```bash
    git switch -c nome-del-tuo-branch
    ```
    *(Consiglio: usate nomi descrittivi, es. `aggiunta-login` o `fix-errore-homepage`)*
* **Spostarsi su un branch già esistente:**
    ```bash
    git switch nome-del-branch
    ```

---

## 🔄 3. Il Flusso di Lavoro Quotidiano (Salvare e Condividere)

Avete scritto del codice nel vostro branch e volete salvarlo. Ecco i 3 passaggi fondamentali:

**Passo 1: Aggiungere le modifiche "al carrello" (Staging)**
Per preparare tutti i file modificati per il salvataggio:
```bash
git add .
```
*(Se volete aggiungere un solo file specifico: `git add nome-del-file.ext`)*

**Passo 2: "Imballare" le modifiche (Commit)**
Salvate le modifiche con un messaggio chiaro che spieghi cosa avete fatto:
```bash
git commit -m "Descrizione chiara di cosa è stato modificato o aggiunto"
```

**Passo 3: Inviare tutto su GitHub (Push)**
Per caricare il vostro lavoro online e renderlo visibile al team:
```bash
git push origin nome-del-tuo-branch
```

---

## ⬇️ 4. Aggiornare il proprio lavoro

Mentre voi lavorate, altri potrebbero aver aggiornato il progetto. È fondamentale scaricare queste novità regolarmente per evitare conflitti.

* **Per scaricare le ultime modifiche dal server:**
    ```bash
    git pull origin main
    ```
    *(Nota: fatelo spesso, specialmente prima di iniziare a scrivere nuovo codice).*

---

## 🆘 5. Comandi di Emergenza

* **Voglio annullare le modifiche a un file non ancora aggiunto (prima del `git add`):**
    ```bash
    git restore nome-del-file.ext
    ```
* **Ho fatto un casino e voglio tornare alla situazione esatta dell'ultimo salvataggio:**
    ```bash
    git restore .
    ```
* **Voglio vedere lo storico di chi ha fatto cosa:**
    ```bash
    git log
    ```

---

## 💡 Riepilogo del ciclo di vita di una modifica
1. `git pull origin main` (Mi aggiorno)
2. `git switch -c mia-nuova-feature` (Creo il mio spazio di lavoro)
3. *...scrivo il codice...*
4. `git add .` (Preparo il salvataggio)
5. `git commit -m "Aggiunta nuova feature"` (Salvo in locale)
6. `git push origin mia-nuova-feature` (Mando su GitHub)
7. *Andare su GitHub e aprire una Pull Request!*
