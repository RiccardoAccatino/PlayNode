/**
 * file: locale.js
 * Pagine e componenti per i GESTORI LOCALI
 */

import * as Api from '../js/api.js';
import { iconaGioco, coloreGioco } from '../js/game-icons.js';

async function getLocaleContext() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return null;
  try {
    const locale = await Api.getLocaleById(idLocale);
    return { idLocale, nome: locale?.nome || `Locale #${idLocale}`, locale };
  } catch {
    return { idLocale, nome: `Locale #${idLocale}`, locale: null };
  }
}

function localeSubtitle(nome) {
  return nome ? `Gestione dispositivi e attività — ${nome}` : 'Gestione dispositivi e attività';
}

function getEmptyLocaleHtml() {
  return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;color:var(--txt2);text-align:center;">
        <div style="font-size:40px;margin-bottom:10px;">🏢</div>
        <h3 style="margin:0 0 5px 0;">Nessun locale associato</h3>
        <p style="margin:0;font-size:14px;max-width:300px">Il tuo account non è attualmente associato ad alcun locale. Contatta l'amministratore per l'assegnazione.</p>
      </div>`;
}

export function localeOverview() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Panoramica — Locale</div>
      <div class="pg-sub">Gestione dispositivi e attività</div>
      ${getEmptyLocaleHtml()}`;
  }

  setTimeout(() => initLocaleOverview('locale-overview-container'), 0);
  return `
      <div class="pg-title">Panoramica — Locale</div>
      <div class="pg-sub" id="locale-overview-sub">Gestione dispositivi e attività</div>
      <div id="locale-overview-container">
        <div class="spinner">Caricamento panoramica...</div>
      </div>`;
}

