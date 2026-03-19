# Progetto_pissir
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


Vuoi che aggiunga anche una sezione dedicata a come si crea e si gestisce una **Pull Request** direttamente dall'interfaccia web di GitHub, oppure preferisci mantenerlo incentrato solo sul terminale per ora?
