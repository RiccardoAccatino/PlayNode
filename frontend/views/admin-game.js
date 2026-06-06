/**
 * file: admin-game.js
 * Pagine e componenti per gli ADMIN GIOCO.
 *
 * Questa vista è dedicata alla gestione operativa dei GIOCHI FISICI (tavoli) e
 * delle PARTITE LIVE: monitor real-time, forzatura chiusura, storico recente.
 *
 * Logica completamente dinamica:
 * 1. recupera le tipologie di gioco dal DB per configurazioni e icone
 * 2. recupera la lista dei locali
 * 3. fan-out sui locali per ottenere tutti i giochi installati
 * 4. recupera tutte le partite (live + concluse)
 * 5. per ogni partita live, calcola punteggi aggregando eventi IoT (goal/punti)
 */

import * as Api from '../js/api.js';

/* =====================================================
 * COSTANTI DI CONFIGURAZIONE (Parametri di runtime)
 * ===================================================== */
const REFRESH_MS = 10_000;          // Refresh automatico dei dati
const MAX_STORICO = 12;             // Quante partite concluse mostrare
const MAX_EVENTI_PER_PARTITA = 200; // Cap eventi per evitare memory-bomb

/* =====================================================
 * STATO INTERNO DEL MODULO (Caricato dinamicamente dal DB)
 * ===================================================== */
const state = {
    locali: [],
    giochi: [],          // Tutti i giochi fisici della piattaforma
    partite: [],         // Tutte le partite (live + concluse)
    tipologie: [],       // Tipologie di gioco (caricate dal DB con le relative icone)
    eventiCache: {},     // idPartita -> [eventi]
    refreshTimer: null,
    lastUpdate: null,
    erroriRete: 0
};

/* =====================================================
 * UTILITIES
 * ===================================================== */

/**
 * Restituisce l'icona emoji cercando dinamicamente nelle tipologie caricate dal DB.
 */
function iconaGioco(tipoGioco) {
    if (!tipoGioco || !state.tipologie || state.tipologie.length === 0) return '🎮';

    const tTarget = String(tipoGioco).toLowerCase();

    // Cerca la corrispondenza esatta o parziale nel catalogo tipologie del DB
    const tipologiaTrovata = state.tipologie.find(t => {
        const nomeTipologia = String(t.nome || t.nomeTipologiaGioco || '').toLowerCase();
        return tTarget.includes(nomeTipologia) || nomeTipologia.includes(tTarget);
    });

    // Restituisce l'icona salvata sul database (supporta i campi icona o emoji)
    if (tipologiaTrovata) {
        return tipologiaTrovata.icona || tipologiaTrovata.emoji || '🎮';
    }

    return '🎮';
}

/**
 * Formatta un numero di secondi como "MM:SS".
 */
function formatDurata(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

/**
 * Formatta una data/ora in italiano breve (HH:MM).
 */
function formatOra(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
}

/**
 * Formatta una data in italiano breve (DD/MM HH:MM).
 */
function formatDataBreve(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
            + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
}

/**
 * Ritorna classe badge + label dato uno stato di gioco/partita.
 */
function badgeStatoGioco(stato) {
    const s = (stato || 'LIBERO').toUpperCase();
    if (s === 'IN_USO' || s === 'OCCUPATO') return { cls: 'b-grn', label: 'In uso' };
    if (s === 'GUASTO' || s === 'OFFLINE' || s === 'ERRORE') return { cls: 'b-red', label: 'Guasto' };
    if (s === 'MANUTENZIONE') return { cls: 'b-amb', label: 'Manutenzione' };
    return { cls: 'b-blu', label: 'Libero' };
}

function badgeStatoPartita(stato) {
    const s = (stato || '').toUpperCase();
    if (s === 'IN_CORSO') return { cls: 'b-grn', label: 'In corso' };
    if (s === 'TERMINATA' || s === 'CONCLUSA') return { cls: 'b-blu', label: 'Terminata' };
    if (s === 'BLOCCATA') return { cls: 'b-red', label: 'Bloccata' };
    return { cls: 'b-amb', label: s || 'Sconosciuto' };
}

/**
 * Calcola i punteggi live di una partita aggregando gli eventi IoT ricevuti.
 */
function calcolaPunteggi(partita, eventi) {
    if (typeof partita.punteggio1 === 'number' && typeof partita.punteggio2 === 'number'
        && (partita.punteggio1 > 0 || partita.punteggio2 > 0)) {
        return { p1: partita.punteggio1, p2: partita.punteggio2, daEventi: false };
    }

    let p1 = 0, p2 = 0;
    if (Array.isArray(eventi)) {
        for (const e of eventi) {
            const v = String(e.valore || '').toLowerCase();
            if (!v.includes('goal') && !v.includes('punto') && !v.includes('+1')) continue;
            const sensId = Number(e.idSensore);
            if (!Number.isFinite(sensId)) continue;
            if (sensId % 2 === 0) p1 += 1; else p2 += 1;
        }
    }
    return { p1, p2, daEventi: true };
}

/**
 * Calcola i secondi trascorsi dall'inizio partita.
 */
function secondiTrascorsi(partita) {
    if (!partita.timestampInizio) return 0;
    const start = new Date(partita.timestampInizio).getTime();
    if (isNaN(start)) return 0;
    const fine = partita.timestampFine ? new Date(partita.timestampFine).getTime() : Date.now();
    return Math.max(0, Math.floor((fine - start) / 1000));
}

/**
 * Mostra un toast di notifica.
 */
function showToast(msg, type = 'info', durata = 3500) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transition = 'opacity .3s';
        setTimeout(() => t.remove(), 320);
    }, durata);
}