export async function initLocaleOverview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

  try {
    const ctx = await getLocaleContext();
    const sub = document.getElementById('locale-overview-sub');
    if (sub && ctx) sub.textContent = localeSubtitle(ctx.nome);

    const [livePartite, giochi, iotStato, allPartite] = await Promise.all([
      Api.getPartiteByLocale(idLocale),
      Api.getGiochiByLocale(idLocale),
      Api.getIotStatoLocale(idLocale).catch(() => null),
      Api.getAllPartite().catch(() => [])
    ]);

    const giochiMap = {};
    giochi.forEach(g => {
      const id = g.idGiocoInstallato || g.id || g.id_gioco_installato;
      if (id) giochiMap[id] = g;
    });

    const partiteLocale = allPartite.filter(p => giochiMap[p.idGiocoInstallato]);
    const activeGamesCount = giochi.length;
    const partiteOggiCount = partiteLocale.length;
    const terminatePartite = partiteLocale.filter(p => p.stato?.toUpperCase() === 'TERMINATA').slice(-20).reverse();

    let liveHtml = '<div style="padding:14px;color:var(--txt3);font-size:12px;text-align:center">Nessuna partita attiva.</div>';
    if (livePartite.length > 0) {
      liveHtml = livePartite.map(p => {
        const gioco = giochiMap[p.idGiocoInstallato];
        const nomeGioco = gioco ? (gioco.tipoGioco || gioco.nome || gioco.nomeGioco || gioco.nomeTipologiaGioco || `Gioco #${p.idGiocoInstallato}`) : `Gioco #${p.idGiocoInstallato}`;
        const icon = iconaGioco(nomeGioco);
        return `
          <div class="list-row">
            <div class="gi" style="background:var(--surf2)">${icon}</div>
            <div style="flex:1"><div class="rname">${nomeGioco}</div><div class="rmeta">ID: ${p.id}</div></div>
            <div style="text-align:right">
              <div style="font-size:11px;font-weight:500">${p.punteggio1} - ${p.punteggio2}</div>
            </div>
            <span class="badge b-grn">In partita</span>
          </div>`;
      }).join('');
    }

    let historyHtml = '<div style="padding:14px;color:var(--txt3);font-size:12px;text-align:center">Nessuna partita terminata.</div>';
    if (terminatePartite.length > 0) {
      historyHtml = terminatePartite.map(p => {
        const gioco = giochiMap[p.idGiocoInstallato];
        const nomeGioco = gioco ? (gioco.tipoGioco || gioco.nome || gioco.nomeGioco || gioco.nomeTipologiaGioco || `Gioco #${p.idGiocoInstallato}`) : `Gioco #${p.idGiocoInstallato}`;
        return `
          <div class="list-row">
            <span style="font-size:9px;color:var(--txt3);width:40px;flex-shrink:0">ID ${p.id}</span>
            <div class="dot d-blu" style="background:var(--acc)"></div>
            <div style="font-size:11px;flex:1">Terminata — ${nomeGioco} (${p.punteggio1}-${p.punteggio2})</div>
          </div>`;
      }).join('');
    }

    let edgeStatus = 'Offline';
    let edgeColor = 'var(--red)';
    let edgeDelta = 'nessun edge online';

    if (iotStato) {
      const online = iotStato.edgeStato === 'Online';
      edgeStatus = online ? 'Online' : 'Offline';
      edgeColor = online ? 'var(--grn)' : 'var(--red)';
      const addr = iotStato.edgeAddress ? ` · ${iotStato.edgeAddress}` : '';
      edgeDelta = online
        ? `broker ${iotStato.brokerConnesso ? 'ok' : 'ko'}${addr}`
        : 'edge irraggiungibile';
    }

    container.innerHTML = `
      <div class="stats-row">
        <div class="scard"><div class="scard-lbl">Giochi installati</div><div class="scard-val">${activeGamesCount}</div><div class="scard-delta neutral">totali</div></div>
        <div class="scard"><div class="scard-lbl">Totale partite</div><div class="scard-val">${partiteOggiCount}</div><div class="scard-delta up">storico</div></div>
        <div class="scard"><div class="scard-lbl">Partite live</div><div class="scard-val">${livePartite.length}</div><div class="scard-delta up">in corso</div></div>
        <div class="scard"><div class="scard-lbl">Stato connessione</div><div class="scard-val" style="font-size:14px;color:${edgeColor}">${edgeStatus}</div><div class="scard-delta up">${edgeDelta}</div></div>
      </div>
      <div class="row2">
        <div class="card" style="max-height: 400px; overflow-y: auto; padding-top: 0;">
          <div class="card-hd" style="position: sticky; top: 0; background: var(--surf); z-index: 2; padding-top: 14px; padding-bottom: 12px; margin-bottom: 0; border-bottom: 1px solid var(--bdr);">Giochi in tempo reale</div>
          <div>${liveHtml}</div>
        </div>
        <div class="card" style="max-height: 400px; overflow-y: auto; padding-top: 0;">
          <div class="card-hd" style="position: sticky; top: 0; background: var(--surf); z-index: 2; padding-top: 14px; padding-bottom: 12px; margin-bottom: 0; border-bottom: 1px solid var(--bdr);">Ultime partite terminate</div>
          <div>${historyHtml}</div>
        </div>
      </div>`;

  } catch (error) {
    console.error('Errore nel caricamento della panoramica:', error);
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--red);font-size:12px">Errore di connessione al server.</div>`;
  }
}

