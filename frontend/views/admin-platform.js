/**
 * file: admin-platform.js
 * Pagine e componenti per gli ADMIN PIATTAFORMA
 */

import * as Api from '../js/api.js';

// ─── Tipi sensore disponibili ───────────────────────────────────────────────
const TIPI_SENSORE = ['OTTICO', 'MAGNETICO', 'PRESSIONE', 'ULTRASONICO', 'INFRAROSSO', 'ACCELEROMETRO', 'CUSTOM'];

// ─── Helper globale: icona per tipo sensore ──────────────────────────────────
function iconaSensore(tipo) {
  const mappa = {
    OTTICO: '👁️', MAGNETICO: '🧲', PRESSIONE: '⚖️',
    ULTRASONICO: '🔊', INFRAROSSO: '🌡️', ACCELEROMETRO: '📐', CUSTOM: '⚙️'
  };
  return mappa[tipo] || '⚙️';
}

// ─── Stile condiviso per input / select nei modal ────────────────────────────
const INPUT_STYLE = `
  width:100%;padding:9px 12px;background:var(--surf2);border:1px solid var(--bdr);
  border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;box-sizing:border-box;
`;

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
export async function platformOverview() {
  // Fetch counts from backend; fallback to mock if unavailable
  const [tipologie, locali, partite] = await Promise.all([
    Api.getAllTipologieGioco().catch(() => []),
    Api.getAllLocali().catch(() => []),
    Api.getAllPartite().catch(() => [])
  ]);

  const utentiTotali = 'N/D';
  const localiTot = locali.length;
  const partiteTot = Array.isArray(partite) ? partite.length : 'N/D';
  const uptime = '99.8%';

  // build small list of locales (show up to 5)
  const localiPreview = (locali.slice(0, 5).map(l => ({ name: l.nome || l.nomeLocale || 'Locale', status: l.online ? 'online' : 'online', games: l.giochi || 2, lat: l.lat || '—' })));

  return `
    <div class="pg-title">Overview Globale</div>
    <div class="pg-sub">Stato dell'intera piattaforma Connected Games</div>
    <div class="stats-row">
      <div class="scard"><div class="scard-lbl">Tipologie gioco</div><div class="scard-val">${tipologie.length}</div><div class="scard-delta up">aggiornato</div></div>
      <div class="scard"><div class="scard-lbl">Locali attivi</div><div class="scard-val">${localiTot}</div><div class="scard-delta down">—</div></div>
      <div class="scard"><div class="scard-lbl">Partite totali</div><div class="scard-val">${partiteTot}</div><div class="scard-delta up">oggi</div></div>
      <div class="scard"><div class="scard-lbl">Uptime sistema</div><div class="scard-val" style="color:var(--grn)">${uptime}</div><div class="scard-delta up">ultimi 30gg</div></div>
    </div>
    <div class="row2">
      <div class="card">
        <div class="card-hd">Stato locali</div>
        ${localiPreview.map(l => `
          <div class="list-row">
            <div class="dot ${l.status === 'online' ? 'd-grn' : l.status === 'sync' ? 'd-amb' : 'd-red'}"></div>
            <div style="flex:1"><div class="rname">${l.name}</div><div class="rmeta">${l.games} giochi · latenza ${l.lat}</div></div>
            <span class="badge ${l.status === 'online' ? 'b-grn' : l.status === 'sync' ? 'b-amb' : 'b-red'}">${l.status}</span>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-hd">Microservizi</div>
        ${[
      { name: 'auth-service', port: 8081, status: 'up' },
      { name: 'game-service', port: 8080, status: 'up' },
      { name: 'stats-service', port: 8082, status: 'up' },
      { name: 'tournament-service', port: 8083, status: 'up' },
      { name: 'mqtt-broker', port: 1883, status: 'up' },
      { name: 'edge-sync-service', port: 8086, status: 'degraded' }
    ].map(s => `
          <div class="list-row">
            <div class="dot ${s.status === 'up' ? 'd-grn' : 'd-amb'}"></div>
            <div style="flex:1;font-family:monospace;font-size:11px;color:var(--acc2)">${s.name}</div>
            <div style="font-size:10px;color:var(--txt3)">:${s.port}</div>
            <span class="badge ${s.status === 'up' ? 'b-grn' : 'b-amb'}">${s.status}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export function platformUsers() {
  return `
    <div class="pg-title">Gestione Utenti</div>
    <div class="pg-sub">Tutti gli utenti registrati sulla piattaforma</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="act-btn">+&nbsp; Nuovo utente</button>
    </div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr><th>Utente</th><th>Ruolo</th><th>Locale</th><th>Partite</th><th>Stato</th><th>Azioni</th></tr>
        </thead>
        <tbody>
          ${[
      { name: 'Mario Rossi', role: 'Giocatore', locale: 'Bar Belvedere', matches: 74, active: true },
      { name: 'Anna Bianchi', role: 'Giocatore', locale: 'Milano', matches: 58, active: true },
      { name: 'Giuseppe Verdi', role: 'Admin Locale', locale: 'Bar Belvedere', matches: 0, active: true },
      { name: 'Lucia Neri', role: 'Giocatore', locale: 'Torino', matches: 12, active: false },
      { name: 'Roberto Blu', role: 'Admin Gioco', locale: '—', matches: 0, active: true }
    ].map(u => `
            <tr>
              <td><div style="font-weight:500;font-size:12px">${u.name}</div></td>
              <td><span class="badge ${u.role === 'Giocatore' ? 'b-blu' : u.role === 'Admin Locale' ? 'b-amb' : 'b-grn'}">${u.role}</span></td>
              <td style="font-size:11px;color:var(--txt2)">${u.locale}</td>
              <td style="font-size:12px">${u.matches}</td>
              <td><span class="badge ${u.active ? 'b-grn' : 'b-red'}">${u.active ? 'attivo' : 'sospeso'}</span></td>
              <td><button class="act-btn">Edit</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── LOCALI ───────────────────────────────────────────────────────────────────
export function platformLocali() {
  return `
    <div class="pg-title">Gestione Locali</div>
    <div class="pg-sub">Tutti i locali registrati sulla piattaforma</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="act-btn">+&nbsp; Nuovo locale</button>
    </div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr><th>Nome</th><th>Tipo</th><th>Città</th><th>Giochi</th><th>Stato</th><th></th></tr>
        </thead>
        <tbody>
          ${[
      { name: 'Bar Belvedere', type: 'Pubblico', city: 'Roma', games: 4, ok: true },
      { name: 'Circolo Sportivo', type: 'Pubblico', city: 'Milano', games: 6, ok: true },
      { name: 'Sala Giochi', type: 'Pubblico', city: 'Torino', games: 3, ok: true },
      { name: 'Casa di Mario', type: 'Privato', city: 'Roma', games: 2, ok: true },
      { name: 'Bar Sport', type: 'Pubblico', city: 'Genova', games: 2, ok: false }
    ].map(l => `
            <tr>
              <td style="font-weight:500;font-size:12px">${l.name}</td>
              <td><span class="badge ${l.type === 'Pubblico' ? 'b-blu' : 'b-amb'}">${l.type}</span></td>
              <td style="font-size:11px">${l.city}</td>
              <td>${l.games}</td>
              <td><span class="badge ${l.ok ? 'b-grn' : 'b-red'}">${l.ok ? 'online' : 'offline'}</span></td>
              <td><button class="act-btn">Dettagli</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── GAMES ────────────────────────────────────────────────────────────────────
export function platformGames() {
  setTimeout(initPlatformGames, 0);

  return `
    <div class="pg-title">Tipi di Gioco</div>
    <div class="pg-sub">Definizione giochi e configurazione sensori</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="btn-nuovo-gioco" class="act-btn">+ Nuovo tipo gioco</button>
    </div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr><th>Gioco</th><th>Sensori def.</th><th>Installazioni</th><th>Partite totali</th><th></th></tr>
        </thead>
        <tbody id="games-tbody">
          <tr><td colspan="5" style="text-align:center;padding:20px">Caricamento…</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Nuovo gioco -->
    <div id="modal-new-game" style="
      display:none;position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;
    ">
      <div class="card" style="width:420px;max-width:90%;background:var(--surf);border:1px solid var(--bdr);">
        <div class="card-hd" style="margin-bottom:20px">Crea Nuovo Tipo Gioco</div>
        <div style="margin-bottom:14px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Nome Gioco</label>
          <input id="mg-name" type="text" placeholder="Es. Ping Pong Elettronico" style="${INPUT_STYLE}" />
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Descrizione</label>
          <textarea id="mg-desc" rows="2" style="${INPUT_STYLE}resize:vertical;"></textarea>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Regole base</label>
          <textarea id="mg-rules" rows="2" style="${INPUT_STYLE}resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="btn-close-game" style="padding:8px 16px;background:none;border:1px solid var(--bdr);border-radius:6px;color:var(--txt2);cursor:pointer;">Annulla</button>
          <button id="btn-save-game" class="act-btn">Salva Gioco</button>
        </div>
      </div>
    </div>

    <!-- Modal: Config sensori -->
    ${_sensorModalHTML()}
  `;
}

// ─── HTML del modal sensori (estratto per pulizia) ────────────────────────────
function _sensorModalHTML() {
  const tipiOptions = TIPI_SENSORE.map(t =>
    `<option value="${t}">${iconaSensore(t)} ${t}</option>`
  ).join('');

  return `
    <div id="modal-sensori" style="
      display:none;position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.7);z-index:1001;align-items:flex-start;
      justify-content:center;overflow-y:auto;padding:24px 0;
    ">
      <div class="card" style="
        width:640px;max-width:95%;background:var(--surf);border:1px solid var(--bdr);
        margin:auto;
      ">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div>
            <div class="card-hd" style="margin:0" id="ms-title">Config Sensori</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:3px" id="ms-subtitle"></div>
          </div>
          <button id="ms-close" style="
            background:none;border:1px solid var(--bdr);border-radius:6px;
            color:var(--txt2);cursor:pointer;padding:6px 12px;font-size:12px;
          ">✕ Chiudi</button>
        </div>

        <!-- Lista sensori esistenti -->
        <div id="ms-list" style="margin-bottom:20px;min-height:60px;">
          <div style="text-align:center;color:var(--txt3);padding:20px;font-size:12px">Caricamento sensori…</div>
        </div>

        <hr style="border:none;border-top:1px solid var(--bdr);margin-bottom:20px;">

        <!-- Form aggiungi / modifica sensore -->
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--txt2);margin-bottom:14px" id="ms-form-title">
            ➕ Aggiungi nuovo sensore
          </div>
          <input type="hidden" id="ms-edit-id" value="">

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div>
              <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Nome sensore *</label>
              <input id="ms-nome" type="text" placeholder="Es. Sensore Goal Porta A" style="${INPUT_STYLE}" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Tipo *</label>
              <select id="ms-tipo" style="${INPUT_STYLE}">
                ${tipiOptions}
              </select>
            </div>
          </div>

          <div style="margin-bottom:12px;">
            <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Descrizione</label>
            <textarea id="ms-desc" rows="2" placeholder="Descrivi cosa misura questo sensore…" style="${INPUT_STYLE}resize:vertical;"></textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
            <div>
              <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Unità di misura</label>
              <input id="ms-unita" type="text" placeholder="Es. goal, cm, m/s" style="${INPUT_STYLE}" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Valore minimo</label>
              <input id="ms-min" type="number" step="any" placeholder="0" style="${INPUT_STYLE}" />
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt3);display:block;margin-bottom:5px">Valore massimo</label>
              <input id="ms-max" type="number" step="any" placeholder="100" style="${INPUT_STYLE}" />
            </div>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;">
            <button id="ms-form-cancel" style="
              display:none;padding:8px 16px;background:none;border:1px solid var(--bdr);
              border-radius:6px;color:var(--txt2);cursor:pointer;font-size:12px;
            ">Annulla modifica</button>
            <button id="ms-form-save" class="act-btn">Salva sensore</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Logica asincrona per la pagina Games ─────────────────────────────────────
async function initPlatformGames() {
  const tbody = document.getElementById('games-tbody');
  const modalNew = document.getElementById('modal-new-game');
  const modalSens = document.getElementById('modal-sensori');

  // Fetch giochi
  const giochi = await Api.getAllTipologieGioco();

  if (giochi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px">Nessun gioco. Aggiungine uno!</td></tr>`;
  } else {
    tbody.innerHTML = giochi.map(g => {
      const id = g.id || g.idTipologiaGioco;
      const nome = g.nome || g.nomeTipologiaGioco;
      return `
        <tr>
          <td><span style="font-size:14px">🎮</span> <span style="font-weight:500;font-size:12px">${nome}</span></td>
          <td id="sensor-count-${id}"><span style="color:var(--txt3);font-size:11px">—</span></td>
          <td>${g.inst || 0}</td>
          <td>${g.matches || 0}</td>
          <td><button class="act-btn btn-config" data-id="${id}" data-nome="${nome}">⚙ Config sensori</button></td>
        </tr>
      `;
    }).join('');

    // Carichiamo il conteggio sensori per ogni gioco in background
    for (const g of giochi) {
      const id = g.id || g.idTipologiaGioco;
      _aggiornaCounting(id);
    }
  }

  // ── Listener: apri modal nuovo gioco ──
  document.getElementById('btn-nuovo-gioco').onclick = () => {
    document.getElementById('mg-name').value = '';
    document.getElementById('mg-desc').value = '';
    document.getElementById('mg-rules').value = '';
    modalNew.style.display = 'flex';
  };
  document.getElementById('btn-close-game').onclick = () => { modalNew.style.display = 'none'; };

  document.getElementById('btn-save-game').onclick = async () => {
    const name = document.getElementById('mg-name').value.trim();
    const desc = document.getElementById('mg-desc').value.trim();
    const rules = document.getElementById('mg-rules').value.trim();

    if (!name || !desc || !rules) { alert('Compila tutti i campi prima di salvare.'); return; }

    const btn = document.getElementById('btn-save-game');
    btn.textContent = 'Salvataggio…'; btn.disabled = true;

    const ok = await Api.createTipologiaGioco({ nomeTipologiaGioco: name, descrizione: desc, regole: rules });

    if (ok) { modalNew.style.display = 'none'; initPlatformGames(); }
    else { alert('Errore durante il salvataggio.'); }

    btn.textContent = 'Salva Gioco'; btn.disabled = false;
  };

  // ── Listener: apri modal config sensori ──
  document.querySelectorAll('.btn-config').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.currentTarget.getAttribute('data-id'));
      const nome = e.currentTarget.getAttribute('data-nome');
      openSensoriModal(id, nome);
    });
  });

  // ── Listener: chiudi modal sensori ──
  document.getElementById('ms-close').onclick = () => { modalSens.style.display = 'none'; };
  modalSens.addEventListener('click', e => { if (e.target === modalSens) modalSens.style.display = 'none'; });
}

