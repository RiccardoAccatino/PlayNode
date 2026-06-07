/**
 * file: admin-game.js
 * Vista Admin Gioco — monitor real-time tavoli e partite live.
 * Tutti i dati provengono dalle API del game-service
 */

import * as Api from '../js/api.js';
import { iconaGioco as iconaGiocoByNome } from '../js/game-icons.js';

const REFRESH_MS = 10_000;
const MAX_STORICO = 12;
const MAX_EVENTI_PER_PARTITA = 200;

const state = {
    locali: [],
    giochi: [],
    partite: [],
    tipologie: [],
    sensoriCache: {},
    eventiCache: {},
    refreshTimer: null,
    lastUpdate: null,
    erroriRete: 0
};

/* =====================================================
 * ACCESSORI DTO 
 * ===================================================== */

function idPartita(p) {
    return p?.id;
}

function idGioco(g) {
    return g?.id;
}

function nomeTipologia(tipologiaId, fallback) {
    const t = state.tipologie.find(x => x.id === tipologiaId);
    return t?.nome || fallback || 'Gioco';
}

/**
 * Icona derivata dal nome tipologia caricato dal DB (nessun catalogo statico).
 */
function iconaGioco(tipoGioco, tipologiaId) {
    const nome = tipologiaId
        ? nomeTipologia(tipologiaId, tipoGioco)
        : (tipoGioco || '');
    return iconaGiocoByNome(nome);
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
 * Punteggi: priorità ai campi PartitaDTO (punteggio1/punteggio2 dal DB),
 * fallback su aggregazione eventi IoT con mapping sensore → squadra.
 */
function calcolaPunteggi(partita, eventi, sensoriGioco) {
    const hasDbScore = Number.isFinite(partita.punteggio1) && Number.isFinite(partita.punteggio2)
        && (partita.punteggio1 > 0 || partita.punteggio2 > 0);
    if (hasDbScore) {
        return { p1: partita.punteggio1, p2: partita.punteggio2, daEventi: false };
    }

    const sensorMap = {};
    if (Array.isArray(sensoriGioco)) {
        for (const s of sensoriGioco) {
            if (s.id != null) sensorMap[s.id] = s.posizione || s.nomeSensore || '';
        }
    }

    let p1 = 0, p2 = 0;
    if (Array.isArray(eventi)) {
        for (const e of eventi) {
            const v = String(e.valore || '').toLowerCase();
            if (!v.includes('goal') && !v.includes('punto') && !v.includes('+1')) continue;

            const pos = String(sensorMap[e.sensoreId ?? e.idSensore] || '').toLowerCase();
            if (pos.includes('squadra 1') || pos.includes('porta 1') || v.includes('squadra 1')) {
                p1 += 1;
            } else if (pos.includes('squadra 2') || pos.includes('porta 2') || v.includes('squadra 2')) {
                p2 += 1;
            }
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
        banner.innerHTML = `<span>⚠️</span><span>${escapeHtml(msg)}</span>`;
    } else if (banner) {
        banner.remove();
    }
}

function messaggioErrore(error) {
    if (!error) return 'Errore sconosciuto';
    if (error.message === 'Session expired') return 'Sessione scaduta. Effettua nuovamente il login.';
    return error.message || String(error);
}

/* =====================================================
 * DATA FETCHING
 * ===================================================== */

/**
 * Scarica tipologie, locali, giochi, partite ed eventi.
 */
async function fetchAllData() {
    const errori = [];

    const [tipRes, locRes, gioRes, parRes] = await Promise.allSettled([
        Api.getAllTipologieGioco(),
        Api.getAllLocali(),
        Api.getAllGiochiInstallati(),
        Api.getAllPartite()
    ]);

    if (tipRes.status === 'fulfilled') {
        state.tipologie = tipRes.value || [];
    } else {
        state.tipologie = [];
        errori.push(`Tipologie: ${messaggioErrore(tipRes.reason)}`);
    }

    if (locRes.status === 'fulfilled') {
        state.locali = locRes.value || [];
    } else {
        state.locali = [];
        errori.push(`Locali: ${messaggioErrore(locRes.reason)}`);
    }

    if (gioRes.status === 'fulfilled') {
        state.giochi = gioRes.value || [];
    } else {
        state.giochi = [];
        errori.push(`Giochi: ${messaggioErrore(gioRes.reason)}`);
    }

    if (parRes.status === 'fulfilled') {
        state.partite = parRes.value || [];
    } else {
        state.partite = [];
        errori.push(`Partite: ${messaggioErrore(parRes.reason)}`);
    }

    // Sensori per ogni tavolo (per conteggio e mapping punteggi IoT)
    const sensorPromises = state.giochi.map(async (g) => {
        const gid = idGioco(g);
        if (!gid) return;
        try {
            const sensori = await Api.getSensoriByGioco(gid);
            state.sensoriCache[gid] = sensori || [];
        } catch (err) {
            state.sensoriCache[gid] = [];
            errori.push(`Sensori tavolo #${gid}: ${messaggioErrore(err)}`);
        }
    });
    await Promise.allSettled(sensorPromises);

    // Eventi IoT per partite in corso
    const partiteLive = state.partite.filter(p => (p.stato || '').toUpperCase() === 'IN_CORSO');
    const eventPromises = partiteLive.map(async (p) => {
        const pid = idPartita(p);
        if (!pid) return;
        try {
            const eventi = await Api.getEventiPartita(pid);
            state.eventiCache[pid] = (eventi || []).slice(-MAX_EVENTI_PER_PARTITA);
        } catch (err) {
            state.eventiCache[pid] = [];
            errori.push(`Eventi partita #${pid}: ${messaggioErrore(err)}`);
        }
    });
    await Promise.allSettled(eventPromises);

    state.lastUpdate = new Date();

    if (errori.length > 0) {
        state.erroriRete += 1;
        console.warn('[admin-gioco] Errori parziali sincronizzazione:', errori);
        setConnectionError(
            errori.length === 1
                ? errori[0]
                : `${errori.length} errori di sincronizzazione. I dati potrebbero essere incompleti.`
        );
        return false;
    }

    state.erroriRete = 0;
    setConnectionError(null);
    return true;
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

    await fetchAllData();
    renderAll();

    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
        await fetchAllData();
        renderAll();
    }, REFRESH_MS);
}

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

    if (!state.giochi.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-ico">🎮</div>
                Nessun tavolo installato registrato nel database.
            </div>`;
        return;
    }

    const sorted = [...state.giochi].sort((a, b) =>
        (a.localeNome || '').localeCompare(b.localeNome || '') || (a.id - b.id)
    );

    grid.innerHTML = sorted.map(g => {
        const gid = idGioco(g);
        const tipo = g.tipoGioco || nomeTipologia(g.tipologiaId);
        const localeNome = g.localeNome || '—';
        const statoBadge = badgeStatoGioco(g.stato);
        const cardClass = g.stato === 'IN_USO' ? 'in-uso' : (g.stato === 'GUASTO' ? 'guasto' : '');
        const numSensori = g.numSensori ?? (state.sensoriCache[gid] || []).length;

        return `
            <div class="tavolo-card ${cardClass}">
                <div class="tavolo-head">
                    <div class="tavolo-ico">${iconaGioco(tipo, g.tipologiaId)}</div>
                    <div style="flex:1;min-width:0">
                        <div class="tavolo-name">${escapeHtml(tipo)}</div>
                        <div class="tavolo-meta">${escapeHtml(localeNome)}</div>
                    </div>
                </div>
                <div class="tavolo-stato">
                    <span class="badge ${statoBadge.cls}">${statoBadge.label}</span>
                </div>
                <div class="tavolo-footer">
                    <span class="tavolo-id">ID #${gid}</span>
                    <span style="font-size:9px;color:var(--txt3)">${numSensori} sensori</span>
                </div>
            </div>`;
    }).join('');
}

function trovaGioco(idGiocoInstallato) {
    return state.giochi.find(g => idGioco(g) === idGiocoInstallato) || null;
}

function renderPartiteLive() {
    const grid = document.getElementById('partite-live');
    if (!grid) return;

    const live = state.partite.filter(p => (p.stato || '').toUpperCase() === 'IN_CORSO');

    if (!live.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-ico">🟢</div>
                Nessuna partita attiva nel sistema in questo momento.
            </div>`;
        return;
    }

    grid.innerHTML = live.map(p => {
        const pid = idPartita(p);
        const gioco = trovaGioco(p.idGiocoInstallato);
        const tipoGioco = gioco?.tipoGioco || nomeTipologia(gioco?.tipologiaId);
        const localeNome = gioco?.localeNome || '—';
        const sensori = state.sensoriCache[p.idGiocoInstallato] || [];
        const eventi = state.eventiCache[pid] || [];
        const score = calcolaPunteggi(p, eventi, sensori);
        const sec = secondiTrascorsi(p);

        return `
            <div class="live-card" data-partita-id="${pid}">
                <div class="live-head">
                    <span class="live-dot"></span>
                    <div class="live-title">${iconaGioco(tipoGioco, gioco?.tipologiaId)} ${escapeHtml(tipoGioco)}</div>
                    <span class="badge b-grn">LIVE</span>
                    <div class="live-time" data-timestamp-inizio="${escapeAttr(p.timestampInizio || '')}">
                        ${formatDurata(sec)}
                    </div>
                </div>

                <div class="scoreboard">
                    <div class="score-team">
                        <div class="score-team-name">Squadra 1</div>
                        <div class="score-team-val">${score.p1}</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-team">
                        <div class="score-team-name">Squadra 2</div>
                        <div class="score-team-val">${score.p2}</div>
                    </div>
                </div>

                <div class="live-meta">
                    <span>📍 ${escapeHtml(localeNome)}</span>
                    <span>📡 ${eventi.length} eventi IoT</span>
                    ${score.daEventi ? '<span style="color:var(--amb)">· da sensori</span>' : '<span style="color:var(--grn)">· da DB</span>'}
                </div>

                <div class="live-actions">
                    <button class="act-btn btn-dettagli" data-id="${pid}">Dettagli</button>
                    <button class="danger-btn btn-termina" data-id="${pid}">Termina partita</button>
                </div>
            </div>`;
    }).join('');

    grid.querySelectorAll('.btn-termina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            apriModaleTermina(e.currentTarget.getAttribute('data-id'));
        });
    });

    grid.querySelectorAll('.btn-dettagli').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = e.currentTarget.getAttribute('data-id');
            const partita = state.partite.find(p => String(idPartita(p)) === String(pid));
            const eventi = state.eventiCache[pid] || [];
            const sensori = state.sensoriCache[partita?.idGiocoInstallato] || [];
            console.log(`[admin-gioco] Dettaglio partita #${pid}:`, { partita, eventi, sensori });
            showToast(`Partita #${pid}: ${eventi.length} eventi IoT, ${sensori.length} sensori mappati.`, 'info');
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

    if (!concluse.length) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align:center;padding:20px;color:var(--txt3)">
                Nessuno storico presente nel DB.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = concluse.map(p => {
        const pid = idPartita(p);
        const gioco = trovaGioco(p.idGiocoInstallato);
        const tipoGioco = gioco?.tipoGioco || nomeTipologia(gioco?.tipologiaId);
        const localeNome = gioco?.localeNome || '—';
        const sensori = state.sensoriCache[p.idGiocoInstallato] || [];
        const eventi = state.eventiCache[pid] || [];
        const score = calcolaPunteggi(p, eventi, sensori);
        const sec = secondiTrascorsi(p);

        let esito = '—', esitoCls = 'b-blu';
        if (score.p1 > score.p2) { esito = 'Squadra 1'; esitoCls = 'b-grn'; }
        else if (score.p2 > score.p1) { esito = 'Squadra 2'; esitoCls = 'b-grn'; }
        else { esito = 'Pareggio'; esitoCls = 'b-amb'; }

        return `
            <tr>
                <td style="font-family:monospace;font-size:11px;color:var(--txt3)">#${pid}</td>
                <td>${iconaGioco(tipoGioco, gioco?.tipologiaId)} ${escapeHtml(tipoGioco)}</td>
                <td style="font-size:11px">${escapeHtml(localeNome)}</td>
                <td style="font-family:var(--ff);font-weight:700">${score.p1} – ${score.p2}</td>
                <td style="font-family:monospace;font-size:11px">${formatDurata(sec)}</td>
                <td style="font-size:11px">${formatDataBreve(p.timestampFine)}</td>
                <td><span class="badge ${esitoCls}">${esito}</span></td>
            </tr>`;
    }).join('');
}

/* =====================================================
 * AZIONE: TERMINA PARTITA  →  PUT /api/partite/{id}/termina
 * ===================================================== */

function apriModaleTermina(idPartitaVal) {
    pendingTerminazione = idPartitaVal;
    const modal = document.getElementById('modal-termina');
    const label = document.getElementById('modal-partita-id');
    if (label) label.textContent = '#' + idPartitaVal;
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
            showToast(`Partita #${id} non trovata (404).`, 'warning', 5000);
        } else {
            showToast(`Partita #${id} terminata. Punteggio: ${result.punteggio1}–${result.punteggio2}.`, 'success');
        }
        await fetchAllData();
        renderAll();
    } catch (error) {
        console.error('[admin-gioco] Errore terminazione:', error);
        showToast(messaggioErrore(error), 'error', 5000);
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
    state.sensoriCache = {};
    state.lastUpdate = null;
}

export {
    iconaGioco,
    formatDurata,
    badgeStatoGioco,
    badgeStatoPartita,
    calcolaPunteggi
};
