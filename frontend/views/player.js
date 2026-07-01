/**
 * file: player.js
 * Vista Giocatore
 */

import * as Api from '../js/api.js';
import { iconaGioco, coloreGioco } from '../js/game-icons.js';

let playerContext = { id: null, name: '', initials: '??', role: 'Giocatore' };
let lookupCache = { locali: {}, giochi: {}, tipologie: {} };

/* =====================================================
 * UTILITIES
 * ===================================================== */

export function setPlayerContext(userData) {
    if (!userData)
        return;
    playerContext = {
        id: userData.id,
        name: userData.name || 'Giocatore',
        initials: userData.initials || '??',
        role: userData.role || 'Giocatore'
    };
    if (userData.id)
        localStorage.setItem('userId', String(userData.id));
}

function getUserId() {
    return playerContext.id || localStorage.getItem('userId');
}

function esc(s) {
    if (s == null)
        return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    if (!iso)
        return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso).slice(0, 16);
        return d.toLocaleDateString('it-IT', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return '—';
    }
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
    } catch (_) {

    }
}

function nomeGiocoDaId(giocoId) {
    return lookupCache.giochi[giocoId] || `Gioco #${giocoId}`;
}

function nomeLocaleDaId(idLocale) {
    if (!idLocale || idLocale === '-')
        return '—';
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
    if (!root)
        return;

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
        window.showToast(err.message || 'Errore caricamento dati.', 'error', 5000);
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

        const fallbackColors = ['var(--neon-blue, #3b82f6)', 'var(--neon-green, #10b981)', 'var(--neon-pink, #ec4899)', 'var(--neon-amber, #f59e0b)'];
        const mapped = coloreGioco(nome);
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
        <div class="pg-sub">Tutte le partite registrate</div>
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
        window.showToast(err.message, 'error', 5000);
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
        <div class="pg-sub">Tornei attivi e classifiche</div>
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
// Modale per l'iscrizione a squadre
async function showSquadreModal(torneoId, tipologiaGiocoId, onSuccess) {
    // 1. Rimuovi modali precedenti se esistono
    const existing = document.getElementById('modal-squadre');
    if (existing) existing.remove();

    // 2. Recupera le squadre dal backend
    let squadre = [];
    try {
        if (tipologiaGiocoId) {
            squadre = await Api.getSquadreByGioco(tipologiaGiocoId);
        } else {
            squadre = await Api.getAllSquadre();
        }
    } catch (err) {
        console.error("Errore nel recupero squadre:", err);
        window.showToast("Impossibile caricare le squadre", "error");
    }

    // 3. Costruisci l'HTML del modale
    const modalHtml = `
    <div id="modal-squadre" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;">
        <div class="card" style="width:90%;max-width:400px;background:var(--bg);padding:24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="margin-top:0;margin-bottom:16px;font-family:var(--ff);">Iscrizione a Squadre</h3>
            
            <div style="margin-bottom:16px;">
                <label style="font-size:12px;font-weight:600;color:var(--txt3);">Seleziona una squadra esistente:</label>
                <select id="select-squadra" style="width:100%;padding:8px 12px;margin-top:4px;background:var(--surf);color:var(--txt);border:1px solid var(--bdr);border-radius:6px;outline:none;">
                    <option value="">-- Scegli una squadra --</option>
                    ${squadre.map(s => `<option value="${s.idSquadra}">${esc(s.nomeSquadra)}</option>`).join('')}
                </select>
                ${squadre.length === 0 ? '<div style="font-size:10px;color:var(--txt3);margin-top:4px;">Nessuna squadra disponibile al momento.</div>' : ''}
            </div>

            <div style="text-align:center;margin-bottom:16px;color:var(--txt3);font-size:11px;font-weight:bold;">OPPURE</div>

            <div style="margin-bottom:24px;">
                <label style="font-size:12px;font-weight:600;color:var(--txt3);">Crea una nuova squadra:</label>
                <input type="text" id="input-nuova-squadra" placeholder="Nome nuova squadra" style="width:100%;padding:8px 12px;margin-top:4px;background:var(--surf);color:var(--txt);border:1px solid var(--bdr);border-radius:6px;outline:none;">
            </div>

            <div style="display:flex;justify-content:flex-end;gap:12px;">
                <button id="btn-annulla-squadre" class="act-btn" style="background:transparent;border:1px solid var(--bdr);color:var(--txt)">Annulla</button>
                <button id="btn-conferma-squadre" class="act-btn">Conferma Iscrizione</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 4. Gestione eventi del modale
    const modal = document.getElementById('modal-squadre');
    const selectSquadra = document.getElementById('select-squadra');
    const inputNuovaSquadra = document.getElementById('input-nuova-squadra');
    const btnAnnulla = document.getElementById('btn-annulla-squadre');
    const btnConferma = document.getElementById('btn-conferma-squadre');

    // Muto-esclusione visiva per guidare l'utente
    selectSquadra.addEventListener('change', () => {
        if(selectSquadra.value) inputNuovaSquadra.value = '';
    });
    inputNuovaSquadra.addEventListener('input', () => {
        if(inputNuovaSquadra.value.trim()) selectSquadra.value = '';
    });

    btnAnnulla.addEventListener('click', () => modal.remove());

    btnConferma.addEventListener('click', async () => {
        let squadraId = selectSquadra.value;
        const nuovaSquadraNome = inputNuovaSquadra.value.trim();

        if (!squadraId && !nuovaSquadraNome) {
            window.showToast('Devi selezionare o creare una squadra per iscriverti.', 'warning');
            return;
        }

        btnConferma.innerText = 'Attendere...';
        btnConferma.disabled = true;

        try {
            if (nuovaSquadraNome) {
                const req = {
                    nomeSquadra: nuovaSquadraNome,
                    idTipologiaGioco: tipologiaGiocoId,
                    membriIds: [] // l'utente corrente potrebbe essere aggiunto nel backend o qui se conoscessimo il suo ID
                };
                const nuovaSquadra = await Api.creaSquadra(req);
                squadraId = nuovaSquadra.idSquadra;
            }

            // Nota: quando implementerai l'API lato backend per l'iscrizione a squadre associando l'iscrizione alla squadra,
            // potrai inviare `squadraId` al torneo.
            // Per ora usiamo il fallback standard `Api.iscriviTorneo` che iscrive solo l'utente.
            await Api.iscriviTorneo(torneoId);

            window.showToast('Iscrizione a squadre completata con successo.', 'success');
            modal.remove();
            if (onSuccess) onSuccess();
        } catch (err) {
            btnConferma.innerText = 'Conferma Iscrizione';
            btnConferma.disabled = false;
            window.showToast(err.message || 'Iscrizione non riuscita.', 'error', 5000);
        }
    });
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

        // Recupera i dettagli per verificare l'iscrizione dell'utente corrente
        const dettagliPromises = tornei.map(t => Api.getTournamentDettaglio(t.id).catch(() => null));
        const dettagli = await Promise.all(dettagliPromises);

        tornei.forEach((t, index) => {
            if (dettagli[index] && dettagli[index].iscrittoUtenteCorrente) {
                t.giaIscritto = true;
            }
        });

    } catch (err) {
        root.innerHTML = `<div style="padding:24px;color:var(--red);text-align:center">${esc(err.message)}</div>`;
        window.showToast(err.message, 'error', 5000);
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
        const terminato = (t.classifica || '').toLowerCase().includes('terminat');

        // Aggiungiamo data-modalita al bottone per sapere che tipo di iscrizione gestire
        const pulsanteIscriviti = (terminato || t.giaIscritto)
            ? (t.giaIscritto ? `<span style="font-size:11px;color:var(--grn);font-weight:bold;">✓ Già Iscritto</span>` : '')
            : `<button class="act-btn btn-iscriviti-torneo" data-id="${t.id}" data-modalita="${t.modalita || ''}" data-gioco-id="${t.idTipologiaGioco}" style="font-size:11px">Iscriviti</button>`;

        return `
            <div class="card" style="margin-bottom:10px" data-torneo-id="${t.id}">
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
                <div style="border-top:1px solid var(--bdr);padding-top:10px;display:flex;justify-content:space-between;align-items:center;gap:8px">
                    <div style="font-size:11px;color:var(--txt3)">
                        Classifica: <strong style="color:var(--txt)">${esc(t.classifica || 'Da definire')}</strong>
                    </div>
                    ${pulsanteIscriviti}
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('.btn-iscriviti-torneo').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const modalita = (e.target.getAttribute('data-modalita') || '').toUpperCase();
            const idTipologiaGioco = e.target.getAttribute('data-gioco-id');

            // Definiamo la callback di successo per aggiornare l'interfaccia istantaneamente
            const onSuccessAction = () => {
                const container = e.target.parentElement;
                e.target.remove();
                container.insertAdjacentHTML('beforeend', '<span style="font-size:11px;color:var(--grn);font-weight:bold;">✓ Già Iscritto</span>');
            };

            // Controlla se la modalità richiede il modale delle squadre
            if (modalita.includes('SQUADR')) {
                showSquadreModal(id, idTipologiaGioco, onSuccessAction);
                return;
            }

            // --- Flusso iscrizione individuale (esistente) ---
            const originalText = e.target.innerText;
            e.target.innerText = 'Attendere...';
            e.target.disabled = true;

            try {
                await Api.iscriviTorneo(id);
                window.showToast('Iscrizione al torneo completata.', 'success');
                onSuccessAction();
            } catch (err) {
                e.target.innerText = originalText;
                e.target.disabled = false;
                window.showToast(err.message || 'Iscrizione non riuscita.', 'error', 5000);
            }
        });
    });
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
            Api.getUserStats(userId).catch(() => null)
        ]);
    } catch (err) {
        root.innerHTML = `<div style="padding:24px;color:var(--red)">${esc(err.message)}</div>`;
        window.showToast(err.message, 'error', 5000);
        return;
    }

    let isEditing = false;

    function renderProfile() {
        if (!root) return;
        const s = normalizeStats(stats);
        const winRate = calcWinRate(s.partiteGiocate, s.vittorie);
        const username = utente?.username || playerContext.name || '—';
        const email = utente?.email || '—';
        const ruolo = utente?.ruolo || playerContext.role || 'Giocatore';
        const sesso = utente?.sesso || '—';
        const initials = playerContext.initials
            || (username !== '—' ? username.substring(0, 2).toUpperCase() : '??');

        const unifiedView = `
            <form id="form-profilo" autocomplete="off" style="display:grid;gap:0;max-width:480px;padding-top:8px;" onsubmit="event.preventDefault();">
                <div class="list-row">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;">ID utente</span>
                    <span style="font-family:monospace;font-size:12px;color:var(--txt3);flex:1">#${userId}</span>
                </div>
                
                <label class="list-row" style="cursor:pointer">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;">Username</span>
                    ${isEditing 
                        ? `<input id="prof-username" name="username" autocomplete="username" type="text" value="${esc(username)}" style="flex:1;padding:8px 12px;border:1px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);transition:all 0.2s">`
                        : `<span style="font-size:12px;color:var(--txt);flex:1">${esc(username)}</span>`
                    }
                </label>
                
                <div class="list-row" style="align-items:flex-start">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;padding-top:4px">Email</span>
                    <div style="display:flex;flex-direction:column;flex:1">
                        ${isEditing 
                            ? `<span style="font-size:12px;color:var(--txt3);background:var(--surf);padding:8px 12px;border-radius:6px;border:1px solid var(--bdr);display:inline-block;cursor:not-allowed;">${esc(email)}</span>
                               <span style="font-size:10px;color:var(--txt3);margin-top:4px">(L'email non è modificabile)</span>`
                            : `<span style="font-size:12px;color:var(--txt);padding-top:3px">${esc(email)}</span>`
                        }
                    </div>
                </div>
                
                <label class="list-row" style="cursor:pointer">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;">Sesso</span>
                    ${isEditing 
                        ? `<select id="prof-sesso" name="sesso" style="flex:1;padding:8px 12px;border:1px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);transition:all 0.2s">
                               <option value="Maschio" ${sesso === 'Maschio' ? 'selected' : ''}>Maschio</option>
                               <option value="Femmina" ${sesso === 'Femmina' ? 'selected' : ''}>Femmina</option>
                               <option value="Altro" ${sesso === 'Altro' ? 'selected' : ''}>Altro</option>
                           </select>`
                        : `<span style="font-size:12px;color:var(--txt);flex:1">${esc(sesso)}</span>`
                    }
                </label>
                
                ${isEditing ? `
                <label class="list-row" style="border-bottom:none;cursor:pointer">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;">Nuova Password</span>
                    <input id="prof-password" name="new-password" autocomplete="new-password" type="password" placeholder="Lascia vuoto per non cambiare" style="flex:1;padding:8px 12px;border:1px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);transition:all 0.2s">
                </label>
                <label class="list-row" id="row-old-pwd" style="border-bottom:none;cursor:pointer;display:none;">
                    <span style="color:var(--txt3);font-size:11px;width:100px;font-weight:600;">Password Attuale *</span>
                    <input id="prof-old-password" name="old-password" type="password" placeholder="Inserisci per confermare" style="flex:1;padding:8px 12px;border:1px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);transition:all 0.2s">
                </label>
                <div style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end">
                    <button type="button" id="btn-annulla-profilo" class="act-btn" style="background:transparent;border:1px solid var(--bdr);color:var(--txt)">Annulla</button>
                    <button type="button" id="btn-salva-profilo" class="act-btn">Salva modifiche</button>
                </div>
                ` : ''}
            </form>
        `;

        const statsView = ruolo === 'Giocatore' ? `
            <div class="stats-row">
                <div class="scard"><div class="scard-lbl">Partite</div><div class="scard-val">${s.partiteGiocate}</div></div>
                <div class="scard"><div class="scard-lbl">Vittorie</div><div class="scard-val" style="color:var(--grn)">${s.vittorie}</div></div>
                <div class="scard"><div class="scard-lbl">Win Rate</div><div class="scard-val">${winRate}%</div></div>
                <div class="scard"><div class="scard-lbl">Punteggio</div><div class="scard-val" style="color:var(--gold)">${s.punteggioTotale}</div></div>
            </div>
        ` : '';

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

            ${statsView}

            <div class="card" style="margin-top:12px;transition:all 0.3s ease;">
                <div class="card-hd" style="display:flex;justify-content:space-between;align-items:center">
                    <span>Dettagli account</span>
                    ${!isEditing ? `<button id="btn-edit-profilo" class="act-btn" title="Modifica dati" style="background:transparent;border:1px solid var(--bdr);color:var(--txt);padding:4px 8px;font-size:12px;display:flex;align-items:center;gap:6px">✎ Modifica</button>` : ''}
                </div>
                <div style="margin-top:12px;">
                    ${unifiedView}
                </div>
            </div>
        `;

        if (!isEditing) {
            document.getElementById('btn-edit-profilo')?.addEventListener('click', () => {
                isEditing = true;
                renderProfile();
            });
        } else {
            // Mostra o nascondi il campo old-password dinamicamente se la nuova password è digitata
            const pwdInput = document.getElementById('prof-password');
            const rowOldPwd = document.getElementById('row-old-pwd');
            if (pwdInput && rowOldPwd) {
                pwdInput.addEventListener('input', (e) => {
                    rowOldPwd.style.display = e.target.value.length > 0 ? 'flex' : 'none';
                });
            }

            document.getElementById('btn-annulla-profilo')?.addEventListener('click', () => {
                isEditing = false;
                renderProfile();
            });

            document.getElementById('btn-salva-profilo')?.addEventListener('click', async () => {
                const btn = document.getElementById('btn-salva-profilo');
                const origText = btn.innerText;
                btn.innerText = 'Salvataggio...';
                btn.disabled = true;

                const payload = {
                    username: document.getElementById('prof-username')?.value?.trim(),
                    sesso: document.getElementById('prof-sesso')?.value
                };
                const pwd = document.getElementById('prof-password')?.value;
                const oldPwd = document.getElementById('prof-old-password')?.value;
                if (pwd) {
                    if (!oldPwd) {
                        window.showToast('Devi inserire la password attuale per cambiarla.', 'warning');
                        btn.innerText = origText;
                        btn.disabled = false;
                        return;
                    }
                    payload.password = pwd;
                    payload.oldPassword = oldPwd;
                }

                try {
                    const aggiornato = await Api.updateUtente(userId, payload);
                    window.showToast('Profilo aggiornato con successo.', 'success');
                    if (aggiornato?.username) {
                        playerContext.name = aggiornato.username;
                        localStorage.setItem('userName', aggiornato.username);
                    }
                    utente = { ...utente, ...aggiornato };
                    isEditing = false;
                    renderProfile();
                } catch (err) {
                    window.showToast(err.message || 'Errore aggiornamento profilo.', 'error', 5000);
                    btn.innerText = origText;
                    btn.disabled = false;
                }
            });
        }
    }

    renderProfile();
}

export function disposePlayerDashboard() {
    lookupCache = { locali: {}, giochi: {}, tipologie: {} };
}