// ─── Apri e popola il modal sensori ──────────────────────────────────────────
async function openSensoriModal(tipologiaId, nomeGioco) {
  const modal = document.getElementById('modal-sensori');
  document.getElementById('ms-title').textContent = `Sensori — ${nomeGioco}`;
  document.getElementById('ms-subtitle').textContent = `tipologia_id: ${tipologiaId}`;
  _resetSensoreForm(tipologiaId);
  modal.style.display = 'flex';

  await _renderSensoriList(tipologiaId);

  // show add-new form under the list (only creation UI, no edit/delete/toggle)
  const formEl = document.getElementById('ms-form-title');
  if (formEl && formEl.parentElement) formEl.parentElement.style.display = 'block';

  // ensure form is reset for 'add' mode
  _resetSensoreForm(tipologiaId);

  // attach save handler (creates a draft locally; backend creation currently not available)
  const saveBtn = document.getElementById('ms-form-save');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const nome = document.getElementById('ms-nome').value.trim();
      if (!nome) { alert('Il nome del sensore è obbligatorio.'); return; }

      // build payload like the frontend originally did (tipologia template)
      const payload = {
        tipologiaId,
        nomeSensore: nome,
        tipo: document.getElementById('ms-tipo').value,
        descrizione: document.getElementById('ms-desc').value.trim() || null,
        unitaMisura: document.getElementById('ms-unita').value.trim() || null,
        valoreMin: document.getElementById('ms-min').value !== '' ? parseFloat(document.getElementById('ms-min').value) : null,
        valoreMax: document.getElementById('ms-max').value !== '' ? parseFloat(document.getElementById('ms-max').value) : null,
        attivo: true
      };

      // For now, do not call backend to avoid 400/404 — store draft locally and refresh list (visual only)
      console.info('Nuovo sensore (bozza):', payload);
      // non-blocking notification in modal
      const oldSubtitle = document.getElementById('ms-subtitle').textContent;
      document.getElementById('ms-subtitle').textContent = 'Bozza creata localmente (non inviata al server)';
      setTimeout(() => { document.getElementById('ms-subtitle').textContent = oldSubtitle; }, 3000);

      // append the draft to the list UI (client-side only)
      const container = document.getElementById('ms-list');
      const draftHtml = `\n    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surf2);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--grn);">\n      <span style="font-size:18px;width:24px;text-align:center">${iconaSensore(payload.tipo)}</span>\n      <div style="flex:1;min-width:0;">\n        <div style="font-size:12px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\n          ${payload.nomeSensore}\n        </div>\n        <div style="font-size:10px;color:var(--txt3);margin-top:2px;">\n          <span class="badge ${_tipoBadgeClass(payload.tipo)}" style="font-size:9px;margin-right:4px">${payload.tipo}</span>\n          ${payload.unitaMisura ? `· unità: <b>${payload.unitaMisura}</b>` : ''}\n          ${(payload.valoreMin != null && payload.valoreMax != null) ? `· range: ${payload.valoreMin}–${payload.valoreMax}` : ''}\n        </div>\n      </div>\n      <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;color:var(--txt3);font-size:11px;">\n        <span style="color:var(--grn)">● BOZZA</span>\n      </div>\n    </div>\n  `;
      if (container) container.insertAdjacentHTML('afterbegin', draftHtml);

      _resetSensoreForm(tipologiaId);
      // update counter locally to avoid extra backend fetch
      const cell = document.getElementById(`sensor-count-${tipologiaId}`);
      if (cell) {
        const prev = cell.querySelector('span');
        // try parse current count from innerText
        const match = prev ? prev.textContent.match(/\d+/) : null;
        const curr = match ? parseInt(match[0], 10) : 0;
        const attiviMatch = cell.textContent.match(/\((\d+) attivi\)/);
        const currAttivi = attiviMatch ? parseInt(attiviMatch[1], 10) : 0;
        cell.innerHTML = `<span style="font-size:12px">${curr + 1}</span>\n          <span style="font-size:10px;color:var(--grn);margin-left:4px">(${currAttivi + 1} attivi)</span>`;
      }
    };
  }
}

