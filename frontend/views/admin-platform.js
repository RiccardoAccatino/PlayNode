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

const RUOLI_UTENTE = ['Giocatore', 'Gestore', 'AdminGioco', 'AdminPiattaforma'];
const SESSI_UTENTE = ['Maschio', 'Femmina', 'Altro'];
const TIPI_ACCESSO = ['Luogo pubblico', 'Luogo privato'];

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

function badgeRuolo(ruolo) {
  const r = ruolo || '';
  if (r === 'Giocatore') return 'b-blu';
  if (r === 'Gestore') return 'b-amb';
  if (r === 'AdminGioco') return 'b-grn';
  if (r === 'AdminPiattaforma') return 'b-red';
  return 'b-txt';
}

function formatLogTime(t) {
  if (!t) return '—';
  try {
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    const m = String(t).match(/(\d{2}:\d{2}:\d{2})/);
    return m ? m[1] : String(t).slice(0, 16);
  } catch { return String(t).slice(0, 16); }
}

function _selectOptions(values, selected) {
  return values.map(v =>
    `<option value="${esc(v)}"${v === selected ? ' selected' : ''}>${esc(v)}</option>`
  ).join('');
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
export async function platformOverview() {
  let utenti = [], locali = [], tornei = [], partite = [], giochi = [], tipologie = [], summary = null, errBanner = '';

  try {
    [utenti, locali, tornei, partite, giochi, tipologie, summary] = await Promise.all([
      Api.getAllUtenti(),
      Api.getAllLocali(),
      Api.getAllTournaments(),
      Api.getAllPartite(),
      Api.getAllGiochiInstallati(),
      Api.getAllTipologieGioco(),
      Api.getMonitorSummary()
    ]);
  } catch (err) {
    errBanner = `<div class="connection-banner" style="margin-bottom:12px"><span>⚠️</span><span>${esc(err.message)}</span></div>`;
  }

  const torneiAttivi = tornei.filter(t => {
    const c = (t.classifica || '').toLowerCase();
    return c.includes('corso') || c.includes('definire') || !t.dataFine;
  }).length;

  const partiteLive = partite.filter(p => (p.stato || '').toUpperCase() === 'IN_CORSO').length;

  const giochiPerLocale = {};
  giochi.forEach(g => {
    const lid = g.localeId || g.idLocale;
    if (lid) giochiPerLocale[lid] = (giochiPerLocale[lid] || 0) + 1;
  });

  const localiPreview = locali.slice(0, 6).map(l => ({
    name: l.nome,
    indirizzo: l.indirizzo || '—',
    accesso: l.accesso || '—',
    games: giochiPerLocale[l.id] || 0
  }));

  return `
    <div class="pg-title">Overview Globale</div>
    <div class="pg-sub">Stato dell'intera piattaforma PlayNode — dati live dal backend</div>
    ${errBanner}
    <div class="stats-row">
      <div class="scard"><div class="scard-lbl">Utenti totali</div><div class="scard-val">${utenti.length}</div><div class="scard-delta up">registrati</div></div>
      <div class="scard"><div class="scard-lbl">Locali</div><div class="scard-val">${locali.length}</div><div class="scard-delta neutral">attivi</div></div>
      <div class="scard"><div class="scard-lbl">Tornei attivi</div><div class="scard-val">${torneiAttivi}</div><div class="scard-delta up">in corso / pianificati</div></div>
      <div class="scard"><div class="scard-lbl">Partite live</div><div class="scard-val">${partiteLive}</div><div class="scard-delta neutral">ora</div></div>
    </div>
    <div class="stats-row">
      <div class="scard"><div class="scard-lbl">Tipologie gioco</div><div class="scard-val">${tipologie.length}</div><div class="scard-delta neutral">catalogo</div></div>
      <div class="scard"><div class="scard-lbl">Tavoli installati</div><div class="scard-val">${giochi.length}</div><div class="scard-delta up">fisici</div></div>
      <div class="scard"><div class="scard-lbl">Partite totali</div><div class="scard-val">${partite.length}</div><div class="scard-delta neutral">storico</div></div>
      <div class="scard"><div class="scard-lbl">Eventi IoT/min</div><div class="scard-val">${summary?.mqttEventsLastMinute ?? '—'}</div><div class="scard-delta up">ultimo minuto</div></div>
    </div>
    <div class="row2">
      <div class="card">
        <div class="card-hd">Locali registrati</div>
        ${localiPreview.length ? localiPreview.map(l => `
          <div class="list-row">
            <div class="dot d-grn"></div>
            <div style="flex:1">
              <div class="rname">${esc(l.name)}</div>
              <div class="rmeta">${esc(l.indirizzo)} · ${l.games} tavoli · ${esc(l.accesso)}</div>
            </div>
            <span class="badge b-blu">${l.games} giochi</span>
          </div>
        `).join('') : '<div style="padding:16px;color:var(--txt3);font-size:12px">Nessun locale nel database.</div>'}
      </div>
      <div class="card">
        <div class="card-hd">Metriche sistema (game-service)</div>
        ${summary ? `
          <div class="list-row"><div style="flex:1;font-size:11px">API monitorate</div><span class="badge b-blu">${summary.apisCount}</span></div>
          <div class="list-row"><div style="flex:1;font-size:11px">Servizi registrati</div><span class="badge b-grn">${summary.servicesCount}</span></div>
          <div class="list-row"><div style="flex:1;font-size:11px">Req/min (stima)</div><span class="badge b-amb">${summary.reqPerMin}</span></div>
          <div class="list-row"><div style="flex:1;font-size:11px">Giochi installati (DB)</div><span class="badge b-grn">${summary.gamesInstalled}</span></div>
        ` : '<div style="padding:16px;color:var(--txt3);font-size:12px">Monitor non disponibile.</div>'}
      </div>
    </div>`;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export function platformUsers() {
  setTimeout(initPlatformUsers, 0);
  return `
    <div class="pg-title">Gestione Utenti</div>
    <div class="pg-sub">CRUD utenti — auth-service /api/utenti</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="btn-nuovo-utente" class="act-btn">+ Nuovo utente</button>
    </div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr><th>ID</th><th>Username</th><th>Email</th><th>Ruolo</th><th>Sesso</th><th>Azioni</th></tr>
        </thead>
        <tbody id="users-tbody">
          <tr><td colspan="6" style="text-align:center;padding:20px">Caricamento…</td></tr>
        </tbody>
      </table>
    </div>
    <div id="modal-utente" class="cgp-modal-overlay">
      <div class="cgp-modal" style="width:480px;max-width:95%">
        <div class="cgp-modal-title" id="mu-title">Nuovo utente</div>
        <div class="cgp-modal-body">
          <input type="hidden" id="mu-id" value="">
          <div style="margin-bottom:12px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Username *</label>
            <input id="mu-username" type="text" style="${INPUT_STYLE}" />
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Email *</label>
            <input id="mu-email" type="email" style="${INPUT_STYLE}" />
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Password <span id="mu-pw-hint" style="color:var(--txt3)">*</span></label>
            <input id="mu-password" type="password" placeholder="Min. 6 caratteri" style="${INPUT_STYLE}" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Ruolo *</label>
              <select id="mu-ruolo" style="${INPUT_STYLE}">${_selectOptions(RUOLI_UTENTE, 'Giocatore')}</select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Sesso *</label>
              <select id="mu-sesso" style="${INPUT_STYLE}">${_selectOptions(SESSI_UTENTE, 'Maschio')}</select>
            </div>
          </div>
        </div>
        <div class="cgp-modal-actions">
          <button id="mu-annulla" class="act-btn" style="background:none;border:1px solid var(--bdr)">Annulla</button>
          <button id="mu-salva" class="act-btn">Salva</button>
        </div>
      </div>
    </div>`;
}

async function initPlatformUsers() {
  const tbody = document.getElementById('users-tbody');
  const modal = document.getElementById('modal-utente');
  if (!tbody) return;

  let utenti = [];
  try {
    utenti = await Api.getAllUtenti();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--red)">${esc(err.message)}</td></tr>`;
    showToast(err.message, 'error', 5000);
    return;
  }

  if (!utenti.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--txt3)">Nessun utente registrato.</td></tr>`;
  } else {
    tbody.innerHTML = utenti.map(u => `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:var(--txt3)">#${u.id}</td>
        <td style="font-weight:500;font-size:12px">${esc(u.username)}</td>
        <td style="font-size:11px;color:var(--txt2)">${esc(u.email)}</td>
        <td><span class="badge ${badgeRuolo(u.ruolo)}">${esc(u.ruolo)}</span></td>
        <td style="font-size:11px">${esc(u.sesso)}</td>
        <td style="display:flex;gap:6px">
          <button class="act-btn btn-edit-user" data-id="${u.id}">Modifica</button>
          <button class="danger-btn btn-del-user" data-id="${u.id}" data-name="${esc(u.username)}">Elimina</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('btn-nuovo-utente')?.addEventListener('click', () => {
    document.getElementById('mu-title').textContent = 'Nuovo utente';
    document.getElementById('mu-id').value = '';
    document.getElementById('mu-username').value = '';
    document.getElementById('mu-email').value = '';
    document.getElementById('mu-password').value = '';
    document.getElementById('mu-ruolo').value = 'Giocatore';
    document.getElementById('mu-sesso').value = 'Maschio';
    document.getElementById('mu-pw-hint').textContent = '*';
    modal.classList.add('open');
  });

  document.getElementById('mu-annulla')?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  document.getElementById('mu-salva')?.addEventListener('click', async () => {
    const id = document.getElementById('mu-id').value;
    const payload = {
      username: document.getElementById('mu-username').value.trim(),
      email: document.getElementById('mu-email').value.trim(),
      password: document.getElementById('mu-password').value,
      ruolo: document.getElementById('mu-ruolo').value,
      sesso: document.getElementById('mu-sesso').value
    };
    if (!payload.username || !payload.email) {
      showToast('Username e email sono obbligatori.', 'warning'); return;
    }
    if (!id && !payload.password) {
      showToast('La password è obbligatoria per i nuovi utenti.', 'warning'); return;
    }
    const btn = document.getElementById('mu-salva');
    btn.disabled = true; btn.textContent = 'Salvataggio…';
    try {
      if (id) {
        if (!payload.password) delete payload.password;
        await Api.updateUtente(id, payload);
        showToast(`Utente #${id} aggiornato.`, 'success');
      } else {
        await Api.createUtente(payload);
        showToast('Utente creato con successo.', 'success');
      }
      modal.classList.remove('open');
      initPlatformUsers();
    } catch (err) {
      showToast(err.message, 'error', 5000);
    } finally {
      btn.disabled = false; btn.textContent = 'Salva';
    }
  });

  tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = utenti.find(x => String(x.id) === btn.getAttribute('data-id'));
      if (!u) return;
      document.getElementById('mu-title').textContent = `Modifica utente #${u.id}`;
      document.getElementById('mu-id').value = u.id;
      document.getElementById('mu-username').value = u.username || '';
      document.getElementById('mu-email').value = u.email || '';
      document.getElementById('mu-password').value = '';
      document.getElementById('mu-ruolo').value = u.ruolo || 'Giocatore';
      document.getElementById('mu-sesso').value = u.sesso || 'Maschio';
      document.getElementById('mu-pw-hint').textContent = '(lascia vuoto per non cambiare)';
      modal.classList.add('open');
    });
  });

  tbody.querySelectorAll('.btn-del-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      if (!confirm(`Eliminare l'utente "${name}" (#${id})?`)) return;
      try {
        const ok = await Api.deleteUtente(id);
        showToast(ok ? `Utente #${id} eliminato.` : `Utente #${id} non trovato.`, ok ? 'success' : 'warning');
        initPlatformUsers();
      } catch (err) {
        showToast(err.message, 'error', 5000);
      }
    });
  });
}