export function localeLive() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Partite Live</div>
      <div class="pg-sub">Monitoraggio in tempo reale dei giochi nel locale</div>
      ${getEmptyLocaleHtml()}`;
  }

  setTimeout(() => initLiveMatches('live-matches-container'), 0);
  return `
      <div class="pg-title">Partite Live</div>
      <div class="pg-sub" id="locale-live-sub">Monitoraggio in tempo reale dei giochi nel locale</div>
      <div id="live-matches-container">
        <div class="spinner">Caricamento partite live...</div>
      </div>`;
}

export function initLiveMatches(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

  getLocaleContext().then(ctx => {
    const sub = document.getElementById('locale-live-sub');
    if (sub && ctx) sub.textContent = `Monitoraggio in tempo reale — ${ctx.nome}`;
  });

  async function loadAndRender() {
    try {
      const partite = await Api.getPartiteByLocale(idLocale);
      const giochi = await Api.getGiochiByLocale(idLocale);

      const giochiMap = {};
      giochi.forEach(g => {
        const id = g.idGiocoInstallato || g.id || g.id_gioco_installato;
        if (id) giochiMap[id] = g;
      });

      const livePartite = partite.filter(p => {
        const stato = p.stato?.toUpperCase() || '';
        return stato === 'IN_CORSO';
      });

      if (livePartite.length === 0) {
        container.innerHTML = `
                    <div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Nessuna partita attiva.</div>`;
        return;
      }

      const itemsHtml = livePartite.map(p => {
        const gioco = giochiMap[p.idGiocoInstallato];
        const nomeGioco = gioco ? (gioco.tipoGioco || gioco.nome || gioco.nomeGioco || gioco.nomeTipologiaGioco || `Gioco #${p.idGiocoInstallato}`) : `Gioco #${p.idGiocoInstallato}`;

        const icon = iconaGioco(nomeGioco);
        const statoDisplay = p.stato === 'IN_CORSO' ? 'In partita' : p.stato || '';
        return `
                    <div class="card">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                            <span style="font-size:18px">${icon}</span>
                            <div style="font-family:var(--ff);font-size:13px;font-weight:700;flex:1">${nomeGioco}</div>
                            <span class="badge b-grn">${statoDisplay}</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-around;padding:10px 0;background:var(--surf2);border-radius:8px;margin-bottom:10px">
                            <div style="text-align:center">
                                <div style="font-size:11px;color:var(--txt3)">Squadra 1</div>
                                <div style="font-family:var(--ff);font-size:26px;font-weight:800">${p.punteggio1}</div>
                            </div>
                            <div style="font-size:11px;color:var(--txt3)">vs</div>
                            <div style="text-align:center">
                                <div style="font-size:11px;color:var(--txt3)">Squadra 2</div>
                                <div style="font-family:var(--ff);font-size:26px;font-weight:800">${p.punteggio2}</div>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                            <div style="font-size:11px;color:var(--txt3)">ID Partita: ${p.id}</div>
                            <button class="act-btn btn-termina" data-id="${p.id}" style="padding:4px 8px;font-size:11px;background:var(--red);border-color:var(--red);color:#fff">Termina</button>
                        </div>
                    </div>`;
      }).join('');

      container.innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:12px">
                    ${itemsHtml}
                </div>`;
    } catch (error) {
      console.error('Error loading live matches:', error);
      container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Errore nel caricamento delle partite.</div>`;
    }
  }

  loadAndRender();

  const clickHandler = async (e) => {
    if (e.target.classList.contains('btn-termina')) {
      const idPartita = e.target.getAttribute('data-id');
      if (await window.showConfirm('Vuoi davvero forzare la chiusura di questa partita?')) {
        const loadingToast = window.showToast("Caricamento in corso...", "load", 0);
        try {
          e.target.disabled = true;
          e.target.textContent = '...';
          const result = await Api.terminaPartita(idPartita);
          loadingToast.close();
          if (result) {
            window.showToast(`Partita ${idPartita} terminata con successo.`, 'grn');
            loadAndRender();
          } else {
            window.showToast(`Impossibile terminare la partita.`, 'red');
            e.target.disabled = false;
            e.target.textContent = 'Termina';
          }
        } catch (err) {
          loadingToast.close();
          window.showToast(`Errore durante la terminazione.`, 'red');
          e.target.disabled = false;
          e.target.textContent = 'Termina';
        }
      }
    }
  };
  container.addEventListener('click', clickHandler);

  const interval = setInterval(loadAndRender, 5000);
  container.dataset.refreshInterval = String(interval);

  return () => {
    clearInterval(interval);
    container.removeEventListener('click', clickHandler);
  };
}