/**
 * Mostra/nasconde il banner di errore di connessione.
 */
function setConnectionError(msg) {
    let banner = document.getElementById('admin-game-conn-banner');
    const root = document.getElementById('admin-game-root');
    if (!root) return;

    if (msg) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'admin-game-conn-banner';
            banner.className = 'connection-banner';
            root.prepend(banner);
        }
        banner.innerHTML = `<span>⚠️</span><span>${msg}</span>`;
    } else if (banner) {
        banner.remove();
    }
}

/* =====================================================
 * DATA FETCHING (Integrazione DB a 360 gradi)
 * ===================================================== */

/**
 * Scarica tipologie, locali, giochi, partite ed eventi. Tutto da DB.
 */
async function fetchAllData() {
    try {
        // 1. Scarica il catalogo delle Tipologie Gioco dal DB per estrarre icone e regole configurate
        state.tipologie = await Api.getAllTipologieGioco() || [];

        // 2. Locali
        state.locali = await Api.getAllLocali() || [];

        // 3. Tutti i giochi fisici (fan-out su tutti i locali)
        state.giochi = await Api.getAllGiochiInstallati() || [];

        // 4. Tutte le partite
        state.partite = await Api.getAllPartite() || [];

        // 5. Per ogni partita in corso, recupera gli eventi IoT live
        const partiteLive = state.partite.filter(p =>
            (p.stato || '').toUpperCase() === 'IN_CORSO');

        const promises = partiteLive.map(async (p) => {
            try {
                const id = p.id || p.idPartita;
                if (!id) return;
                const eventi = await Api.getEventiPartita(id);
                state.eventiCache[id] = (eventi || []).slice(-MAX_EVENTI_PER_PARTITA);
            } catch (_) { /* isola errore singola partita */ }
        });
        await Promise.allSettled(promises);

        state.lastUpdate = new Date();
        state.erroriRete = 0;
        setConnectionError(null);
        return true;
    } catch (error) {
        state.erroriRete += 1;
        console.error('[admin-gioco] Errore sincronizzazione DB:', error);
        setConnectionError(
            'Impossibile contattare il backend (game-service). ' +
            'I dati potrebbero essere non aggiornati. Riprovo automaticamente…'
        );
        return false;
    }
}

/* =====================================================
 * RENDERING
 * ===================================================== */