// ─── Renderizza la lista sensori esistenti ────────────────────────────────────
async function _renderSensoriList(tipologiaId) {
  const container = document.getElementById('ms-list');
  container.innerHTML = `<div style="text-align:center;color:var(--txt3);padding:14px;font-size:12px">Caricamento…</div>`;

  const sensori = await Api.getSensoriByTipologia(tipologiaId);

  if (sensori.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;color:var(--txt3);padding:18px;font-size:12px;background:var(--surf2);border-radius:8px;">
        Nessun sensore configurato. Aggiungine uno qui sotto.
      </div>`;
    return;
  }

  container.innerHTML = sensori.map(s => `
    <div style="
      display:flex;align-items:center;gap:10px;padding:10px 14px;
      background:var(--surf2);border-radius:8px;margin-bottom:8px;
      border-left:3px solid ${s.attivo ? 'var(--grn)' : 'var(--bdr)'};
    ">
      <span style="font-size:18px;width:24px;text-align:center">${iconaSensore(s.tipo)}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${s.nomeSensore}
        </div>
        <div style="font-size:10px;color:var(--txt3);margin-top:2px;">
          <span class="badge ${_tipoBadgeClass(s.tipo)}" style="font-size:9px;margin-right:4px">${s.tipo}</span>
          ${s.unitaMisura ? `· unità: <b>${s.unitaMisura}</b>` : ''}
          ${(s.valoreMin != null && s.valoreMax != null) ? `· range: ${s.valoreMin}–${s.valoreMax}` : ''}
          ${s.descrizione ? `<span title="${s.descrizione}" style="color:var(--acc2);cursor:default"> ℹ</span>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;color:var(--txt3);font-size:11px;">
        ${s.attivo ? '<span style="color:var(--grn)">● ON</span>' : '<span>○ OFF</span>'}
      </div>
    </div>
  `).join('');

  // view-only: no edit/toggle/delete listeners
}

// ─── Reset form (modalità "aggiungi") ─────────────────────────────────────────
function _resetSensoreForm(tipologiaId) {
  document.getElementById('ms-edit-id').value = '';
  document.getElementById('ms-nome').value = '';
  document.getElementById('ms-tipo').value = 'CUSTOM';
  document.getElementById('ms-desc').value = '';
  document.getElementById('ms-unita').value = '';
  document.getElementById('ms-min').value = '';
  document.getElementById('ms-max').value = '';
  document.getElementById('ms-form-title').innerHTML = '➕ Aggiungi nuovo sensore';
  document.getElementById('ms-form-cancel').style.display = 'none';
  document.getElementById('ms-form-save').textContent = 'Salva sensore';
}

// ─── Popola form in modalità "modifica" ───────────────────────────────────────
function _popolaFormSensore(s, tipologiaId) {
  document.getElementById('ms-edit-id').value = s.id;
  document.getElementById('ms-nome').value = s.nomeSensore || '';
  document.getElementById('ms-tipo').value = s.tipo || 'CUSTOM';
  document.getElementById('ms-desc').value = s.descrizione || '';
  document.getElementById('ms-unita').value = s.unitaMisura || '';
  document.getElementById('ms-min').value = s.valoreMin ?? '';
  document.getElementById('ms-max').value = s.valoreMax ?? '';
  document.getElementById('ms-form-title').innerHTML = `✏️ Modifica sensore: <b>${s.nomeSensore}</b>`;
  document.getElementById('ms-form-cancel').style.display = 'inline-flex';
  document.getElementById('ms-form-save').textContent = 'Aggiorna sensore';

  // Scroll al form
  document.getElementById('ms-form-title').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Salva (POST) o aggiorna (PUT) sensore ────────────────────────────────────
async function _salvaOAggiornaSensore(tipologiaId) {
  const editId = document.getElementById('ms-edit-id').value;
  const nome = document.getElementById('ms-nome').value.trim();
  const tipo = document.getElementById('ms-tipo').value;
  const desc = document.getElementById('ms-desc').value.trim();
  const unita = document.getElementById('ms-unita').value.trim();
  const minRaw = document.getElementById('ms-min').value;
  const maxRaw = document.getElementById('ms-max').value;

  if (!nome) { alert('Il nome del sensore è obbligatorio.'); return; }

  const payload = {
    tipologiaId,
    nomeSensore: nome,
    tipo,
    descrizione: desc || null,
    unitaMisura: unita || null,
    valoreMin: minRaw !== '' ? parseFloat(minRaw) : null,
    valoreMax: maxRaw !== '' ? parseFloat(maxRaw) : null,
    attivo: true
  };

  const btn = document.getElementById('ms-form-save');
  btn.textContent = 'Salvataggio…'; btn.disabled = true;

  try {
    if (editId) {
      await Api.updateSensore(Number(editId), payload);
    } else {
      await Api.createSensore(payload);
    }
    _resetSensoreForm(tipologiaId);
  } catch (err) {
    alert('Errore durante il salvataggio del sensore.');
    console.error(err);
  } finally {
    btn.textContent = editId ? 'Aggiorna sensore' : 'Salva sensore';
    btn.disabled = false;
  }
}

// ─── Aggiorna il contatore sensori nella tabella ─────────────────────────────
async function _aggiornaCounting(tipologiaId) {
  const cell = document.getElementById(`sensor-count-${tipologiaId}`);
  if (!cell) return;
  const sensori = await Api.getSensoriByTipologia(tipologiaId);
  const attivi = sensori.filter(s => s.attivo).length;
  cell.innerHTML = `<span style="font-size:12px">${sensori.length}</span>
    <span style="font-size:10px;color:var(--grn);margin-left:4px">(${attivi} attivi)</span>`;
}

// ─── Utility badge colore per tipo ───────────────────────────────────────────
function _tipoBadgeClass(tipo) {
  const mappa = { OTTICO: 'b-blu', MAGNETICO: 'b-grn', PRESSIONE: 'b-amb', ULTRASONICO: 'b-blu', INFRAROSSO: 'b-red', ACCELEROMETRO: 'b-amb', CUSTOM: 'b-txt' };
  return mappa[tipo] || 'b-txt';
}

// ─── TOURNAMENTS ──────────────────────────────────────────────────────────────
export async function platformTournaments() {
  const [torneiNonOrdinati, tipologieGioco] = await Promise.all([
    Api.getAllTournaments(),
    Api.getAllTipologieGioco()
  ]);

  const tornei = torneiNonOrdinati.sort((a, b) => a.id - b.id);

  const giochiDisponibili = (tipologieGioco && tipologieGioco.length > 0) ? tipologieGioco : [
    { idTipologiaGioco: 1, nomeTipologiaGioco: 'Gioco 1' },
    { idTipologiaGioco: 2, nomeTipologiaGioco: 'Gioco 2' },
  ];

  const NOMI_GIOCHI = {};
  let opzioniGiochiHtml = '';

  giochiDisponibili.forEach(g => {
    const id = g.id || g.idTipologiaGioco;
    const nome = g.nome || g.nomeTipologiaGioco;
    NOMI_GIOCHI[id] = nome;
    opzioniGiochiHtml += `<option value="${id}">${nome}</option>`;
  });

  function getStatusBadge(status) {
    const s = (status || 'in arrivo').toLowerCase();
    if (s.includes('corso') || s === 'active') return 'b-grn';
    if (s.includes('arrivo') || s === 'pending' || s.includes('definire')) return 'b-blu';
    return 'b-amb';
  }

  const html = `
    <div class="pg-title">Gestione Tornei</div>
    <div class="pg-sub">Crea e gestisci tornei multi-locale</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="btn-nuovo-torneo" class="act-btn">+&nbsp; Nuovo torneo</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="tbl" style="min-width:800px;">
        <thead>
          <tr>
            <th>ID</th><th>Nome Torneo</th><th>Gioco</th><th>Modalità</th>
            <th>Date (Inizio / Fine)</th><th>Regole</th><th>Status</th><th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          ${tornei.length > 0 ? tornei.map(t => {
    const nomeGioco = NOMI_GIOCHI[t.idTipologiaGioco] || 'Sconosciuto';
    const stato = t.classifica || 'In arrivo';
    const dateStr = t.dataFine ? `${t.dataInizio} / ${t.dataFine}` : `${t.dataInizio}`;
    return `
              <tr>
                <td style="font-size:11px;color:var(--txt3)">#${t.id}</td>
                <td style="font-weight:500;font-size:12px">${t.nome}</td>
                <td>${nomeGioco}</td>
                <td>${t.modalita || 'Squadre'}</td>
                <td style="font-size:11px">${dateStr}</td>
                <td style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px" title="${t.regole}">
                  ${t.regole || 'Standard'}
                </td>
                <td><span class="badge ${getStatusBadge(stato)}">${stato}</span></td>
                <td><button class="act-btn btn-gestisci" data-id="${t.id}">Gestisci</button></td>
              </tr>
            `;
  }).join('') : `<tr><td colspan="8" style="text-align:center;color:var(--txt3);padding:20px;">Nessun torneo trovato.</td></tr>`}
        </tbody>
      </table>
    </div>

    <!-- Modal Torneo -->
    <div id="modal-torneo" style="
      display:none;position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;
    ">
      <div class="card" style="width:500px;max-width:90%;background:var(--surf);border:1px solid var(--bdr);">
        <div id="modal-title" class="card-hd" style="margin-bottom:20px">Crea Nuovo Torneo</div>
        <input type="hidden" id="modal-t-id" value="" />
        <div style="margin-bottom:14px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Nome Torneo</label>
          <input id="modal-t-name" type="text" placeholder="Es. Coppa Primavera" style="${INPUT_STYLE}" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Gioco</label>
            <select id="modal-t-game" style="${INPUT_STYLE}">${opzioniGiochiHtml}</select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Modalità</label>
            <select id="modal-t-mod" style="${INPUT_STYLE}">
              <option value="Squadre">A Squadre</option>
              <option value="Individuale">Individuale</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Data Inizio</label>
            <input type="date" id="modal-t-start" style="${INPUT_STYLE}" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Data Fine (Opzionale)</label>
            <input type="date" id="modal-t-end" style="${INPUT_STYLE}" />
          </div>
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Stato Classifica</label>
          <select id="modal-t-status" style="${INPUT_STYLE}">
            <option value="Da definire">Da definire</option>
            <option value="In corso">In corso</option>
            <option value="Terminato">Terminato</option>
          </select>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Regole del Torneo</label>
          <textarea id="modal-t-rules" rows="3" placeholder="Es. Eliminazione diretta…" style="${INPUT_STYLE}resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="btn-annulla-torneo" style="
            padding:8px 16px;background:none;border:1px solid var(--bdr);
            border-radius:6px;color:var(--txt2);cursor:pointer;
          ">Annulla</button>
          <button id="btn-salva-torneo" class="act-btn">Salva</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const modal = document.getElementById('modal-torneo');
    const modalTitle = document.getElementById('modal-title');
    const idInput = document.getElementById('modal-t-id');
    const nameInput = document.getElementById('modal-t-name');
    const gameInput = document.getElementById('modal-t-game');
    const modInput = document.getElementById('modal-t-mod');
    const startInput = document.getElementById('modal-t-start');
    const endInput = document.getElementById('modal-t-end');
    const statusInput = document.getElementById('modal-t-status');
    const rulesInput = document.getElementById('modal-t-rules');
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('btn-nuovo-torneo')?.addEventListener('click', () => {
      modalTitle.textContent = 'Crea Nuovo Torneo';
      idInput.value = ''; nameInput.value = '';
      gameInput.value = Object.keys(NOMI_GIOCHI)[0] || '1';
      modInput.value = 'Squadre'; startInput.value = today;
      endInput.value = ''; statusInput.value = 'Da definire';
      rulesInput.value = 'Regole standard';
      modal.style.display = 'flex';
    });

    document.querySelectorAll('.btn-gestisci').forEach(btn => {
      btn.addEventListener('click', e => {
        const torneo = tornei.find(t => t.id == e.target.getAttribute('data-id'));
        if (!torneo) return;
        modalTitle.textContent = `Modifica Torneo #${torneo.id}`;
        idInput.value = torneo.id;
        nameInput.value = torneo.nome || '';
        gameInput.value = torneo.idTipologiaGioco || Object.keys(NOMI_GIOCHI)[0] || '1';
        modInput.value = torneo.modalita || 'Squadre';
        startInput.value = torneo.dataInizio || today;
        endInput.value = torneo.dataFine || '';
        statusInput.value = torneo.classifica || 'Da definire';
        rulesInput.value = torneo.regole || '';
        modal.style.display = 'flex';
      });
    });

    document.getElementById('btn-annulla-torneo')?.addEventListener('click', () => { modal.style.display = 'none'; });

    document.getElementById('btn-salva-torneo')?.addEventListener('click', async () => {
      if (!nameInput.value.trim() || !startInput.value) {
        alert("I campi 'Nome' e 'Data Inizio' sono obbligatori!"); return;
      }
      const btn = document.getElementById('btn-salva-torneo');
      btn.textContent = 'Salvataggio…'; btn.disabled = true;

      const payload = {
        nome: nameInput.value.trim(),
        idTipologiaGioco: parseInt(gameInput.value),
        modalita: modInput.value,
        regole: rulesInput.value.trim() || 'Nessuna regola specificata',
        classifica: statusInput.value,
        dataInizio: startInput.value,
        dataFine: endInput.value || null,
        localiIds: [1]
      };

      try {
        if (idInput.value) await Api.updateTournament(idInput.value, payload);
        else await Api.createTournament(payload);
        modal.style.display = 'none';
        // Ricarica la sezione corrente
        document.querySelector('.sb-btn.active')?.click() || document.querySelector('.nav-btn.active')?.click();
      } catch {
        alert('Errore nel salvataggio! Controlla i campi inseriti.');
      } finally {
        btn.textContent = 'Salva'; btn.disabled = false;
      }
    });
  }, 50);

  return html;
}

