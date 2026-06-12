/**
 * file: player.js
 * Vista Giocatore
 */

import * as Api from '../js/api.js';
import { iconaGioco } from '../js/game-icons.js';

let playerContext = { id: null, name: '', initials: '??', role: 'Giocatore' };
let lookupCache = { locali: {}, giochi: {}, tipologie: {} };

/* =====================================================
 * UTILITIES
 * ===================================================== */

export function setPlayerContext(userData) {
    if (!userData) return;
    playerContext = {
        id: userData.id,
        name: userData.name || 'Giocatore',
        initials: userData.initials || '??',
        role: userData.role || 'Giocatore'
    };
    if (userData.id) localStorage.setItem('userId', String(userData.id));
}

function getUserId() {
    return playerContext.id || localStorage.getItem('userId');
}

function esc(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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
 * Normalizza StatisticaUtenteDTO
 * Campi vista SQL: partite_giocate → partiteGiocate, nome_gioco → nomeGioco, id_locale → idLocale
 */
function normalizeStats(raw) {
    if (!raw) {
        return {
            partiteGiocate: 0, vittorie: 0, punteggioTotale: 0,
            nomeGioco: null, idLocale: null
        };
    }
    return {
        partiteGiocate: raw.partiteGiocate ?? raw.partite_giocate ?? 0,
        vittorie: raw.vittorie ?? 0,
        punteggioTotale: raw.punteggioTotale ?? raw.punteggio_totale ?? 0,
        nomeGioco: raw.nomeGioco ?? raw.nome_gioco ?? null,
        idLocale: raw.idLocale ?? raw.id_locale ?? null
    };
}

function calcWinRate(partite, vittorie) {
    return partite > 0 ? Math.round((vittorie / partite) * 100) : 0;
}

function formatData(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso).slice(0, 16);
        return d.toLocaleDateString('it-IT', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return '—'; }
}

async function loadLookups() {
    try {
        const [locali, giochi, tipologie] = await Promise.all([
            Api.getAllLocali().catch(() => []),
            Api.getAllGiochiInstallati().catch(() => []),
            Api.getAllTipologieGioco().catch(() => [])
        ]);
        lookupCache.locali = {};
        locali.forEach(l => { lookupCache.locali[l.id] = l.nome; });
        lookupCache.giochi = {};
        giochi.forEach(g => {
            lookupCache.giochi[g.id] = g.tipoGioco || `Tavolo #${g.id}`;
        });
        lookupCache.tipologie = {};
        tipologie.forEach(t => { lookupCache.tipologie[t.id] = t.nome; });
    } catch (_) { /* lookup opzionale */ }
}

function nomeGiocoDaId(giocoId) {
    return lookupCache.giochi[giocoId] || `Gioco #${giocoId}`;
}

function nomeLocaleDaId(idLocale) {
    if (!idLocale || idLocale === '-') return '—';
    const id = Number(idLocale);
    return lookupCache.locali[id] || `Locale #${idLocale}`;
}

function emptyState(msg, ico = '🎮') {
    return `
        <div class="empty-state" style="padding:48px 20px">
            <div class="empty-ico" style="font-size:48px;opacity:.5">${ico}</div>
            <div style="font-size:14px;font-weight:600;color:var(--txt2);margin-top:12px">${esc(msg)}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:6px">I dati appariranno dopo la tua prima partita.</div>
        </div>`;
}

/* =====================================================
 * OVERVIEW
 * ===================================================== */

export function playerOverview() {
    setTimeout(() => initOverview(), 0);
    return `
        <div class="pg-title">Overview</div>
        <div class="pg-sub">Il tuo riepilogo personale su PlayNode</div>
        <div id="player-overview-root">
            <div class="empty-state"><div class="empty-ico">⏳</div>Caricamento statistiche…</div>
        </div>`;
}