export function adminGameDashboard() {
    setTimeout(() => bootstrapAdminGame(), 0);

    return `
        <div id="admin-game-root">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
                <div>
                    <div class="pg-title">Admin Gioco — Live Control</div>
                    <div class="pg-sub">
                        <span class="live-dot"></span>Monitor real-time tavoli e partite · IoT Edge attivo
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <span id="last-update" style="font-size:10px;color:var(--txt3)">Aggiornamento…</span>
                    <button id="btn-refresh" class="refresh-btn">
                        <span class="ico">↻</span> Aggiorna
                    </button>
                </div>
            </div>

            <div class="stats-row" id="stats-row">
                <div class="scard">
                    <div class="scard-lbl">Tavoli totali</div>
                    <div class="scard-val" id="stat-tavoli">—</div>
                    <div class="scard-delta neutral">installati</div>
                </div>
                <div class="scard">
                    <div class="scard-lbl"><span class="live-dot"></span>Partite live</div>
                    <div class="scard-val" id="stat-live">—</div>
                    <div class="scard-delta up">in corso ora</div>
                </div>
                <div class="scard">
                    <div class="scard-lbl">Tavoli in uso</div>
                    <div class="scard-val" id="stat-uso">—</div>
                    <div class="scard-delta neutral">occupazione</div>
                </div>
                <div class="scard">
                    <div class="scard-lbl">Partite oggi</div>
                    <div class="scard-val" id="stat-oggi">—</div>
                    <div class="scard-delta neutral">concluse + live</div>
                </div>
            </div>

            <div class="card" style="margin-bottom:12px">
                <div class="card-hd">Giochi Fisici (Tavoli) — Stato Real-Time</div>
                <div id="tavoli-grid" class="tavoli-grid">
                    <div class="empty-state">
                        <div class="empty-ico">⏳</div>
                        Caricamento tavoli in corso…
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom:12px">
                <div class="card-hd">
                    <span class="live-dot"></span>Partite Attive in Tempo Reale
                </div>
                <div id="partite-live" class="tavoli-grid" style="grid-template-columns:repeat(auto-fill, minmax(280px, 1fr))">
                    <div class="empty-state">
                        <div class="empty-ico">⏳</div>
                        Caricamento partite…
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-hd">Storico Recente — Ultime Partite Concluse</div>
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Gioco</th>
                            <th>Locale</th>
                            <th>Punteggio finale</th>
                            <th>Durata</th>
                            <th>Terminata il</th>
                            <th>Esito</th>
                        </tr>
                    </thead>
                    <tbody id="storico-tbody">
                        <tr><td colspan="7" style="text-align:center;padding:20px;color:var(--txt3)">
                            Caricamento storico…
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="modal-termina" class="cgp-modal-overlay">
            <div class="cgp-modal">
                <div class="cgp-modal-title">⚠️ Terminare la partita?</div>
                <div class="cgp-modal-body">
                    Stai per <strong>forzare la chiusura</strong> della partita
                    <strong id="modal-partita-id">#—</strong>.<br>
                    Il punteggio attuale verrà congelato e l'Edge Gateway
                    riceverà il comando di stop sensori.<br><br>
                    <em>Questa azione non può essere annullata.</em>
                </div>
                <div class="cgp-modal-actions">
                    <button id="btn-modal-annulla" class="act-btn" style="background:none;border:1px solid var(--bdr)">Annulla</button>
                    <button id="btn-modal-conferma" class="danger-btn">Termina partita</button>
                </div>
            </div>
        </div>
    `;
}

/* =====================================================
 * BOOTSTRAP / LOGICA ASINCRONA
 * ===================================================== */

let refreshInterval = null;
let pendingTerminazione = null;

async function bootstrapAdminGame() {
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', async () => {
            btnRefresh.classList.add('spinning');
            await fetchAllData();
            renderAll();
            btnRefresh.classList.remove('spinning');
        });
    }

    const modal = document.getElementById('modal-termina');
    const btnAnnulla = document.getElementById('btn-modal-annulla');
    const btnConferma = document.getElementById('btn-modal-conferma');
    if (btnAnnulla) {
        btnAnnulla.addEventListener('click', () => {
            modal.classList.remove('open');
            pendingTerminazione = null;
        });
    }
    if (btnConferma) {
        btnConferma.addEventListener('click', confermaTerminazione);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                pendingTerminazione = null;
            }
        });
    }

    // Caricamento iniziale completo da DB
    await fetchAllData();
    renderAll();

    // Loop Auto-refresh
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
        await fetchAllData();
        renderAll();
    }, REFRESH_MS);
}

/* =====================================================
 * RENDER SPECIFICI
 * ===================================================== */

function renderAll() {
    renderStats();
    renderTavoli();
    renderPartiteLive();
    renderStorico();
    renderLastUpdate();
}

function renderLastUpdate() {
    const el = document.getElementById('last-update');
    if (el && state.lastUpdate) {
        el.textContent = 'Aggiornato: ' + state.lastUpdate.toLocaleTimeString('it-IT');
    }
}