// ─── LOCALI ───────────────────────────────────────────────────────────────────
export function platformLocali() {
  setTimeout(initPlatformLocali, 0);
  return `
    <div class="pg-title">Gestione Locali</div>
    <div class="pg-sub">CRUD locali — game-service /api/locali</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="btn-nuovo-locale" class="act-btn">+ Nuovo locale</button>
    </div>
    <div class="card">
      <table class="tbl">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Indirizzo</th><th>Accesso</th><th>Gestore</th><th>Tavoli</th><th>Azioni</th></tr>
        </thead>
        <tbody id="locali-tbody">
          <tr><td colspan="7" style="text-align:center;padding:20px">Caricamento…</td></tr>
        </tbody>
      </table>
    </div>
    <div id="modal-locale" class="cgp-modal-overlay">
      <div class="cgp-modal" style="width:500px;max-width:95%">
        <div class="cgp-modal-title" id="ml-title">Nuovo locale</div>
        <div class="cgp-modal-body">
          <input type="hidden" id="ml-id" value="">
          <div style="margin-bottom:12px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Nome *</label>
            <input id="ml-nome" type="text" style="${INPUT_STYLE}" />
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Indirizzo *</label>
            <input id="ml-indirizzo" type="text" style="${INPUT_STYLE}" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Accesso *</label>
              <select id="ml-accesso" style="${INPUT_STYLE}">${_selectOptions(TIPI_ACCESSO, 'Luogo pubblico')}</select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Gestore *</label>
              <select id="ml-gestore" style="${INPUT_STYLE}">
                <option value="">Caricamento gestori…</option>
              </select>
            </div>
          </div>
        </div>
        <div class="cgp-modal-actions">
          <button id="ml-annulla" class="act-btn" style="background:none;border:1px solid var(--bdr)">Annulla</button>
          <button id="ml-salva" class="act-btn">Salva</button>
        </div>
      </div>
    </div>`;
}