export function localeGames() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Giochi del Locale</div>
      <div class="pg-sub">Configurazione e gestione giochi installati</div>
      ${getEmptyLocaleHtml()}`;
  }

  const tbodyId = 'locale-games-tbody';
  setTimeout(() => initLocaleGames(tbodyId), 0);

  return `
    <div class="pg-title">Giochi del Locale</div>
    <div class="pg-sub" id="locale-games-sub">Configurazione e gestione giochi installati</div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr>
            <th>Gioco</th>
            <th>ID</th>
            <th>Sensori</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody id="${tbodyId}">
          <tr><td colspan="5" style="text-align:center; padding: 20px;">Caricamento giochi in corso...</td></tr>
        </tbody>
      </table>
    </div>`;
}

async function initLocaleGames(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

  const ctx = await getLocaleContext();
  const sub = document.getElementById('locale-games-sub');
  if (sub && ctx) sub.textContent = `Configurazione giochi — ${ctx.nome}`;

  const giochi = await Api.getGiochiByLocale(idLocale);

  if (!giochi || giochi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Nessun gioco trovato per questo locale.</td></tr>`;
    return;
  }

  tbody.innerHTML = giochi.map(g => {
    const idGiocoInstallato = g.idGiocoInstallato || g.id || g.id_gioco_installato;
    const nome = g.tipoGioco || g.nome || g.nomeGioco || g.nomeTipologiaGioco || g.nome_tipologia_gioco || `Gioco #${idGiocoInstallato}`;
    const sensori = g.numSensori || g.sensors || g.sensori || g.numeroSensori || 0;
    const inUso = g.stato === 'IN_USO';
    const libero = g.stato === 'LIBERO';
    const badgeClass = inUso ? 'b-amb' : 'b-grn';
    const badgeLabel = inUso ? 'In uso' : (libero ? 'Libero' : (g.stato || '—'));

    return `
      <tr>
        <td><span style="font-size:14px">${iconaGioco(nome)}</span> ${nome}</td>
        <td style="font-family:monospace;font-size:11px;color:var(--acc2)">${idGiocoInstallato ?? ''}</td>
        <td>${sensori} attivi</td>
        <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
        <td style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="act-btn btn-avvia" data-id="${idGiocoInstallato}" ${inUso ? 'disabled' : ''}>Avvia partita</button>
          <button class="act-btn btn-config" data-id="${idGiocoInstallato}">Edge</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-config').forEach(btn => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('cgp:show-page', { detail: 'Dispositivi' }));
    });
  });

  tbody.querySelectorAll('.btn-avvia').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const currentBtn = e.currentTarget;
      const id = currentBtn.getAttribute('data-id');

      if (!id || currentBtn.disabled) return;

      currentBtn.disabled = true;
      window.showLoadingOverlay?.('Avvio partita in corso...');

      try {
        const partita = await Api.avviaPartita(id);
        const partitaId = partita.id || partita.idPartita || '-';
        window.showToast(`Partita avviata! (ID: ${partitaId})`, 'grn');
        await initLocaleGames(tbodyId);
      } catch (error) {
        console.error('Errore avvio partita:', error);
        window.showToast(error.message || 'Impossibile avviare la partita.', 'red', 5000);
      } finally {
        window.hideLoadingOverlay?.();
        const row = currentBtn.closest('tr');
        const badge = row?.querySelector('.badge');
        if (badge?.textContent?.trim() !== 'In uso') {
          currentBtn.disabled = false;
        }
      }
    });
  });
}

export function localeDevices() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Dispositivi Edge</div>
      <div class="pg-sub">Stato hardware e connessione MQTT</div>
      ${getEmptyLocaleHtml()}`;
  }

  setTimeout(() => initLocaleDevices('locale-devices-container'), 0);
  return `
      <div class="pg-title">Dispositivi Edge</div>
      <div class="pg-sub" id="locale-devices-sub">Stato hardware e connessione MQTT</div>
      <div style="margin-bottom:10px">
        <button id="btn-refresh-devices" class="act-btn" style="font-size:11px">Aggiorna stato</button>
      </div>
      <div id="locale-devices-container">
        <div class="spinner">Caricamento dispositivi...</div>
      </div>`;
}

