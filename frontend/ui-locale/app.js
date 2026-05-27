// PlayNode - Schermo Gioco UI (Vanilla JS)
// Versione professionale con carosello, animazioni, accessibilità e debug

document.addEventListener('DOMContentLoaded', () => {
    // ------------------- Elementi DOM -------------------
    const statusEl = document.getElementById('game-status');
    const timerEl = document.getElementById('timer');
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    const logEl = document.getElementById('event-log');
    const carouselEl = document.getElementById('carousel');
    const gameElementsEl = document.getElementById('game-elements');
    const goalOverlayEl = document.getElementById('goal-overlay');
    const debugToggleBtn = document.getElementById('debug-toggle');
    const debugPanelEl = document.getElementById('debug-panel');
    const debugGoal1Btn = document.getElementById('debug-goal1');
    const debugGoal2Btn = document.getElementById('debug-goal2');
    const debugResetBtn = document.getElementById('debug-reset');
    const indicators = document.querySelectorAll('.indicator');
    const carouselSlides = document.querySelectorAll('.carousel-slide');

    // Helper to get CSS variable
    function getCssVar(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
    }

    // ------------------- Stato iniziale -------------------
    let score1 = 0;
    let score2 = 0;
    let gameStatus = 'In attesa di giocatori...';
    let timerSeconds = 300; // 5:00 minuti
    let timerInterval = null;
    let debugMode = false; // attivato tramite toggle o shortcut
    let carouselIndex = 0;
    let carouselInterval = null;
    const CAROUSEL_DELAY = 4000; // 4 secondi

    // ------------------- Funzioni UI -------------------
    function updateStatus() {
        statusEl.textContent = gameStatus;
        // Aggiorna ARIA label per screen reader
        statusEl.setAttribute('aria-label', `Stato partita: ${gameStatus}`);
        updateUIBasedOnStatus();
    }

    function updateTimer() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.setAttribute('aria-label', `Timer partita, ${minutes} minuti e ${seconds} secondi`);
    }

    function updateScores() {
        // Aggiorna punteggi e aggiunge classe di animazione
        score1El.textContent = score1;
        score2El.textContent = score2;
        score1El.setAttribute('aria-label', `Punteggio Squadra 1, ${score1}`);
        score2El.setAttribute('aria-label', `Punteggio Squadra 2, ${score2}`);

        // Trigger animation
        score1El.classList.add('updated');
        score2El.classList.add('updated');
        // Rimuovi classe dopo l'animazione
        setTimeout(() => {
            score1El.classList.remove('updated');
            score2El.classList.remove('updated');
        }, 600);
    }

    function updateLog(message) {
        logEl.textContent = message;
        if (message.trim() === '') {
            logEl.classList.add('empty');
            logEl.setAttribute('aria-label', 'Log vuoto');
        } else {
            logEl.classList.remove('empty');
            logEl.setAttribute('aria-label', `Evento: ${message}`);
        }
    }

    function updateUIBasedOnStatus() {
        const isWaiting = gameStatus === 'In attesa di giocatori...';
        gameElementsEl.style.display = isWaiting ? 'none' : 'flex';
        carouselEl.style.display = isWaiting ? 'block' : 'none';
        if (isWaiting) {
            startCarousel();
        } else {
            stopCarousel();
        }
    }

    // ------------------- Carousel -------------------
    function initCarousel() {
        // Reset indicatori
        indicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === 0);
            ind.dataset.slideTo = idx;
        });
        // Prima slide attiva
        carouselSlides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === 0);
        });
        carouselIndex = 0;
    }

    function startCarousel() {
        stopCarousel();
        if (carouselSlides.length === 0) return;
        carouselInterval = setInterval(nextSlide, CAROUSEL_DELAY);
    }

    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    }

    function nextSlide() {
        const prevIndex = carouselIndex;
        carouselIndex = (carouselIndex + 1) % carouselSlides.length;
        carouselSlides[prevIndex].classList.remove('active');
        carouselSlides[carouselIndex].classList.add('active');
        indicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === carouselIndex);
        });
    }

    function goToSlide(index) {
        if (index < 0 || index >= carouselSlides.length) return;
        carouselSlides[carouselIndex].classList.remove('active');
        indicators[carouselIndex].classList.remove('active');
        carouselIndex = index;
        carouselSlides[carouselIndex].classList.add('active');
        indicators[carouselIndex].classList.add('active');
        // Reset interval
        stopCarousel();
        startCarousel();
    }

    // Touch/swipe support for carousel
    let touchStartX = 0;
    let touchEndX = 0;
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    }
    function handleGesture() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // swipe left -> next slide
                nextSlide();
            } else {
                // swipe right -> prev slide
                const prev = (carouselIndex - 1 + carouselSlides.length) % carouselSlides.length;
                goToSlide(prev);
            }
        }
    }

    // ------------------- WebSocket mock -------------------
    function connectToEdge() {
        console.log('[Mock] Connessione WebSocket al Componente Edge...');
        // In produzione:
        // const ws = new WebSocket('ws://localhost:8080/edge');
        // ws.onopen = () => console.log('[WS] Connesso');
        // ws.onmessage = (e) => handleEdgeMessage(JSON.parse(e.data));
        // ws.onclose = () => console.log('[WS] Disconnesso');
        return {
            send: (data) => console.log('[Mock] Invio a Edge:', data),
            close: () => console.log('[Mock] Chiusura connessione')
        };
    }

    function handleEdgeMessage(data) {
        if (!data) return;
        switch (data.type) {
            case 'goal':
                if (data.team === 1) score1++;
                else if (data.team === 2) score2++;
                updateScores();
                updateLog(`Squadra ${data.team} ha segnato!`);
                showGoalOverlay(data.team);
                break;
            case 'status':
                gameStatus = data.status;
                updateStatus();
                break;
            case 'timer':
                timerSeconds = data.seconds;
                updateTimer();
                break;
            case 'reset':
                resetGame();
                break;
            default:
                console.log('[Mock] Messaggio sconosciuto:', data);
        }
    }

    // ------------------- Game logic -------------------
    function resetGame() {
        score1 = 0;
        score2 = 0;
        timerSeconds = 300;
        gameStatus = 'In attesa di giocatori...';
        updateScores();
        updateTimer();
        updateStatus();
        updateLog('Partita resettata');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimer();
                // In produzione: edgeWs.send({type: 'timer', seconds: timerSeconds});
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                gameStatus = 'Partita Terminata';
                updateStatus();
                // edgeWs.send({type: 'status', status: gameStatus});
            }
        }, 1000);
    }

    function showGoalOverlay(team) {
        // Rimuovi eventuali classi precedenti
        goalOverlayEl.classList.remove('team1', 'team2');
        if (team === 1) goalOverlayEl.classList.add('team1');
        else if (team === 2) goalOverlayEl.classList.add('team2');
        else goalOverlayEl.textContent = 'GOAL!'; // default

        goalOverlayEl.classList.add('show');
        // Rimuovi classe dopo l'animazione (2s)
        setTimeout(() => {
            goalOverlayEl.classList.remove('show');
        }, 2000);
    }

    // ------------------- Debug controls -------------------
    function toggleDebugMode() {
        debugMode = !debugMode;
        debugPanelEl.style.display = debugMode ? 'flex' : 'none';
        debugToggleBtn.setAttribute('aria-label', debugMode ? 'Disattiva modalità debug' : 'Attiva modalità debug');
        // Visual feedback using CSS variables
        const primaryBlue = getCssVar('--primary-blue');
        debugToggleBtn.style.background = debugMode ? primaryBlue : 'rgba(59,130,246,0.2)';
        debugToggleBtn.style.color = debugMode ? 'white' : primaryBlue;
        debugToggleBtn.style.transform = debugMode ? 'scale(1.1)' : 'scale(1)';
    }

    // Keyboard shortcuts for debug (active only when debugMode true)
    function handleKeyDown(e) {
        if (!debugMode) return;
        switch (e.key.toLowerCase()) {
            case 'g':
                e.preventDefault();
                score1++;
                updateScores();
                updateLog('Squadra 1 ha segnato! (debug)');
                showGoalOverlay(1);
                break;
            case 'h':
                e.preventDefault();
                score2++;
                updateScores();
                updateLog('Squadra 2 ha segnato! (debug)');
                showGoalOverlay(2);
                break;
            case 'r':
                e.preventDefault();
                resetGame();
                break;
            case 'escape':
                // Chiudi debug panel con ESC
                toggleDebugMode();
                break;
        }
    }

    // ------------------- Inizializzazione -------------------
    const edgeWs = connectToEdge(); // mock
    initCarousel();
    updateStatus();
    updateTimer();
    updateScores();
    updateLog('Pronto per iniziare...');

    // Avvio automatico timer dopo 2 secondi per dimostrazione
    setTimeout(() => {
        gameStatus = 'Partita in corso';
        updateStatus();
        startTimer();
    }, 2000);

    // ------------------- Event listeners -------------------
    // Debug toggle button
    debugToggleBtn.addEventListener('click', toggleDebugMode);
    // Debug panel buttons
    debugGoal1Btn.addEventListener('click', () => {
        score1++;
        updateScores();
        updateLog('Squadra 1 ha segnato! (debug)');
        showGoalOverlay(1);
    });
    debugGoal2Btn.addEventListener('click', () => {
        score2++;
        updateScores();
        updateLog('Squadra 2 ha segnato! (debug)');
        showGoalOverlay(2);
    });
    debugResetBtn.addEventListener('click', resetGame);

    // Carousel indicators click
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const idx = Number(ind.dataset.slideTo);
            goToSlide(idx);
        });
    });

    // Carousel touch events
    carouselEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    // Shortcut to toggle debug mode: Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleDebugMode();
        }
    });

    // Expose debug utilities globally (optional)
    window.__PLAYNODE_DEBUG = {
        toggleDebugMode,
        showGoalOverlay,
        resetGame,
        updateScores,
        connectToEdge,
        debugMode: () => debugMode
    };
});