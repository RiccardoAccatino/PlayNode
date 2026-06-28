/**
 * file: locale.js
 * Pagine e componenti per i GESTORI LOCALI
 */

import * as Api from '../js/api.js';

function showToast(message, type = 'blu') {
  const existing = document.getElementById('playnode-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'playnode-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surf);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 9999;
    font-family: var(--ff);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideDown 0.3s ease-out forwards;
  `;
  
  let icon = 'ℹ️';
  if (type === 'grn') icon = '✅';
  if (type === 'amb') icon = '⚠️';
  if (type === 'red') icon = '❌';

  toast.innerHTML = `<span style="font-size: 18px;">${icon}</span> <span>${message}</span>`;
  
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
      @keyframes slideUp { from { top: 20px; opacity: 1; } to { top: -50px; opacity: 0; } }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-in forwards';
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
  }, 3000);
}

export function localeOverview() {
  return `
      <div class="pg-title">Panoramica — Locale</div>
      <div class="pg-sub">Gestione dispositivi e attività</div>
      <div class="stats-row">
        <div class="scard"><div class="scard-lbl">Giochi attivi</div><div class="scard-val">4</div><div class="scard-delta neutral">su 4 totali</div></div>
        <div class="scard"><div class="scard-lbl">Partite oggi</div><div class="scard-val">37</div><div class="scard-delta up">+12% vs ieri</div></div>
        <div class="scard"><div class="scard-lbl">Giocatori oggi</div><div class="scard-val">23</div><div class="scard-delta up">picco 16-18</div></div>
        <div class="scard"><div class="scard-lbl">Stato connessione</div><div class="scard-val" style="font-size:14px;color:var(--grn)">Online</div><div class="scard-delta up">edge ok · 12ms</div></div>
      </div>
      <div class="row2">
        <div class="card">
          <div class="card-hd">Giochi in tempo reale</div>
          ${[
      { ico: '⚽', name: 'Calciobalilla Verde', status: 'In partita', score: '3-2', time: '04:21', players: 'Luca vs Anna' },
      { ico: '⚽', name: 'Calciobalilla Rosso', status: 'Libero', score: '—', time: '—', players: '—' },
      { ico: '🎯', name: 'Freccette Dx', status: 'In partita', score: '180 pts', time: '02:05', players: 'Marco vs Giulia' },
      { ico: '🎱', name: 'Biliardo', status: 'In pausa', score: '4-4', time: '08:33', players: 'Giorgio vs Piero' },
    ].map(g => `
            <div class="list-row">
              <div class="gi" style="background:var(--surf2)">${g.ico}</div>
              <div style="flex:1"><div class="rname">${g.name}</div><div class="rmeta">${g.players}</div></div>
              <div style="text-align:right">
                <div style="font-size:11px;font-weight:500">${g.score}</div>
                <div style="font-size:9px;color:var(--txt3)">${g.time}</div>
              </div>
              <span class="badge ${g.status === 'In partita' ? 'b-grn' : g.status === 'Libero' ? 'b-blu' : 'b-amb'}">${g.status}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-hd">Ultimi eventi</div>
          ${[
      { t: '14:47', msg: 'Goal segnato — Calciobalilla Verde (3-2)', type: 'grn' },
      { t: '14:45', msg: 'Partita iniziata — Freccette Dx', type: 'blu' },
      { t: '14:38', msg: 'Partita terminata — Calciobalilla Rosso (5-3)', type: 'grn' },
      { t: '14:31', msg: 'Edge offline temporaneo (42 sec)', type: 'amb' },
      { t: '14:29', msg: 'Sincronizzazione dati completata', type: 'blu' },
      { t: '14:14:20', msg: 'Nuovo giocatore registrato', type: 'grn' },
    ].map(e => `
            <div class="list-row">
              <span style="font-size:9px;color:var(--txt3);width:32px;flex-shrink:0">${e.t}</span>
              <div class="dot ${e.type === 'grn' ? 'd-grn' : e.type === 'amb' ? 'd-amb' : 'd-grn'}" style="${e.type === 'blu' ? 'background:var(--acc)' : ''}"></div>
              <div style="font-size:11px;flex:1">${e.msg}</div>
            </div>`).join('')}
        </div>
      </div>`;
}

export function localeLive() {
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

  const idLocale = localStorage.getItem('localeId') || 1;

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
      if (confirm('Vuoi davvero forzare la chiusura di questa partita?')) {
        try {
          e.target.disabled = true;
          e.target.textContent = '...';
          const result = await Api.terminaPartita(idPartita);
          if (result) {
            showToast(`Partita ${idPartita} terminata con successo.`, 'grn');
            loadAndRender();
          } else {
            showToast(`Impossibile terminare la partita.`, 'red');
            e.target.disabled = false;
            e.target.textContent = 'Termina';
          }
        } catch (err) {
          showToast(`Errore durante la terminazione.`, 'red');
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

  const idLocale = localStorage.getItem('localeId') || 1;

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

      try {
        const partita = await Api.avviaPartita(id);

        if (!partita) {
          showToast("Errore: impossibile avviare la partita.", "red");
          return;
        }

        showToast(`Partita avviata! (ID: ${partita.id || partita.idPartita || '-'})`, "grn");
      } catch (error) {
        console.error("Errore di connessione o del server:", error);
        showToast("Si è verificato un errore critico durante l'avvio della partita.", "red");
      } finally {
        currentBtn.disabled = false;
      }
    });
  });
}

export function localeDevices() {
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