export async function initLocaleDevices(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

  if (container.dataset.refreshInterval) {
    clearInterval(Number(container.dataset.refreshInterval));
  }

  const ctx = await getLocaleContext();
  const sub = document.getElementById('locale-devices-sub');
  if (sub && ctx) sub.textContent = `Stato hardware e connessione MQTT — ${ctx.nome}`;

  const btnRefresh = document.getElementById('btn-refresh-devices');
  btnRefresh?.addEventListener('click', () => renderDevices(container, idLocale));

  async function renderDevices(target, localeId) {
    try {
      const stato = await Api.getIotStatoLocale(localeId);
      if (!stato) {
        target.innerHTML = `<div style="padding:20px;color:var(--txt3);font-size:12px;text-align:center">Locale non trovato.</div>`;
        return;
      }

      const edgeOnline = stato.edgeStato === 'Online';
      const brokerOk = stato.brokerConnesso;
      const topics = stato.topicAttiviLista || [];

      target.innerHTML = `
      <div class="stats-row-3">
        <div class="scard">
          <div class="scard-lbl">Edge principale</div>
          <div class="scard-val" style="font-size:16px;color:${edgeOnline ? 'var(--grn)' : 'var(--red)'}">${stato.edgeStato || 'Offline'}</div>
          <div class="scard-delta ${edgeOnline ? 'up' : 'neutral'}">${stato.edgeAddress || 'Nessun componente'}${stato.edgeId ? ` · #${stato.edgeId}` : ''}</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Broker MQTT</div>
          <div class="scard-val" style="font-size:16px;color:${brokerOk ? 'var(--grn)' : 'var(--red)'}">${brokerOk ? 'Connesso' : 'Disconnesso'}</div>
          <div class="scard-delta neutral">${stato.topicAttivi || 0} topic attivi</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Messaggi/min</div>
          <div class="scard-val">${stato.messaggiPerMinuto ?? 0}</div>
          <div class="scard-delta up">picco ${stato.piccoOra || '-'}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Topic MQTT attivi</div>
        ${topics.length ? topics.map(t => `
          <div class="list-row">
            <div class="dot d-grn"></div>
            <div style="font-family:monospace;font-size:11px;color:var(--acc2);flex:1">${t}</div>
          </div>
        `).join('') : '<div style="padding:14px;color:var(--txt3);font-size:12px">Nessun topic attivo per questo locale.</div>'}
      </div>`;
    } catch (error) {
      console.error('Errore caricamento dispositivi edge:', error);
      target.innerHTML = `<div style="padding:20px;color:var(--red);font-size:12px;text-align:center">Errore di connessione al server.</div>`;
    }
  }

  await renderDevices(container, idLocale);
  const interval = setInterval(() => renderDevices(container, idLocale), 30000);
  container.dataset.refreshInterval = String(interval);
}

export function localeStats() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Statistiche Locale</div>
      <div class="pg-sub">Analisi utilizzo — Locale</div>
      ${getEmptyLocaleHtml()}`;
  }

  setTimeout(() => initLocaleStats('locale-stats-container'), 0);
  return `
      <div class="pg-title">Statistiche Locale</div>
      <div class="pg-sub" id="locale-stats-sub">Analisi utilizzo — Locale</div>
      <div id="locale-stats-container">
        <div class="spinner">Caricamento statistiche...</div>
      </div>`;
}

export async function initLocaleStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

  try {
    const ctx = await getLocaleContext();
    const sub = document.getElementById('locale-stats-sub');
    if (sub && ctx) sub.textContent = `Analisi utilizzo — ${ctx.nome}`;

    const stats = await Api.getStatisticheLocale(idLocale);
    if (!stats) {
      container.innerHTML = `<div style="padding:20px;color:var(--txt3);font-size:12px;text-align:center">Statistiche non disponibili.</div>`;
      return;
    }

    const varPct = stats.variazionePercentualeMese ?? 0;
    const varLabel = varPct >= 0 ? `+${varPct}%` : `${varPct}%`;
    const varClass = varPct >= 0 ? 'up' : 'neutral';
    const giocoTop = stats.giocoPiuUsato || '-';
    const utilizzo = stats.utilizzoPerGioco || [];

    container.innerHTML = `
      <div class="stats-row">
        <div class="scard">
          <div class="scard-lbl">Partite questo mese</div>
          <div class="scard-val">${stats.partiteMeseCorrente ?? 0}</div>
          <div class="scard-delta ${varClass}">${varLabel} vs mese scorso</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Gioco più usato</div>
          <div class="scard-val" style="font-size:16px">${iconaGioco(giocoTop)}</div>
          <div class="scard-delta neutral">${giocoTop}</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Ora di punta</div>
          <div class="scard-val" style="font-size:18px">${stats.oraPunta || '-'}</div>
          <div class="scard-delta neutral">da storico partite</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Giocatori unici</div>
          <div class="scard-val">${stats.giocatoriUniciMese ?? 0}</div>
          <div class="scard-delta up">questo mese</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Utilizzo per gioco</div>
        ${utilizzo.length ? utilizzo.map(g => `
          <div class="skill-row">
            <div class="skill-name">${iconaGioco(g.nomeGioco)} ${g.nomeGioco}</div>
            <div class="skill-bar"><div class="skill-fill" style="width:${g.percentuale}%;background:${coloreGioco(g.nomeGioco) || 'var(--acc)'}"></div></div>
            <div class="skill-pct">${g.percentuale}%</div>
          </div>
        `).join('') : '<div style="padding:14px;color:var(--txt3);font-size:12px">Nessuna partita registrata per questo locale.</div>'}
      </div>`;
  } catch (error) {
    console.error('Errore caricamento statistiche locale:', error);
    container.innerHTML = `<div style="padding:20px;color:var(--red);font-size:12px;text-align:center">Errore di connessione al server.</div>`;
  }
}