// ─── MONITOR ─────────────────────────────────────────────────────────────────
export async function platformMonitor() {
  const summary = await Api.getMonitorSummary().catch(() => null);
  const lat = await Api.getMonitorLatencies().catch(() => []);
  const logs = await Api.getMonitorLogs().catch(() => []);

  const apis = summary ? summary.apisCount || 0 : 0;
  const services = summary ? summary.servicesCount || 0 : 0;
  const gamesInstalled = summary ? summary.gamesInstalled || 0 : 0;
  const livePartite = summary ? summary.livePartite || 0 : 0;
  const reqpm = summary ? summary.reqPerMin || 0 : 0;

  return `
    <div class="pg-title">Monitor Sistema</div>
    <div class="pg-sub">Statistiche API e stato del sistema</div>
    <div class="stats-row">
      <div class="scard"><div class="scard-lbl">API endpoints</div><div class="scard-val">${apis}</div><div class="scard-delta up">monitor</div></div>
      <div class="scard"><div class="scard-lbl">Servizi</div><div class="scard-val">${services}</div><div class="scard-delta neutral">registrati</div></div>
      <div class="scard"><div class="scard-lbl">Giochi installati</div><div class="scard-val">${gamesInstalled}</div><div class="scard-delta up">installati</div></div>
      <div class="scard"><div class="scard-lbl">Partite live</div><div class="scard-val">${livePartite}</div><div class="scard-delta neutral">in corso</div></div>
    </div>
    <div class="card">
      <div class="card-hd">Req/min (stima)</div>
      <div style="padding:14px;font-family:monospace;color:var(--acc2)">${reqpm} req/min</div>
    </div>
    <div class="card">
      <div class="card-hd">Latenza API per endpoint</div>
      ${lat.map(e => `
        <div class="skill-row">
          <div class="skill-name" style="width:200px;font-family:monospace;font-size:10px;color:var(--acc2)">${e.ep}</div>
          <div class="skill-bar"><div class="skill-fill" style="width:${Math.min((e.ms || 0) / 300 * 100, 100)}%;background:${e.ok ? 'var(--grn)' : 'var(--red)'}"></div></div>
          <div class="skill-pct" style="width:40px">${e.ms}ms</div>
        </div>
      `).join('')}
    </div>
    <div class="card">
      <div class="card-hd">Ultimi eventi di sistema</div>
      ${logs.map(e => `
        <div class="list-row" style="gap:8px">
          <span style="font-size:9px;color:var(--txt3);width:56px;flex-shrink:0;font-family:monospace">${e.t}</span>
          <span class="badge ${e.type === 'INFO' ? 'b-blu' : e.type === 'WARN' ? 'b-amb' : 'b-red'}" style="width:36px;text-align:center">${e.type}</span>
          <span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${e.msg}</span>
          <span style="font-size:9px;color:var(--txt3);flex-shrink:0">${e.svc}</span>
        </div>
      `).join('')}
    </div>`;
}