async function initPlatformLocali() {
  const tbody = document.getElementById('locali-tbody');
  const modal = document.getElementById('modal-locale');
  if (!tbody) return;

  let locali = [], utenti = [], giochi = [];
  try {
    [locali, utenti, giochi] = await Promise.all([
      Api.getAllLocali(),
      Api.getAllUtenti(),
      Api.getAllGiochiInstallati()
    ]);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--red)">${esc(err.message)}</td></tr>`;
    showToast(err.message, 'error', 5000);
    return;
  }

  const gestori = utenti.filter(u => u.ruolo === 'Gestore');
  const gestoreNome = (id) => {
    const g = utenti.find(u => u.id === id);
    return g ? g.username : `#${id}`;
  };
  const tavoliCount = (id) => giochi.filter(g => (g.localeId || g.idLocale) === id).length;

  if (!locali.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--txt3)">Nessun locale registrato.</td></tr>`;
  } else {
    tbody.innerHTML = locali.map(l => `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:var(--txt3)">#${l.id}</td>
        <td style="font-weight:500;font-size:12px">${esc(l.nome)}</td>
        <td style="font-size:11px;color:var(--txt2)">${esc(l.indirizzo)}</td>
        <td><span class="badge ${l.accesso === 'Luogo privato' ? 'b-amb' : 'b-blu'}">${esc(l.accesso || '—')}</span></td>
        <td style="font-size:11px">${esc(gestoreNome(l.gestoreId))}</td>
        <td>${tavoliCount(l.id)}</td>
        <td style="display:flex;gap:6px">
          <button class="act-btn btn-edit-locale" data-id="${l.id}">Modifica</button>
          <button class="danger-btn btn-del-locale" data-id="${l.id}" data-name="${esc(l.nome)}">Elimina</button>
        </td>
      </tr>
    `).join('');
  }

  function popolaGestoriSelect(selectedId) {
    const sel = document.getElementById('ml-gestore');
    if (!sel) return;
    if (!gestori.length) {
      sel.innerHTML = '<option value="">Nessun gestore disponibile</option>';
      return;
    }
    sel.innerHTML = gestori.map(g =>
      `<option value="${g.id}"${String(g.id) === String(selectedId) ? ' selected' : ''}>${esc(g.username)} (#${g.id})</option>`
    ).join('');
  }

  document.getElementById('btn-nuovo-locale')?.addEventListener('click', () => {
    document.getElementById('ml-title').textContent = 'Nuovo locale';
    document.getElementById('ml-id').value = '';
    document.getElementById('ml-nome').value = '';
    document.getElementById('ml-indirizzo').value = '';
    document.getElementById('ml-accesso').value = 'Luogo pubblico';
    popolaGestoriSelect(gestori[0]?.id);
    modal.classList.add('open');
  });

  document.getElementById('ml-annulla')?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  document.getElementById('ml-salva')?.addEventListener('click', async () => {
    const id = document.getElementById('ml-id').value;
    const payload = {
      nome: document.getElementById('ml-nome').value.trim(),
      indirizzo: document.getElementById('ml-indirizzo').value.trim(),
      accesso: document.getElementById('ml-accesso').value,
      gestoreId: Number(document.getElementById('ml-gestore').value)
    };
    if (!payload.nome || !payload.indirizzo || !payload.gestoreId) {
      showToast('Compila tutti i campi obbligatori.', 'warning'); return;
    }
    const btn = document.getElementById('ml-salva');
    btn.disabled = true; btn.textContent = 'Salvataggio…';
    try {
      if (id) {
        await Api.updateLocale(id, payload);
        showToast(`Locale #${id} aggiornato.`, 'success');
      } else {
        await Api.createLocale(payload);
        showToast('Locale creato con successo.', 'success');
      }
      modal.classList.remove('open');
      initPlatformLocali();
    } catch (err) {
      showToast(err.message, 'error', 5000);
    } finally {
      btn.disabled = false; btn.textContent = 'Salva';
    }
  });

  tbody.querySelectorAll('.btn-edit-locale').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = locali.find(x => String(x.id) === btn.getAttribute('data-id'));
      if (!l) return;
      document.getElementById('ml-title').textContent = `Modifica locale #${l.id}`;
      document.getElementById('ml-id').value = l.id;
      document.getElementById('ml-nome').value = l.nome || '';
      document.getElementById('ml-indirizzo').value = l.indirizzo || '';
      document.getElementById('ml-accesso').value = l.accesso || 'Luogo pubblico';
      popolaGestoriSelect(l.gestoreId);
      modal.classList.add('open');
    });
  });

  tbody.querySelectorAll('.btn-del-locale').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      if (!confirm(`Eliminare il locale "${name}" (#${id})?`)) return;
      try {
        const ok = await Api.deleteLocale(id);
        showToast(ok ? `Locale #${id} eliminato.` : `Locale #${id} non trovato.`, ok ? 'success' : 'warning');
        initPlatformLocali();
      } catch (err) {
        showToast(err.message, 'error', 5000);
      }
    });
  });
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

  let giochi = [];
  let installati = [];
  let partite = [];
  try {
    [giochi, installati, partite] = await Promise.all([
      Api.getAllTipologieGioco(),
      Api.getAllGiochiInstallati(),
      Api.getAllPartite()
    ]);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--red)">
      Errore caricamento tipologie: ${err.message || err}</td></tr>`;
    return;
  }

  if (giochi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px">Nessun gioco. Aggiungine uno!</td></tr>`;
  } else {
    tbody.innerHTML = giochi.map(g => {
      const id = g.id;
      const nome = g.nome;
      const numInst = installati.filter(i => i.tipologiaId === id).length;
      const numPartite = partite.filter(p => {
        const tavolo = installati.find(i => i.id === p.idGiocoInstallato);
        return tavolo?.tipologiaId === id;
      }).length;
      return `
        <tr>
          <td><span style="font-size:14px">🎮</span> <span style="font-weight:500;font-size:12px">${nome}</span></td>
          <td id="sensor-count-${id}"><span style="color:var(--txt3);font-size:11px">—</span></td>
          <td>${numInst}</td>
          <td>${numPartite}</td>
          <td><button class="act-btn btn-config" data-id="${id}" data-nome="${nome}">⚙ Config sensori</button></td>
        </tr>
      `;
    }).join('');

    // Carichiamo il conteggio sensori per ogni gioco in background
    for (const g of giochi) {
      _aggiornaCounting(g.id);
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

    if (!name || !desc || !rules) { showToast('Compila tutti i campi prima di salvare.', 'warning'); return; }

    const btn = document.getElementById('btn-save-game');
    btn.textContent = 'Salvataggio…'; btn.disabled = true;

    try {
      await Api.createTipologiaGioco({ nomeTipologiaGioco: name, descrizione: desc, regole: rules });
      modalNew.style.display = 'none';
      showToast('Tipologia gioco creata.', 'success');
      initPlatformGames();
    } catch (err) {
      showToast(err.message, 'error', 5000);
    } finally {
      btn.textContent = 'Salva Gioco'; btn.disabled = false;
    }
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

  const saveBtn = document.getElementById('ms-form-save');
  if (saveBtn) {
    saveBtn.onclick = () => _salvaOAggiornaSensore(tipologiaId);
  }
  const cancelBtn = document.getElementById('ms-form-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = () => _resetSensoreForm(tipologiaId);
  }
}

// ─── Renderizza la lista sensori esistenti ────────────────────────────────────
async function _renderSensoriList(tipologiaId) {
  const container = document.getElementById('ms-list');
  container.innerHTML = `<div style="text-align:center;color:var(--txt3);padding:14px;font-size:12px">Caricamento…</div>`;

  let sensori = [];
  try {
    sensori = await Api.getSensoriByTipologia(tipologiaId);
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;color:var(--red);padding:14px;font-size:12px">${esc(err.message)}</div>`;
    showToast(err.message, 'error', 5000);
    return;
  }

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
          ${s.nomeSensore} <span style="font-size:9px;color:var(--txt3)">#${s.id}</span>
        </div>
        <div style="font-size:10px;color:var(--txt3);margin-top:2px;">
          <span class="badge ${_tipoBadgeClass(s.tipo)}" style="font-size:9px;margin-right:4px">${s.tipo}</span>
          ${s.idGiocoFisico ? `· tavolo #${s.idGiocoFisico}` : ''}
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

async function _risolviGiocoFisico(tipologiaId) {
  const giochi = (await Api.getAllGiochiInstallati())
    .filter(g => g.tipologiaId === tipologiaId);
  if (!giochi.length) {
    throw new Error('Nessun tavolo fisico installato per questa tipologia. Installa prima un gioco nel locale.');
  }
  giochi.sort((a, b) => (a.numSensori ?? 0) - (b.numSensori ?? 0));
  return giochi[0];
}

// ─── Salva sensore via POST /api/sensori (idGiocoFisico + tipo + posizione) ───
async function _salvaOAggiornaSensore(tipologiaId) {
  const editId = document.getElementById('ms-edit-id').value;
  const nome = document.getElementById('ms-nome').value.trim();
  const tipo = document.getElementById('ms-tipo').value;

  if (!nome) { showToast('Il nome/posizione del sensore è obbligatorio (es. "Porta Squadra 1").', 'warning'); return; }
  if (editId) {
    showToast('La modifica sensori (PUT) non è esposta dal backend.', 'warning');
    return;
  }

  const btn = document.getElementById('ms-form-save');
  btn.textContent = 'Salvataggio…'; btn.disabled = true;

  try {
    const gioco = await _risolviGiocoFisico(tipologiaId);
    const created = await Api.createSensore({
      idGiocoFisico: gioco.id,
      tipo,
      posizione: nome,
      nomeSensore: nome
    });

    _resetSensoreForm(tipologiaId);
    await _renderSensoriList(tipologiaId);
    await _aggiornaCounting(tipologiaId);

    const subtitle = document.getElementById('ms-subtitle');
    if (subtitle) {
      subtitle.textContent = `Sensore #${created.id} salvato su tavolo #${gioco.id} (${gioco.localeNome || 'locale'})`;
    }
  } catch (err) {
    showToast(err.message || 'Errore durante il salvataggio del sensore.', 'error', 5000);
    console.error(err);
  } finally {
    btn.textContent = 'Salva sensore';
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
  let torneiNonOrdinati = [], tipologieGioco = [], errBanner = '';
  try {
    [torneiNonOrdinati, tipologieGioco] = await Promise.all([
      Api.getAllTournaments(),
      Api.getAllTipologieGioco()
    ]);
  } catch (err) {
    errBanner = `<div class="connection-banner" style="margin-bottom:12px"><span>⚠️</span><span>${esc(err.message)}</span></div>`;
  }

  const tornei = torneiNonOrdinati.sort((a, b) => a.id - b.id);

  const giochiDisponibili = tipologieGioco || [];
  const NOMI_GIOCHI = {};
  let opzioniGiochiHtml = '';

  giochiDisponibili.forEach(g => {
    NOMI_GIOCHI[g.id] = g.nome;
    opzioniGiochiHtml += `<option value="${g.id}">${esc(g.nome)}</option>`;
  });
  if (!opzioniGiochiHtml) {
    opzioniGiochiHtml = '<option value="">Nessuna tipologia disponibile</option>';
  }

  function getStatusBadge(status) {
    const s = (status || 'in arrivo').toLowerCase();
    if (s.includes('corso') || s === 'active') return 'b-grn';
    if (s.includes('arrivo') || s === 'pending' || s.includes('definire')) return 'b-blu';
    return 'b-amb';
  }

  const html = `
    <div class="pg-title">Gestione Tornei</div>
    <div class="pg-sub">Crea e gestisci tornei — tournament-service /api/tornei</div>
    ${errBanner}
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
                <td style="display:flex;gap:6px">
                  <button class="act-btn btn-gestisci" data-id="${t.id}">Gestisci</button>
                  <button class="danger-btn btn-del-torneo" data-id="${t.id}" data-name="${esc(t.nome)}">Elimina</button>
                </td>
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

  let allLocali = [];
  try { allLocali = await Api.getAllLocali(); } catch (_) { /* opzionale */ }

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
        showToast("I campi 'Nome' e 'Data Inizio' sono obbligatori.", 'warning'); return;
      }
      const btn = document.getElementById('btn-salva-torneo');
      btn.textContent = 'Salvataggio…'; btn.disabled = true;

      const payload = {
        nome: nameInput.value.trim(),
        idTipologiaGioco: parseInt(gameInput.value, 10),
        modalita: modInput.value,
        regole: rulesInput.value.trim() || 'Nessuna regola specificata',
        classifica: statusInput.value,
        dataInizio: startInput.value,
        dataFine: endInput.value || null,
        localiIds: allLocali.map(l => l.id)
      };

      try {
        if (idInput.value) await Api.updateTournament(idInput.value, payload);
        else await Api.createTournament(payload);
        modal.style.display = 'none';
        showToast('Torneo salvato.', 'success');
        document.querySelector('.sb-btn.active')?.click();
      } catch (err) {
        showToast(err.message || 'Errore nel salvataggio torneo.', 'error', 5000);
      } finally {
        btn.textContent = 'Salva'; btn.disabled = false;
      }
    });

    document.querySelectorAll('.btn-del-torneo').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (!confirm(`Eliminare il torneo "${name}" (#${id})?`)) return;
        try {
          const ok = await Api.deleteTournament(id);
          showToast(ok ? `Torneo #${id} eliminato.` : `Torneo #${id} non trovato.`, ok ? 'success' : 'warning');
          document.querySelector('.sb-btn.active')?.click();
        } catch (err) {
          showToast(err.message, 'error', 5000);
        }
      });
    });
  }, 50);

  return html;
}