async function initOverview() {
    const root = document.getElementById('player-overview-root');
    const userId = getUserId();
    if (!root) return;

    if (!userId) {
        root.innerHTML = emptyState('Utente non autenticato.', '🔒');
        return;
    }

    let stats = null, history = [];
    try {
        await loadLookups();
        [stats, history] = await Promise.all([
            Api.getUserStats(userId),
            Api.getUserHistory(userId)
        ]);
    } catch (err) {
        showToast(err.message || 'Errore caricamento dati.', 'error', 5000);
    }

    const s = normalizeStats(stats);
    const winRate = calcWinRate(s.partiteGiocate, s.vittorie);
    const ultimoGioco = s.nomeGioco && s.nomeGioco !== 'Nessuna Partita' ? s.nomeGioco : '—';
    const ultimoLocale = nomeLocaleDaId(s.idLocale);

    const sortedHistory = [...(history || [])].sort((a, b) => {
        const ta = a.dataPartita ? new Date(a.dataPartita).getTime() : 0;
        const tb = b.dataPartita ? new Date(b.dataPartita).getTime() : 0;
        return tb - ta;
    });
    const recent = sortedHistory.slice(0, 5);

    const allHistory = history || [];
    const totalMatches = allHistory.length;
    const counts = allHistory.reduce((acc, m) => {
        const giocoTipo = lookupCache.giochi[m.giocoId];
        const tipoNome = lookupCache.tipologie[giocoTipo] || giocoTipo || nomeGiocoDaId(m.giocoId) || `Gioco #${m.giocoId}`;
        acc[tipoNome] = (acc[tipoNome] || 0) + 1;
        return acc;
    }, {});
    const distributionEntries = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    root.innerHTML = `
        <div class="stats-row">
            <div class="scard">
                <div class="scard-lbl">Partite giocate</div>
                <div class="scard-val">${s.partiteGiocate}</div>
                <div class="scard-delta neutral">totale carriera</div>
            </div>
            <div class="scard">
                <div class="scard-lbl">Vittorie</div>
                <div class="scard-val" style="color:var(--grn)">${s.vittorie}</div>
                <div class="scard-delta up">partite vinte</div>
            </div>
            <div class="scard">
                <div class="scard-lbl">Win Rate</div>
                <div class="scard-val" style="color:var(--acc2)">${winRate}%</div>
                <div class="scard-delta neutral">vittorie / partite</div>
            </div>
            <div class="scard">
                <div class="scard-lbl">Punteggio totale</div>
                <div class="scard-val" style="color:var(--gold)">${s.punteggioTotale}</div>
                <div class="scard-delta neutral">punti accumulati</div>
            </div>
        </div>

        <div class="row2" style="margin-top:12px;display:flex;gap:16px;align-items:flex-start">
            <div class="card" style="flex:1">
                <div class="card-hd">Ultimo gioco</div>
                <div class="list-row">
                    <span style="font-size:22px">${iconaGioco(ultimoGioco)}</span>
                    <div style="flex:1">
                        <div class="rname">${esc(ultimoGioco)}</div>
                        <div class="rmeta">📍 ${esc(ultimoLocale)}</div>
                    </div>
                </div>
                <div style="margin-top:12px">
                    <div class="card-hd" style="font-size:13px;margin-bottom:8px">Ultime partite</div>
                    ${recent.length ? recent.map(m => {
        const vittoria = m.punteggioOttenuto > 0;
        return `
                            <div class="match-row">
                                <span class="m-ico">${iconaGioco(nomeGiocoDaId(m.giocoId))}</span>
                                <div class="m-info">
                                    <div class="m-title">Partita #${m.id}</div>
                                    <div class="m-meta">${formatData(m.dataPartita)}</div>
                                </div>
                                <span class="m-score">${m.punteggioOttenuto} pt</span>
                                <span class="result ${vittoria ? 'win' : 'loss'}">${vittoria ? 'Vinta' : '—'}</span>
                            </div>`;
    }).join('') : '<div style="font-size:11px;color:var(--txt3);padding:12px 0">Nessuna partita recente.</div>'}
                </div>
            </div>

            <div class="card" style="flex:1">
                <div class="card-hd">Statistiche giochi giocati</div>
                <div style="margin-top:8px">
                    ${totalMatches === 0 ? `
                        <div style="padding:18px 12px;color:var(--txt3);font-size:13px">Nessun dato di distribuzione disponibile</div>
                    ` : `
                        ${distributionEntries.map((nome, idx) => {
        const cnt = counts[nome] || 0;
        let pct = Math.round((cnt / totalMatches) * 100) || 0;
        pct = Math.max(0, Math.min(100, pct));

        function getColorForGame(n) {
            if (!n) return null;
            const k = (n || '').trim().toLowerCase();

            // Mappatura esplicita per nomi tipologia esatti (o molto probabili)
            const explicit = {
                'calciobalilla smart': 'var(--neon-blue, #3b82f6)',
                'calciobalilla': 'var(--neon-blue, #3b82f6)',
                'calcio balilla': 'var(--neon-blue, #3b82f6)',
                'calcio balilla smart': 'var(--neon-blue, #3b82f6)',
                'bocce elettroniche': 'var(--neon-red, #ef4444)',
                'bocce': 'var(--neon-red, #ef4444)',
                'biliardo': 'var(--neon-amber, #f59e0b)',
                'biliardo classic': 'var(--neon-amber, #f59e0b)',
                'ping pong': 'var(--neon-pink, #ec4899)',
                'air hockey': 'var(--neon-green, #10b981)'
            };

            if (explicit[k]) return explicit[k];

            // Fallback a regole di match parziale se non troviamo la stringa esatta
            if (k.includes('calci') || k.includes('calcio') || k.includes('futbol') || k.includes('football')) return 'var(--neon-blue, #3b82f6)';
            if (k.includes('bocc')) return 'var(--neon-red, #ef4444)';
            if (k.includes('biliard') || k.includes('billiard')) return 'var(--neon-amber, #f59e0b)';
            if (k.includes('ping') || k.includes('pong')) return 'var(--neon-pink, #ec4899)';
            if (k.includes('air') || k.includes('arcade')) return 'var(--neon-green, #10b981)';
            return null;
        }

        const fallbackColors = ['var(--neon-blue, #3b82f6)', 'var(--neon-green, #10b981)', 'var(--neon-pink, #ec4899)', 'var(--neon-amber, #f59e0b)'];
        const mapped = getColorForGame(nome);
        const color = mapped || fallbackColors[idx % fallbackColors.length];

        const glow = pct === 100 ? `box-shadow:0 0 12px ${color};` : '';

        return `
                                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                                    <div style="width:40px;font-size:20px">${iconaGioco(nome)}</div>
                                    <div style="flex:1;min-width:0">
                                        <div style="display:flex;justify-content:space-between;align-items:center">
                                            <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nome)}</div>
                                            <div style="font-size:12px;color:var(--txt2);margin-left:8px">${pct}%</div>
                                        </div>
                                        <div style="height:10px;background:rgba(255,255,255,0.04);border-radius:6px;margin-top:6px;overflow:hidden">
                                            <div style="height:100%;width:${pct}%;background:${color};border-radius:6px;${glow}"></div>
                                        </div>
                                    </div>
                                </div>`;
    }).join('')}
                    `}
                </div>
            </div>
        </div>`;
}