export function localeSettings(userData) {
  setTimeout(() => initLocaleSettings(userData), 0);
  return `
      <div class="pg-title">Impostazioni Locale</div>
      <div class="pg-sub" id="locale-settings-sub">Configurazione account</div>
      <div id="locale-settings-container">
        <div class="spinner">Caricamento impostazioni...</div>
      </div>`;
}

export function initLocaleSettings(userData) {
  const container = document.getElementById('locale-settings-container');
  if (!container) return;

  const idLocale = localStorage.getItem('localeId');

  getLocaleContext().then(ctx => {
    const sub = document.getElementById('locale-settings-sub');
    if (sub && ctx) sub.textContent = `Configurazione account — ${ctx.nome}`;
    const nomeLocale = ctx?.locale?.nome || ctx?.nome || '-';
    const indirizzo = ctx?.locale?.indirizzo || '—';
    container.innerHTML = `
      <div class="card" style="margin-bottom:12px">
        <div class="card-hd">Informazioni locale</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
          <div>
            <div style="color:var(--txt3);margin-bottom:3px">Nome locale</div>
            <div>${nomeLocale}</div>
          </div>
          <div>
            <div style="color:var(--txt3);margin-bottom:3px">Indirizzo</div>
            <div>${indirizzo}</div>
          </div>
          <div>
            <div style="color:var(--txt3);margin-bottom:3px">Gestore</div>
            <div>${userData.name}</div>
          </div>
          <div>
            <div style="color:var(--txt3);margin-bottom:3px">Ruolo</div>
            <div>${userData.role}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Accesso e sicurezza</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button id="btn-edge-password" class="act-btn" style="width:fit-content">Cambia password edge</button>
          <button id="btn-edge-token" class="act-btn" style="width:fit-content">Rigenera token API</button>
          <button id="btn-edge-disconnect" class="danger-btn" style="width:fit-content">Disconnetti locale</button>
        </div>
      </div>`;
    wireSettingsButtons(idLocale);
  });
}

function wireSettingsButtons(idLocale) {
  const btnPwd = document.getElementById('btn-edge-password');
  const btnToken = document.getElementById('btn-edge-token');
  const btnDisc = document.getElementById('btn-edge-disconnect');

  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    [btnPwd, btnToken, btnDisc].forEach(b => { if (b) b.disabled = true; });
    return;
  }

  btnPwd?.addEventListener('click', async () => {
    const pwd = window.prompt('Inserisci la nuova password edge (min. 8 caratteri):');
    if (!pwd) return;
    try {
      await Api.cambiaPasswordEdge(idLocale, pwd);
      window.showToast?.('Password edge aggiornata.', 'success');
    } catch (err) {
      window.showToast?.(err.message || 'Errore aggiornamento password.', 'error');
    }
  });

  btnToken?.addEventListener('click', async () => {
    if (!await window.showConfirm?.('Rigenerare il token API? Il precedente non sarà più valido.')) return;
    try {
      const res = await Api.rigeneraTokenEdge(idLocale);
      window.showToast?.(`Nuovo token: ${res.token}`, 'success', 8000);
    } catch (err) {
      window.showToast?.(err.message || 'Errore rigenerazione token.', 'error');
    }
  });

  btnDisc?.addEventListener('click', async () => {
    if (!await window.showConfirm?.('Disconnettere tutti i componenti edge di questo locale?')) return;
    try {
      await Api.disconnettiLocaleEdge(idLocale);
      window.showToast?.('Locale disconnesso (edge Offline).', 'success');
    } catch (err) {
      window.showToast?.(err.message || 'Errore disconnessione.', 'error');
    }
  });
}