// ─── MONITOR ─────────────────────────────────────────────────────────────────
export async function platformMonitor() {
  let summary = null, lat = [], logs = [], errBanner = '';
  try {
    [summary, lat, logs] = await Promise.all([
      Api.getMonitorSummary(),
      Api.getMonitorLatencies(),
      Api.getMonitorLogs()
    ]);
  } catch (err) {
    errBanner = `<div class="connection-banner" style="margin-bottom:12px"><span>⚠️</span><span>${esc(err.message)}</span></div>`;
  }

  const apis = summary ? summary.apisCount || 0 : 0;
  const services = summary ? summary.servicesCount || 0 : 0;
  const gamesInstalled = summary ? summary.gamesInstalled || 0 : 0;
  const livePartite = summary ? summary.livePartite || 0 : 0;
  const reqpm = summary ? summary.reqPerMin || 0 : 0;

  return `
    <div class="pg-title">Monitor Sistema</div>
    <div class="pg-sub">Statistiche API e stato del sistema — GET /api/monitor/*</div>
    ${errBanner}
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
      ${lat.length ? lat.map(e => `
        <div class="skill-row">
          <div class="skill-name" style="width:200px;font-family:monospace;font-size:10px;color:var(--acc2)">${e.ep}</div>
          <div class="skill-bar"><div class="skill-fill" style="width:${Math.min((e.ms || 0) / 300 * 100, 100)}%;background:${e.ok ? 'var(--grn)' : 'var(--red)'}"></div></div>
          <div class="skill-pct" style="width:40px">${e.ms}ms</div>
        </div>
      `).join('') : '<div style="padding:14px;color:var(--txt3);font-size:12px">Nessun dato latenza.</div>'}
    </div>
    <div class="card">
      <div class="card-hd">Ultimi eventi di sistema</div>
      ${logs.length ? logs.map(e => `
        <div class="list-row" style="gap:10px">
          <span style="font-size:9px;color:var(--txt3);width:56px;flex-shrink:0;font-family:monospace">${formatLogTime(e.t)}</span>
          <span class="badge ${e.type === 'INFO' ? 'b-blu' : e.type === 'WARN' ? 'b-amb' : 'b-red'}" style="width:36px;text-align:center;margin-left: 5px;">${e.type}</span>
          <span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${e.msg}</span>
          <span style="font-size:9px;color:var(--txt3);flex-shrink:0">${e.svc}</span>
        </div>
      `).join('') : '<div style="padding:14px;color:var(--txt3);font-size:12px">Nessun evento registrato.</div>'}
    </div>`;
}