/* =====================================================
 * STORICO PARTITE
 * ===================================================== */

export function playerHistory() {
    setTimeout(() => initHistory(), 0);
    return `
        <div class="pg-title">Storico Partite</div>
        <div class="pg-sub">Tutte le partite registrate — vista <code style="font-size:10px">storico_partita</code></div>
        <div class="card">
            <table class="tbl">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Gioco</th>
                        <th>Data</th>
                        <th>Punteggio</th>
                    </tr>
                </thead>
                <tbody id="player-history-tbody">
                    <tr><td colspan="4" style="text-align:center;padding:24px;color:var(--txt3)">Caricamento…</td></tr>
                </tbody>
            </table>
        </div>`;
}

async function initHistory() {
    const tbody = document.getElementById('player-history-tbody');
    const userId = getUserId();
    if (!tbody) return;

    if (!userId) {
        tbody.innerHTML = `<tr><td colspan="4">${emptyState('Sessione non valida.', '🔒')}</td></tr>`;
        return;
    }

    let history = [];
    try {
        await loadLookups();
        history = await Api.getUserHistory(userId);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--red)">${esc(err.message)}</td></tr>`;
        showToast(err.message, 'error', 5000);
        return;
    }

    if (!history.length) {
        tbody.innerHTML = `<tr><td colspan="4">${emptyState('Nessuna partita giocata finora', '🏟️')}</td></tr>`;
        return;
    }

    const sorted = [...history].sort((a, b) => {
        const ta = a.dataPartita ? new Date(a.dataPartita).getTime() : 0;
        const tb = b.dataPartita ? new Date(b.dataPartita).getTime() : 0;
        return tb - ta;
    });

    tbody.innerHTML = sorted.map(m => `
        <tr>
            <td style="font-family:monospace;font-size:11px;color:var(--txt3)">#${m.id}</td>
            <td>${iconaGioco(nomeGiocoDaId(m.giocoId))} ${esc(nomeGiocoDaId(m.giocoId))}
                <span style="font-size:9px;color:var(--txt3)"> (tavolo #${m.giocoId})</span>
            </td>
            <td style="font-size:11px">${formatData(m.dataPartita)}</td>
            <td style="font-family:var(--ff);font-weight:700;color:var(--acc2)">${m.punteggioOttenuto ?? 0}</td>
        </tr>
    `).join('');
}

