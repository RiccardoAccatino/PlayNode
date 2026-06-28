/**
 * file: locale.js
 * Pagine e componenti per i GESTORI LOCALI
 */

import * as Api from '../js/api.js';

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
      <div class="pg-sub">Gestione dispositivi e attività</div>
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
    const [allPartite, giochi, latencies] = await Promise.all([
      Api.getAllPartite(),
      Api.getGiochiByLocale(idLocale),
      Api.getMonitorLatencies().catch(() => null)
    ]);

    const giochiMap = {};
    giochi.forEach(g => {
      const id = g.idGiocoInstallato || g.id || g.id_gioco_installato;
      if (id) giochiMap[id] = g;
    });

    const partite = allPartite.filter(p => giochiMap[p.idGiocoInstallato]);

    const activeGamesCount = giochi.length;
    const partiteOggiCount = partite.length;
    const livePartite = partite.filter(p => p.stato?.toUpperCase() === 'IN_CORSO');
    const terminatePartite = partite.filter(p => p.stato?.toUpperCase() === 'TERMINATA').slice(-20).reverse();

    let liveHtml = '<div style="padding:14px;color:var(--txt3);font-size:12px;text-align:center">Nessuna partita attiva.</div>';
    if (livePartite.length > 0) {
      liveHtml = livePartite.map(p => {
        const gioco = giochiMap[p.idGiocoInstallato];
        const nomeGioco = gioco ? (gioco.tipoGioco || gioco.nome || gioco.nomeGioco || gioco.nomeTipologiaGioco || `Gioco #${p.idGiocoInstallato}`) : `Gioco #${p.idGiocoInstallato}`;
        let icon = '🎮';
        if (nomeGioco) {
          const lower = nomeGioco.toLowerCase();
          if (lower.includes('calcio')) icon = '⚽';
          else if (lower.includes('freccet')) icon = '🎯';
          else if (lower.includes('biliard')) icon = '🎱';
          else if (lower.includes('bowl')) icon = '🎳';
          else if (lower.includes('bocce')) icon = '🎳';
        }
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
    let edgeDelta = 'irraggiungibile';

    if (latencies && latencies.length > 0) {
      edgeStatus = 'Online';
      edgeColor = 'var(--grn)';
      const ms = latencies[0].ms || 12;
      edgeDelta = `edge ok &middot; ${ms}ms`;
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
      <div class="pg-sub">Monitoraggio in tempo reale dei giochi nel locale</div>
      <div id="live-matches-container">
        <div class="spinner">Caricamento partite live...</div>
      </div>`;
}

export function initLiveMatches(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') return;

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

        let icon = '🎮';
        if (nomeGioco) {
          const lower = nomeGioco.toLowerCase();
          if (lower.includes('calcio')) icon = '⚽';
          else if (lower.includes('freccet')) icon = '🎯';
          else if (lower.includes('biliard')) icon = '🎱';
          else if (lower.includes('bowl')) icon = '🎳';
          else if (lower.includes('shuffle')) icon = '🎳';
        }
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
    <div class="pg-sub">Configurazione e gestione giochi installati</div>
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

  const giochi = await Api.getGiochiByLocale(idLocale);

  if (!giochi || giochi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Nessun gioco trovato per questo locale.</td></tr>`;
    return;
  }

  tbody.innerHTML = giochi.map(g => {
    const idGiocoInstallato = g.idGiocoInstallato || g.id || g.id_gioco_installato;
    const nome = g.tipoGioco || g.nome || g.nomeGioco || g.nomeTipologiaGioco || g.nome_tipologia_gioco || `Gioco #${idGiocoInstallato}`;
    const sensori = g.numSensori || g.sensors || g.sensori || g.numeroSensori || 0;
    const ok = (g.stato === 'IN_USO' || g.ok || g.attivo || true);

    return `
      <tr>
        <td><span style="font-size:14px">🎮</span> ${nome}</td>
        <td style="font-family:monospace;font-size:11px;color:var(--acc2)">${idGiocoInstallato ?? ''}</td>
        <td>${sensori} attivi</td>
        <td><span class="badge ${ok ? 'b-grn' : 'b-red'}">${ok ? 'ok' : 'errore'}</span></td>
        <td style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="act-btn btn-avvia" data-id="${idGiocoInstallato}">Avvia partita</button>
          <button class="act-btn btn-config" data-id="${idGiocoInstallato}">Config</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-config').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast("Configurazione dispositivo non ancora implementata.", "amb");
    });
  });

  tbody.querySelectorAll('.btn-avvia').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const currentBtn = e.currentTarget;
      const id = currentBtn.getAttribute('data-id');

      if (!id) return;

      currentBtn.disabled = true;
      const loadingToast = window.showToast("Caricamento in corso...", "load", 0);

      try {
        const partita = await Api.avviaPartita(id);
        loadingToast.close();

        if (!partita) {
          window.showToast("Errore: impossibile avviare la partita.", "red");
          return;
        }

        window.showToast(`Partita avviata! (ID: ${partita.id || partita.idPartita || '-'})`, "grn");
      } catch (error) {
        loadingToast.close();
        console.error("Errore di connessione o del server:", error);
        window.showToast("Si è verificato un errore critico durante l'avvio della partita.", "red");
      } finally {
        currentBtn.disabled = false;
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

  return `
      <div class="pg-title">Dispositivi Edge</div>
      <div class="pg-sub">Stato hardware e connessione MQTT</div>
      <div class="stats-row-3">
        <div class="scard">
          <div class="scard-lbl">Edge principale</div>
          <div class="scard-val" style="font-size:16px;color:var(--grn)">Online</div>
          <div class="scard-delta up">Raspberry Pi 4 · 12ms latency</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Broker MQTT</div>
          <div class="scard-val" style="font-size:16px;color:var(--grn)">Connesso</div>
          <div class="scard-delta neutral">4 topic attivi</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Messaggi/min</div>
          <div class="scard-val">142</div>
          <div class="scard-delta up">picco 18:00</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Topic MQTT attivi</div>
        ${['locale/bar-belvedere/calciobalilla/cb-001/goal', 'locale/bar-belvedere/freccette/fr-001/score', 'locale/bar-belvedere/biliardo/bl-001/pocket', 'locale/bar-belvedere/edge/status'].map(t => `
          <div class="list-row">
            <div class="dot d-grn"></div>
            <div style="font-family:monospace;font-size:11px;color:var(--acc2);flex:1">${t}</div>
          </div>
        `).join('')}
      </div>`;
}

export function localeStats() {
  const idLocale = localStorage.getItem('localeId');
  if (!idLocale || idLocale === 'undefined' || idLocale === 'null') {
    return `
      <div class="pg-title">Statistiche Locale</div>
      <div class="pg-sub">Analisi utilizzo — Locale</div>
      ${getEmptyLocaleHtml()}`;
  }

  return `
      <div class="pg-title">Statistiche Locale</div>
      <div class="pg-sub">Analisi utilizzo — Locale</div>
      <div class="stats-row">
        <div class="scard">
          <div class="scard-lbl">Partite questo mese</div>
          <div class="scard-val">412</div>
          <div class="scard-delta up">+28% vs mese scorso</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Gioco più usato</div>
          <div class="scard-val" style="font-size:16px">⚽</div>
          <div class="scard-delta neutral">Calciobalilla</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Ora di punta</div>
          <div class="scard-val" style="font-size:18px">18:00</div>
          <div class="scard-delta neutral">mer-ven</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Giocatori unici</div>
          <div class="scard-val">87</div>
          <div class="scard-delta up">questo mese</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Utilizzo per gioco</div>
        ${[
      { ico: '⚽', name: 'Calciobalilla', pct: 58 },
      { ico: '🎯', name: 'Freccette', pct: 24 },
      { ico: '🎱', name: 'Biliardo', pct: 18 }
    ].map(g => `
          <div class="skill-row">
            <div class="skill-name">${g.ico} ${g.name}</div>
            <div class="skill-bar"><div class="skill-fill" style="width:${g.pct}%;background:var(--acc)"></div></div>
            <div class="skill-pct">${g.pct}%</div>
          </div>
        `).join('')}
      </div>`;
}

export function localeSettings(userData) {
  return `
      <div class="pg-title">Impostazioni Locale</div>
      <div class="pg-sub">Configurazione account</div>
      <div class="card" style="margin-bottom:12px">
        <div class="card-hd">Informazioni locale</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
          <div>
            <div style="color:var(--txt3);margin-bottom:3px">Nome utente</div>
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
          <button class="act-btn" style="width:fit-content">Cambia password edge</button>
          <button class="act-btn" style="width:fit-content">Rigenera token API</button>
          <button class="danger-btn" style="width:fit-content">Disconnetti locale</button>
        </div>
      </div>`;
}