// ─── LOGS ────────────────────────────────────────────────────────────────────
export async function platformLogs() {
  let logs = [], errBanner = '';
  try {
    logs = await Api.getMonitorLogs();
  } catch (err) {
    errBanner = `<div class="connection-banner" style="margin-bottom:12px"><span>⚠️</span><span>${esc(err.message)}</span></div>`;
  }

  return `
    <div class="pg-title">Log & Audit</div>
    <div class="pg-sub">Registro eventi IoT e di sistema — GET /api/monitor/logs</div>
    ${errBanner}
    <div class="card">
      <div class="card-hd">Ultimi ${logs.length} eventi</div>
      ${logs.length ? logs.map(e => `
        <div class="list-row" style="gap:8px">
          <span style="font-size:9px;color:var(--txt3);width:72px;flex-shrink:0;font-family:monospace">${formatLogTime(e.t)}</span>
          <span class="badge ${e.type === 'INFO' ? 'b-blu' : e.type === 'WARN' ? 'b-amb' : 'b-red'}" style="width:48px;text-align:center">${esc(e.type || 'INFO')}</span>
          <span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${esc(e.msg)}</span>
          <span style="font-size:9px;color:var(--txt3);flex-shrink:0">${esc(e.svc)}</span>
        </div>
      `).join('') : '<div style="padding:20px;text-align:center;color:var(--txt3);font-size:12px">Nessun evento nel registro. Gli eventi IoT verranno mostrati qui quando disponibili.</div>'}
    </div>`;
}