/* =====================================================
 * I MIEI TORNEI
 * ===================================================== */

export function playerTournaments() {
    setTimeout(() => initTournaments(), 0);
    return `
        <div class="pg-title">I miei Tornei</div>
        <div class="pg-sub">Tornei attivi e classifiche — tournament-service /api/tornei</div>
        <div id="player-tornei-root">
            <div class="empty-state"><div class="empty-ico">⏳</div>Caricamento tornei…</div>
        </div>`;
}

function badgeTorneo(classifica, dataFine) {
    const c = (classifica || '').toLowerCase();
    if (c.includes('terminat')) return { cls: 'b-blu', label: classifica || 'Terminato' };
    if (c.includes('corso') || c.includes('definire')) return { cls: 'b-grn', label: classifica || 'In corso' };
    if (!dataFine) return { cls: 'b-grn', label: 'Attivo' };
    return { cls: 'b-amb', label: classifica || 'In arrivo' };
}

async function initTournaments() {
    const root = document.getElementById('player-tornei-root');
    if (!root) return;

    let tornei = [], tipologie = [];
    try {
        [tornei, tipologie] = await Promise.all([
            Api.getAllTournaments(),
            Api.getAllTipologieGioco()
        ]);
    } catch (err) {
        root.innerHTML = `<div style="padding:24px;color:var(--red);text-align:center">${esc(err.message)}</div>`;
        showToast(err.message, 'error', 5000);
        return;
    }

    const nomiGiochi = {};
    tipologie.forEach(t => { nomiGiochi[t.id] = t.nome; });

    if (!tornei.length) {
        root.innerHTML = emptyState('Nessun torneo disponibile al momento.', '🏆');
        return;
    }

    const sorted = [...tornei].sort((a, b) => {
        const ta = a.dataInizio ? new Date(a.dataInizio).getTime() : 0;
        const tb = b.dataInizio ? new Date(b.dataInizio).getTime() : 0;
        return tb - ta;
    });

    root.innerHTML = sorted.map(t => {
        const nomeGioco = nomiGiochi[t.idTipologiaGioco] || 'Gioco';
        const badge = badgeTorneo(t.classifica, t.dataFine);
        const dateStr = t.dataFine
            ? `${t.dataInizio} → ${t.dataFine}`
            : `Dal ${t.dataInizio}`;
        return `
            <div class="card" style="margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                    <span style="font-size:22px">${iconaGioco(nomeGioco)}</span>
                    <div style="flex:1;min-width:0">
                        <div style="font-family:var(--ff);font-size:14px;font-weight:700">${esc(t.nome)}</div>
                        <div style="font-size:10px;color:var(--txt3);margin-top:2px">${esc(nomeGioco)} · ${esc(t.modalita || '—')}</div>
                    </div>
                    <span class="badge ${badge.cls}">${esc(badge.label)}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;font-size:11px;color:var(--txt2)">
                    <div>📅 ${esc(dateStr)}</div>
                    <div>📋 ${esc((t.regole || '—').slice(0, 60))}${(t.regole || '').length > 60 ? '…' : ''}</div>
                </div>
                <div style="border-top:1px solid var(--bdr);padding-top:10px;font-size:11px;color:var(--txt3)">
                    Classifica: <strong style="color:var(--txt)">${esc(t.classifica || 'Da definire')}</strong>
                    ${t.localiIds?.length ? ` · ${t.localiIds.length} locali` : ''}
                </div>
            </div>`;
    }).join('');
}

