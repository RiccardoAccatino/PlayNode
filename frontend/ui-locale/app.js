// PlayNode - Schermo Gioco UI

const PlayNodeUI = (function () {
    // ==========================================
    // CONFIGURAZIONE
    // ==========================================
    const BASE_URL = 'http://localhost:8080';
    const POLLING_INTERVAL_MS = 2000; //Ogni 2 secondi chiede al backend gli eventi IoT della partita in corso

    // Valori costanti per i goal prodotti dall'Edge/Bridge IoT
    const GOAL_TEAM_1 = 'Goal: Squadra 1';
    const GOAL_TEAM_2 = 'Goal: Squadra 2';

    // Parametri di gioco passati via URL (es. ?idGioco=3&maxScore=9&showTimer=false).
    // showTimer=false è il default perché la maggior parte dei giochi del locale
    // (calciobalilla, bocce) finisce a punteggio, non a tempo.
    // Cambiano in base alla card schiacciata
    const urlParams = new URLSearchParams(window.location.search);
    let idGiocoInstallato = null;
    let maxScore = null;
    let showTimer = false;

    // Soglia per il flash "low-time" rosso (solo quando showTimer è true)
    const LOW_TIME_THRESHOLD = 30;

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    const state = {
        score1: 0,
        score2: 0,
        timerSeconds: 0,            // contatore cronometro (sale) o countdown (scende)
        timerDirection: 'up',       // 'up' = cronometro, 'down' = countdown
        status: 'In attesa di giocatori...',
        isConnected: false,
        timerInterval: null,
        pollingInterval: null,
        isDebugOpen: false,
        idPartitaCorrente: null,
        // Snapshot dell'ultimo polling: capisce se un punteggio è appena
        // aumentato e quindi va animata l'overlay del goal
        lastPolledScore1: 0,
        lastPolledScore2: 0
    };

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const DOM = {
        connBadge: document.getElementById('connection-status'),
        connText: document.querySelector('#connection-status .text'),
        statusTxt: document.getElementById('game-status'),
        timerDisplay: document.getElementById('timer'),
        timerWrapper: document.querySelector('.timer-wrapper'),
        score1: document.getElementById('score1'),
        score2: document.getElementById('score2'),
        logTxt: document.getElementById('log-text'),
        gameBoard: document.getElementById('game-elements'),
        goalOverlay: document.getElementById('goal-overlay'),
        debugToggle: document.getElementById('debug-toggle'),
        debugPanel: document.getElementById('debug-panel')
    };

    // ==========================================
    // CORE UI UPDATES
    // ==========================================
    function updateConnection(connected) {
        if (state.isConnected === connected) return; // idempotente, evita flicker
        state.isConnected = connected;
        DOM.connBadge.className = `connection-badge ${connected ? 'online' : 'offline'}`;
        DOM.connText.textContent = connected ? 'Edge Connesso' : 'Edge Irreperibile...';
    }

    function renderScore() {
        DOM.score1.textContent = state.score1;
        DOM.score2.textContent = state.score2;
    }

    function updateScoreDisplay(team) {
        renderScore();
        // Micro-interazione: Pop effect sul team che ha appena segnato
        const target = team === 1 ? DOM.score1 : DOM.score2;
        target.classList.remove('pop');
        void target.offsetWidth;
        target.classList.add('pop');
        setTimeout(() => target.classList.remove('pop'), 400);
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        DOM.timerDisplay.textContent = formatTime(state.timerSeconds);

        // Il flash rosso ha senso solo se il timer sta scendendo
        if (state.timerDirection === 'down' &&
            state.timerSeconds > 0 &&
            state.timerSeconds <= LOW_TIME_THRESHOLD) {
            DOM.timerDisplay.classList.add('low-time');
        } else {
            DOM.timerDisplay.classList.remove('low-time');
        }
    }

    function logEvent(msg) {
        DOM.logTxt.textContent = msg;
    }

    function switchMode(isWaiting) {
        DOM.statusTxt.textContent = state.status;
        if (isWaiting) {
            DOM.gameBoard.style.opacity = '0.3';
        } else {
            DOM.gameBoard.style.opacity = '1';
        }
    }

    // Nasconde il timer a livello DOM quando il gioco non usa il tempo
    function applyTimerVisibility() {
        if (DOM.timerWrapper) {
            DOM.timerWrapper.style.display = showTimer ? '' : 'none';
        }
    }

    // ==========================================
    // GOAL ANIMATION
    // ==========================================
    function triggerGoal(team) {
        DOM.goalOverlay.className = `goal-overlay show t${team}`;
        setTimeout(() => {
            DOM.goalOverlay.classList.remove('show', 't1', 't2');
        }, 1500);
    }

    // ==========================================
    // HTTP HELPERS
    // ==========================================
    async function apiGet(path) {
        const res = await fetch(`${BASE_URL}${path}`, { method: 'GET' });
        if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
        return await res.json();
    }

    async function apiPost(path) {
        const res = await fetch(`${BASE_URL}${path}`, { method: 'POST' });
        if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
        return await res.json();
    }

    async function apiPut(path) {
        const res = await fetch(`${BASE_URL}${path}`, { method: 'PUT' });
        if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
        return await res.json();
    }

    // ==========================================
    // TIMER LOCALE
    // ==========================================
    function startLocalTimer() {
        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            if (state.timerDirection === 'down') {
                if (state.timerSeconds > 0) {
                    state.timerSeconds--;
                    updateTimerDisplay();
                } else {
                    endGame('Tempo scaduto!');
                }
            } else {
                state.timerSeconds++;
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopLocalTimer() {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    // ==========================================
    // POLLING IoT
    // ==========================================
    function startPolling() {
        stopPolling();
        state.pollingInterval = setInterval(pollEvents, POLLING_INTERVAL_MS);
    }

    function stopPolling() {
        clearInterval(state.pollingInterval);
        state.pollingInterval = null;
    }

    /**
     * Ritorna 1, 2 o null in base al valore testuale di un EventoIot.
     * Match rigoroso sulle stringhe esatte che il backend salva:
     *   'Goal: Squadra 1'  →  1
     *   'Goal: Squadra 2'  →  2
     * Qualsiasi altro valore viene ignorato.
     */
    function detectGoalTeam(evento) {
        const v = evento && evento.valore;
        if (v === GOAL_TEAM_1) return 1;
        if (v === GOAL_TEAM_2) return 2;
        return null;
    }

    async function pollEvents() {
        const id = state.idPartitaCorrente;
        if (!id) return;

        try {
            const eventi = await apiGet(`/api/iot/partita/${id}`);

            updateConnection(true);
            if (!Array.isArray(eventi)) return;

            // Conta i goal per squadra aggregando gli eventi
            let goal1 = 0;
            let goal2 = 0;
            for (const ev of eventi) {
                const team = detectGoalTeam(ev);
                if (team === 1) goal1++;
                else if (team === 2) goal2++;
            }

            // Aggiorna UI solo se i conteggi sono cambiati
            if (goal1 !== state.lastPolledScore1) {
                const isNewGoal = goal1 > state.lastPolledScore1;
                state.score1 = goal1;
                state.lastPolledScore1 = goal1;
                updateScoreDisplay(1);
                if (isNewGoal) triggerGoal(1);
            }
            if (goal2 !== state.lastPolledScore2) {
                const isNewGoal = goal2 > state.lastPolledScore2;
                state.score2 = goal2;
                state.lastPolledScore2 = goal2;
                updateScoreDisplay(2);
                if (isNewGoal) triggerGoal(2);
            }

            // Vittoria per soglia massima (fine naturale del gioco)
            if (state.score1 >= maxScore || state.score2 >= maxScore) {
                const winner = state.score1 >= maxScore ? 'Squadra 1' : 'Squadra 2';
                endGame(`${winner} raggiunge ${maxScore} goal! Vince!`);
            }
        } catch (err) {
            updateConnection(false);
            console.warn('[Polling] errore:', err.message);
        }
    }

    // ==========================================
    // LIFECYCLE: standby / fine partita
    // ==========================================
    function resetToStandby() {
        stopLocalTimer();
        stopPolling();
        state.idPartitaCorrente = null;
        state.score1 = 0;
        state.score2 = 0;
        state.lastPolledScore1 = 0;
        state.lastPolledScore2 = 0;
        state.timerSeconds = 0;
        state.status = 'In attesa di giocatori...';
        renderScore();
        updateTimerDisplay();
        switchMode(true);
    }

    async function endGame(reason) {
        if (!state.idPartitaCorrente) return;

        const id = state.idPartitaCorrente;
        const finalDuration = formatTime(state.timerSeconds);
        stopLocalTimer();
        stopPolling();
        state.idPartitaCorrente = null;

        const winner = state.score1 > state.score2 ? 'Squadra 1'
            : state.score2 > state.score1 ? 'Squadra 2'
                : null;
        const endingMsg = reason
            || (winner
                ? `Vince ${winner}! (${state.score1}-${state.score2}, durata ${finalDuration})`
                : `Pareggio! (${state.score1}-${state.score2}, durata ${finalDuration})`);

        try {
            await apiPut(`/api/partite/${id}/termina`);
            logEvent(endingMsg);
        } catch (err) {
            console.error('[endGame] errore terminazione:', err);
            logEvent(`${endingMsg} (offline)`);
        }

        state.status = 'Partita Terminata';
        switchMode(false);

        // Torna in standby dopo 10 secondi
        setTimeout(resetToStandby, 10000);
    }

    // ==========================================
    // RESILIENZA: recupero partita attiva all'avvio
    // Modificata: ora ritorna true se ripristina, false se vuoto
    // ==========================================
    async function checkExistingGame() {
        try {
            const partite = await apiGet('/api/partite');
            if (!Array.isArray(partite)) return false;

            // Cerca partita in corso associata al nostro gioco installato
            const partitaAttiva = partite.find(p =>
                p.idGiocoInstallato === idGiocoInstallato &&
                p.stato === 'IN_CORSO'
            );

            if (partitaAttiva && partitaAttiva.id) {
                console.log('[Resume] partita attiva trovata:', partitaAttiva);
                state.idPartitaCorrente = partitaAttiva.id;
                state.status = 'Partita in corso';
                state.score1 = 0;
                state.score2 = 0;
                state.lastPolledScore1 = 0;
                state.lastPolledScore2 = 0;
                state.timerSeconds = 0;

                state.timerDirection = showTimer ? 'down' : 'up';
                if (state.timerDirection === 'down') {
                    state.timerSeconds = 300;
                }

                renderScore();
                updateTimerDisplay();
                switchMode(false);
                logEvent('Partita ripresa. Sincronizzazione eventi in corso...');

                await pollEvents();
                if (!state.idPartitaCorrente) return true;

                startLocalTimer();
                startPolling();
                return true; // Ripristino eseguito con successo
            }
            return false; // Nessuna partita attiva sul server
        } catch (err) {
            console.warn('[Resume] nessuna partita recuperabile:', err.message);
            updateConnection(false);
            return false;
        }
    }

    // ==========================================
    // AVVIO NUOVA PARTITA (debug-reset)
    // ==========================================
    async function startNewGame() {
        try {
            // Se esiste già una partita attiva, terminala prima
            if (state.idPartitaCorrente) {
                try {
                    await apiPut(`/api/partite/${state.idPartitaCorrente}/termina`);
                } catch (_) { /* la partita potrebbe essere già chiusa lato server */ }
            }

            const partita = await apiPost(`/api/partite/avvia/${idGiocoInstallato}`);
            if (!partita || !partita.id) {
                throw new Error('Backend non ha restituito un id partita valido');
            }

            state.idPartitaCorrente = partita.id;
            state.score1 = 0;
            state.score2 = 0;
            state.lastPolledScore1 = 0;
            state.lastPolledScore2 = 0;
            state.status = 'Partita in corso';
            state.timerDirection = showTimer ? 'down' : 'up';
            state.timerSeconds = state.timerDirection === 'down' ? 300 : 0;

            renderScore();
            updateTimerDisplay();
            switchMode(false);
            logEvent(`Nuova partita! Primo a ${maxScore} vince.`);

            startLocalTimer();
            startPolling();
        } catch (err) {
            console.error('[startNewGame] errore:', err);
            logEvent('Errore: impossibile avviare la partita.');
            updateConnection(false);
        }
    }

    // ==========================================
    // GOAL MANUALE (debug - SIMULA IL SENSORE IoT)
    // ==========================================
    async function manualGoal(team) {
        const id = state.idPartitaCorrente;
        if (!id) {
            logEvent('Nessuna partita attiva. Avviane una prima.');
            return;
        }
        if (state.status !== 'Partita in corso') {
            logEvent('La partita non è in corso, goal ignorato.');
            return;
        }
        try {
            const stringaGoal = team === 1 ? 'Goal: Squadra 1' : 'Goal: Squadra 2';
            const valoreSicuro = encodeURIComponent(stringaGoal);

            const res = await fetch(`${BASE_URL}/api/iot/evento?idPartita=${id}&valore=${valoreSicuro}&idSensore=${team}`, {
                method: 'POST'
            });

            if (!res.ok) {
                throw new Error(`Errore Server: ${res.status}`);
            }

            logEvent(`Inviato evento finto sensore: ${stringaGoal}`);
            await pollEvents();

        } catch (err) {
            console.error('[manualGoal] errore:', err);
            logEvent('Errore invio evento sensore.');
        }
    }

    // ==========================================
    // DEBUG BINDINGS
    // ==========================================
    function initDebug() {
        document.getElementById('debug-conn').addEventListener('click', () => {
            // Toggle manuale (utile in debug per simulare offline/online)
            updateConnection(!state.isConnected);
        });
        document.getElementById('debug-goal1').addEventListener('click', () => manualGoal(1));
        document.getElementById('debug-goal2').addEventListener('click', () => manualGoal(2));
        document.getElementById('debug-reset').addEventListener('click', startNewGame);

        DOM.debugToggle.addEventListener('click', () => {
            state.isDebugOpen = !state.isDebugOpen;
            DOM.debugPanel.style.display = state.isDebugOpen ? 'flex' : 'none';
        });
    }
    // ==========================================
    // MENU DI SETUP 
    // ==========================================
    function initSetupMenu() {
        const setupView = document.getElementById('setup-view');
        const gameView = document.getElementById('game-view');
        const cards = document.querySelectorAll('.setup-card');

        cards.forEach(card => {
            card.addEventListener('click', async (e) => {
                const btn = e.currentTarget;

                idGiocoInstallato = parseInt(btn.getAttribute('data-id'), 10);
                maxScore = parseInt(btn.getAttribute('data-max'), 10);
                showTimer = btn.getAttribute('data-timer') === 'true';

                console.log(`Selezionato Gioco ${idGiocoInstallato}: Vittoria a ${maxScore}, Timer: ${showTimer}`);

                setupView.style.display = 'none';
                gameView.style.display = 'flex';

                applyTimerVisibility();

                try {
                    const isResumed = await checkExistingGame();
                    if (!isResumed) {
                        console.log('[Setup] Nessuna partita attiva sul server. Avvio automatico...');
                        await startNewGame();
                    }
                } catch (err) {
                    console.error('[setup] Errore inizializzazione gioco:', err);
                }
            });
        });

        // --- BOTTONE CAMBIA TAVOLO ---
        const btnBack = document.getElementById('back-to-setup');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                // Ferma il gioco attuale ed evita polling residui
                if (state.idPartitaCorrente) {
                    endGame('Partita interrotta dal gestore');
                }
                resetToStandby();

                gameView.style.display = 'none';
                setupView.style.display = 'flex';
            });
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    return {
        init: function () {
            // Prepara l'interfaccia di base
            updateConnection(false);
            switchMode(true);
            initDebug();

            initSetupMenu();

            console.log(`PlayNode UI v2.0 Inizializzata — In attesa di selezione tavolo...`);
        }
    };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', PlayNodeUI.init);
