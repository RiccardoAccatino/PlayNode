// PlayNode - Schermo Gioco UI
// Architettura Avanzata JS: Module Pattern per isolamento e manutenibilità

const PlayNodeUI = (function () {
    // --- State Management ---
    const state = {
        score1: 0,
        score2: 0,
        timerSeconds: 300,
        status: 'In attesa di giocatori...',
        isConnected: false,
        timerInterval: null,
        isDebugOpen: false
    };

    // --- DOM Elements ---
    const DOM = {
        connBadge: document.getElementById('connection-status'),
        connText: document.querySelector('#connection-status .text'),
        statusTxt: document.getElementById('game-status'),
        timerDisplay: document.getElementById('timer'),
        score1: document.getElementById('score1'),
        score2: document.getElementById('score2'),
        logTxt: document.getElementById('log-text'),
        gameBoard: document.getElementById('game-elements'),
        goalOverlay: document.getElementById('goal-overlay'),
        debugToggle: document.getElementById('debug-toggle'),
        debugPanel: document.getElementById('debug-panel')
    };

    // --- Core UI Updates ---
    function updateConnection(connected) {
        state.isConnected = connected;
        DOM.connBadge.className = `connection-badge ${connected ? 'online' : 'offline'}`;
        DOM.connText.textContent = connected ? 'Edge Connesso' : 'Ricerca Edge...';
    }

    function updateScoreDisplay(team) {
        DOM.score1.textContent = state.score1;
        DOM.score2.textContent = state.score2;

        // Micro-interazione: Pop effect
        const target = team === 1 ? DOM.score1 : DOM.score2;
        target.classList.remove('pop');
        void target.offsetWidth; // Trigger reflow
        target.classList.add('pop');
        setTimeout(() => target.classList.remove('pop'), 400);
    }

    function updateTimerDisplay() {
        const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
        const s = (state.timerSeconds % 60).toString().padStart(2, '0');
        DOM.timerDisplay.textContent = `${m}:${s}`;

        // Allarme rosso se mancano meno di 30 secondi
        if (state.timerSeconds > 0 && state.timerSeconds <= 30) {
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
            // Effetto "Standby": il tabellone c'è ma è sfumato
            DOM.gameBoard.style.opacity = '0.3';
        } else {
            // Effetto "Attivo": il tabellone si accende
            DOM.gameBoard.style.opacity = '1';
        }
    }

    // --- Explosive Goal Animation ---
    function triggerGoal(team) {
        DOM.goalOverlay.className = `goal-overlay show t${team}`;
        setTimeout(() => {
            DOM.goalOverlay.classList.remove('show', 't1', 't2');
        }, 1500);
    }

    // --- Game Logic ---
    function handleGoal(team) {
        if (state.status !== 'Partita in corso') return;
        team === 1 ? state.score1++ : state.score2++;
        updateScoreDisplay(team);
        triggerGoal(team);
    }

    function startGame() {
        state.score1 = 0;
        state.score2 = 0;
        state.timerSeconds = 300;
        state.status = 'Partita in corso';

        updateScoreDisplay(1);
        updateScoreDisplay(2);
        updateTimerDisplay();
        switchMode(false);
        logEvent('Partita Iniziata! Buon divertimento.');

        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            if (state.timerSeconds > 0) {
                state.timerSeconds--;
                updateTimerDisplay();
            } else {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(state.timerInterval);
        state.status = 'Partita Terminata';
        switchMode(false);
        logEvent('Tempo scaduto! Partita conclusa.');

        // Torna in standby dopo 10 secondi
        setTimeout(resetToStandby, 10000);
    }

    function resetToStandby() {
        clearInterval(state.timerInterval);
        state.status = 'In attesa di giocatori...';
        switchMode(true);
    }

    // --- Mock Edge Component (MQTT Simulation) ---
    function initEdgeMock() {
        // Simula ritardo di connessione HW
        setTimeout(() => updateConnection(true), 1500);

        // Debug Bindings
        document.getElementById('debug-conn').addEventListener('click', () => updateConnection(!state.isConnected));
        document.getElementById('debug-goal1').addEventListener('click', () => handleGoal(1));
        document.getElementById('debug-goal2').addEventListener('click', () => handleGoal(2));
        document.getElementById('debug-reset').addEventListener('click', startGame);

        DOM.debugToggle.addEventListener('click', () => {
            state.isDebugOpen = !state.isDebugOpen;
            DOM.debugPanel.style.display = state.isDebugOpen ? 'flex' : 'none';
        });
    }

    // --- Init ---
    return {
        init: function () {
            updateConnection(false);
            switchMode(true);
            initEdgeMock();
            console.log("PlayNode UI V2.0 (Vanilla) Initialized.");
        }
    };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', PlayNodeUI.init);