// ─── LOGS ────────────────────────────────────────────────────────────────────
export function platformLogs() {
  return `
    <div class="pg-title">Log & Audit</div>
    <div class="pg-sub">Registro eventi e accessi alla piattaforma</div>
    <div class="card">
      <div class="card-hd">Ultimi eventi di sistema</div>
      ${[
      { t: '14:52:01', type: 'INFO', msg: 'Match created: ID#4821 · locale LOC-007 · game CB-001', svc: 'match-service' },
      { t: '14:51:48', type: 'WARN', msg: 'Edge LOC-004 offline — buffering 12 events locally', svc: 'edge-sync' },
      { t: '14:49:22', type: 'INFO', msg: 'User login: mario.rossi@email.it · IP 192.168.1.42', svc: 'auth-service' },
      { t: '14:47:10', type: 'INFO', msg: 'Goal event received: CB-001 team_a score=3', svc: 'mqtt-broker' },
      { t: '14:45:00', type: 'INFO', msg: 'Tournament standings updated: T-003 Calciobalilla Primavera', svc: 'tournament-service' },
      { t: '14:31:55', type: 'ERROR', msg: 'Edge sync timeout LOC-004 — retry in 30s', svc: 'edge-sync' },
      { t: '14:30:00', type: 'INFO', msg: 'Stats aggregation job completed: 847 records', svc: 'stats-service' }
    ].map(e => `
        <div class="list-row" style="gap:8px">
          <span style="font-size:9px;color:var(--txt3);width:56px;flex-shrink:0;font-family:monospace">${e.t}</span>
          <span class="badge ${e.type === 'INFO' ? 'b-blu' : e.type === 'WARN' ? 'b-amb' : 'b-red'}" style="width:36px;text-align:center">${e.type}</span>
          <span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${e.msg}</span>
          <span style="font-size:9px;color:var(--txt3);flex-shrink:0">${e.svc}</span>
        </div>
      `).join('')}
    </div>`;
}