function renderStats() {
    const totTavoli = state.giochi.length;
    const partiteLive = state.partite.filter(p => (p.stato || '').toUpperCase() === 'IN_CORSO');
    const idsGiochiInUso = new Set(partiteLive.map(p => p.idGiocoInstallato));
    const tavoliInUso = idsGiochiInUso.size;

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const partiteOggi = state.partite.filter(p => {
        const d = p.timestampInizio ? new Date(p.timestampInizio) : null;
        return d && !isNaN(d.getTime()) && d >= oggi;
    });

    const set = (id, v) => {
        const e = document.getElementById(id);
        if (e) e.textContent = v;
    };
    set('stat-tavoli', totTavoli);
    set('stat-live', partiteLive.length);
    set('stat-uso', `${tavoliInUso}/${totTavoli}`);
    set('stat-oggi', partiteOggi.length);
}

function renderTavoli() {
    const grid = document.getElementById('tavoli-grid');
    if (!grid) return;

    if (!state.giochi || state.giochi.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-ico">🎮</div>
                Nessun tavolo installato registrato nel database.
            </div>`;
        return;
    }

    const sorted = [...state.giochi].sort((a, b) => {
        return (a.localeNome || '').localeCompare(b.localeNome || '') || (a.id - b.id);
    });

    grid.innerHTML = sorted.map(g => {
        const id = g.id || g.idGiocoInstallato;
        const tipo = g.tipoGioco || g.nome || g.nomeTipologiaGioco || 'Gioco';
        const localeNome = g.localeNome || '—';
        const statoBadge = badgeStatoGioco(g.stato);
        const cardClass = g.stato === 'IN_USO' ? 'in-uso' : (g.stato === 'GUASTO' ? 'guasto' : '');

        return `
            <div class="tavolo-card ${cardClass}">
                <div class="tavolo-head">
                    <div class="tavolo-ico">${iconaGioco(tipo)}</div>
                    <div style="flex:1;min-width:0">
                        <div class="tavolo-name">${escapeHtml(tipo)}</div>
                        <div class="tavolo-meta">${escapeHtml(localeNome)}</div>
                    </div>
                </div>
                <div class="tavolo-stato">
                    <span class="badge ${statoBadge.cls}">${statoBadge.label}</span>
                </div>
                <div class="tavolo-footer">
                    <span class="tavolo-id">ID #${id}</span>
                    <span style="font-size:9px;color:var(--txt3)">${g.sensori || 0} sensori</span>
                </div>
            </div>`;
    }).join('');
}

function renderPartiteLive() {
    const grid = document.getElementById('partite-live');
    if (!grid) return;

    const live = state.partite.filter(p => (p.stato || '').toUpperCase() === 'IN_CORSO');

    if (live.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-ico">🟢</div>
                Nessuna partita attiva nel sistema in questo momento.
            </div>`;
        return;
    }

    grid.innerHTML = live.map(p => {
        const id = p.id || p.idPartita;
        const idGioco = p.idGiocoInstallato;
        const gioco = state.giochi.find(g => (g.id || g.idGiocoInstallato) == idGioco) || {};
        const tipoGioco = gioco.tipoGioco || 'Gioco';
        const localeNome = gioco.localeNome || '—';
        const eventi = state.eventiCache[id] || [];
        const score = calcolaPunteggi(p, eventi);
        const sec = secondiTrascorsi(p);

        return `
            <div class="live-card" data-partita-id="${id}">
                <div class="live-head">
                    <span class="live-dot"></span>
                    <div class="live-title">${iconaGioco(tipoGioco)} ${escapeHtml(tipoGioco)}</div>
                    <span class="badge b-grn">LIVE</span>
                    <div class="live-time" data-timestamp-inizio="${escapeAttr(p.timestampInizio || '')}">
                        ${formatDurata(sec)}
                    </div>
                </div>

                <div class="scoreboard">
                    <div class="score-team">
                        <div class="score-team-name">Team A</div>
                        <div class="score-team-val">${score.p1}</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-team">
                        <div class="score-team-name">Team B</div>
                        <div class="score-team-val">${score.p2}</div>
                    </div>
                </div>

                <div class="live-meta">
                    <span>📍 ${escapeHtml(localeNome)}</span>
                    <span>📡 ${eventi.length} eventi IoT</span>
                </div>

                <div class="live-actions">
                    <button class="act-btn btn-dettagli" data-id="${id}">Dettagli</button>
                    <button class="danger-btn btn-termina" data-id="${id}">Termina partita</button>
                </div>
            </div>`;
    }).join('');

    grid.querySelectorAll('.btn-termina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            apriModaleTermina(id);
        });
    });

    grid.querySelectorAll('.btn-dettagli').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const partita = state.partite.find(p => (p.id || p.idPartita) == id);
            const eventi = state.eventiCache[id] || [];
            console.log(`[admin-gioco] Real-time logs partita #${id}:`, partita, eventi);
            showToast(`Partita #${id}: Ricevuti ${eventi.length} pacchetti IoT. Log in console.`, 'info');
        });
    });

    updateLiveTimers();
}