/* =====================================================
 * PROFILO
 * ===================================================== */

export function playerProfile() {
    setTimeout(() => initProfile(), 0);
    return `
        <div class="pg-title">Profilo</div>
        <div class="pg-sub">I tuoi dati account e statistiche aggregate</div>
        <div id="player-profile-root">
            <div class="empty-state"><div class="empty-ico">⏳</div>Caricamento profilo…</div>
        </div>`;
}

async function initProfile() {
    const root = document.getElementById('player-profile-root');
    const userId = getUserId();
    if (!root) return;

    if (!userId) {
        root.innerHTML = emptyState('Sessione non valida.', '🔒');
        return;
    }

    let utente = null, stats = null;
    try {
        [utente, stats] = await Promise.all([
            Api.getUtenteById(userId).catch(() => null),
            Api.getUserStats(userId)
        ]);
    } catch (err) {
        root.innerHTML = `<div style="padding:24px;color:var(--red)">${esc(err.message)}</div>`;
        showToast(err.message, 'error', 5000);
        return;
    }

    const s = normalizeStats(stats);
    const winRate = calcWinRate(s.partiteGiocate, s.vittorie);
    const username = utente?.username || playerContext.name || '—';
    const email = utente?.email || '—';
    const ruolo = utente?.ruolo || playerContext.role || 'Giocatore';
    const sesso = utente?.sesso || '—';
    const initials = playerContext.initials
        || (username !== '—' ? username.substring(0, 2).toUpperCase() : '??');

    root.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:18px;background:var(--surf);border:1px solid var(--bdr);border-radius:12px">
            <div style="width:64px;height:64px;border-radius:14px;background:var(--acc3);border:2px solid var(--acc);display:flex;align-items:center;justify-content:center;font-family:var(--ff);font-size:24px;font-weight:800;color:var(--acc2)">${esc(initials)}</div>
            <div style="flex:1">
                <div style="font-family:var(--ff);font-size:20px;font-weight:700">${esc(username)}</div>
                <div style="font-size:12px;color:var(--txt3);margin-top:4px">${esc(email)}</div>
                <div style="margin-top:8px;display:flex;gap:6px">
                    <span class="badge b-blu">${esc(ruolo)}</span>
                    <span class="badge b-amb">${esc(sesso)}</span>
                </div>
            </div>
        </div>

        <div class="stats-row">
            <div class="scard"><div class="scard-lbl">Partite</div><div class="scard-val">${s.partiteGiocate}</div></div>
            <div class="scard"><div class="scard-lbl">Vittorie</div><div class="scard-val" style="color:var(--grn)">${s.vittorie}</div></div>
            <div class="scard"><div class="scard-lbl">Win Rate</div><div class="scard-val">${winRate}%</div></div>
            <div class="scard"><div class="scard-lbl">Punteggio</div><div class="scard-val" style="color:var(--gold)">${s.punteggioTotale}</div></div>
        </div>

        <div class="card" style="margin-top:12px">
            <div class="card-hd">Dettagli account</div>
            <div class="list-row"><span style="color:var(--txt3);font-size:11px;width:100px">ID utente</span><span style="font-family:monospace;font-size:12px">#${userId}</span></div>
            <div class="list-row"><span style="color:var(--txt3);font-size:11px;width:100px">Username</span><span style="font-size:12px">${esc(username)}</span></div>
            <div class="list-row"><span style="color:var(--txt3);font-size:11px;width:100px">Email</span><span style="font-size:12px">${esc(email)}</span></div>
            <div class="list-row"><span style="color:var(--txt3);font-size:11px;width:100px">Ruolo</span><span class="badge b-blu">${esc(ruolo)}</span></div>
            <div class="list-row"><span style="color:var(--txt3);font-size:11px;width:100px">Sesso</span><span style="font-size:12px">${esc(sesso)}</span></div>
        </div>`;
}

export function disposePlayerDashboard() {
    lookupCache = { locali: {}, giochi: {}, tipologie: {} };
}