function updateLiveTimers() {
    document.querySelectorAll('.live-time[data-timestamp-inizio]').forEach(el => {
        const ts = el.getAttribute('data-timestamp-inizio');
        if (!ts) return;
        const start = new Date(ts).getTime();
        if (isNaN(start)) return;
        const sec = Math.max(0, Math.floor((Date.now() - start) / 1000));
        el.textContent = formatDurata(sec);
    });
}

function renderStorico() {
    const tbody = document.getElementById('storico-tbody');
    if (!tbody) return;

    const concluse = state.partite
        .filter(p => (p.stato || '').toUpperCase() === 'TERMINATA')
        .sort((a, b) => {
            const ta = a.timestampFine ? new Date(a.timestampFine).getTime() : 0;
            const tb = b.timestampFine ? new Date(b.timestampFine).getTime() : 0;
            return tb - ta;
        })
        .slice(0, MAX_STORICO);

    if (concluse.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align:center;padding:20px;color:var(--txt3)">
                Nessuno storico presente nel DB.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = concluse.map(p => {
        const id = p.id || p.idPartita;
        const idGioco = p.idGiocoInstallato;
        const gioco = state.giochi.find(g => (g.id || g.idGiocoInstallato) == idGioco) || {};
        const tipoGioco = gioco.tipoGioco || 'Gioco';
        const localeNome = gioco.localeNome || '—';
        const eventi = state.eventiCache[id] || [];
        const score = calcolaPunteggi(p, eventi);
        const sec = secondiTrascorsi(p);

        let esito = '—', esitoCls = 'b-blu';
        if (score.p1 > score.p2) { esito = 'Team A'; esitoCls = 'b-grn'; }
        else if (score.p2 > score.p1) { esito = 'Team B'; esitoCls = 'b-grn'; }
        else { esito = 'Pareggio'; esitoCls = 'b-amb'; }

        return `
            <tr>
                <td style="font-family:monospace;font-size:11px;color:var(--txt3)">#${id}</td>
                <td>${iconaGioco(tipoGioco)} ${escapeHtml(tipoGioco)}</td>
                <td style="font-size:11px">${escapeHtml(localeNome)}</td>
                <td style="font-family:var(--ff);font-weight:700">${score.p1} – ${score.p2}</td>
                <td style="font-family:monospace;font-size:11px">${formatDurata(sec)}</td>
                <td style="font-size:11px">${formatDataBreve(p.timestampFine)}</td>
                <td><span class="badge ${esitoCls}">${esito}</span></td>
            </tr>`;
    }).join('');
}

/* =====================================================
 * AZIONE: TERMINA PARTITA
 * ===================================================== */

function apriModaleTermina(idPartita) {
    pendingTerminazione = idPartita;
    const modal = document.getElementById('modal-termina');
    const label = document.getElementById('modal-partita-id');
    if (label) label.textContent = '#' + idPartita;
    if (modal) modal.classList.add('open');
}

async function confermaTerminazione() {
    if (!pendingTerminazione) return;
    const id = pendingTerminazione;
    const btn = document.getElementById('btn-modal-conferma');
    const modal = document.getElementById('modal-termina');

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Terminazione…';
    }

    try {
        const result = await Api.terminaPartita(id);
        if (result === null) {
            showToast('Partita già conclusa lato backend.', 'warning');
        } else {
            showToast(`Partita #${id} forzata in stato TERMINATA.`, 'success');
        }
        await fetchAllData();
        renderAll();
    } catch (error) {
        console.error('[admin-gioco] Errore terminazione:', error);
        showToast(`Chiamata fallita per la partita #${id}: ${error.message}`, 'error', 5000);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Termina partita';
        }
        if (modal) modal.classList.remove('open');
        pendingTerminazione = null;
    }
}

/* =====================================================
 * SICUREZZA
 * ===================================================== */
function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function escapeAttr(s) {
    return escapeHtml(s);
}

/* =====================================================
 * CLEANUP
 * ===================================================== */

export function disposeAdminGame() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    state.eventiCache = {};
    state.lastUpdate = null;
}

export {
    iconaGioco,
    formatDurata,
    badgeStatoGioco,
    badgeStatoPartita,
    calcolaPunteggi
};