/**
 * file: locale.js
 * Pagine e componenti per i GESTORI LOCALI
 */
import * as Api from '../js/api.js';

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
        {ico:'⚽',name:'Calciobalilla Verde',status:'In partita',score:'3-2',time:'04:21',players:'Luca vs Anna'},
        {ico:'⚽',name:'Calciobalilla Rosso',status:'Libero',score:'—',time:'—',players:'—'},
        {ico:'🎯',name:'Freccette Dx',status:'In partita',score:'180 pts',time:'02:05',players:'Marco vs Giulia'},
        {ico:'🎱',name:'Biliardo',status:'In pausa',score:'4-4',time:'08:33',players:'Giorgio vs Piero'},
    ].map(g=>`
            <div class="list-row">
              <div class="gi" style="background:var(--surf2)">${g.ico}</div>
              <div style="flex:1"><div class="rname">${g.name}</div><div class="rmeta">${g.players}</div></div>
              <div style="text-align:right">
                <div style="font-size:11px;font-weight:500">${g.score}</div>
                <div style="font-size:9px;color:var(--txt3)">${g.time}</div>
              </div>
              <span class="badge ${g.status==='In partita'?'b-grn':g.status==='Libero'?'b-blu':'b-amb'}">${g.status}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-hd">Ultimi eventi</div>
          ${[
        {t:'14:47',msg:'Goal segnato — Calciobalilla Verde (3-2)',type:'grn'},
        {t:'14:45',msg:'Partita iniziata — Freccette Dx',type:'blu'},
        {t:'14:38',msg:'Partita terminata — Calciobalilla Rosso (5-3)',type:'grn'},
        {t:'14:31',msg:'Edge offline temporaneo (42 sec)',type:'amb'},
        {t:'14:29',msg:'Sincronizzazione dati completata',type:'blu'},
        {t:'14:20',msg:'Nuovo giocatore registrato',type:'grn'},
    ].map(e=>`
            <div class="list-row">
              <span style="font-size:9px;color:var(--txt3);width:32px;flex-shrink:0">${e.t}</span>
              <div class="dot ${e.type==='grn'?'d-grn':e.type==='amb'?'d-amb':'d-grn'}" style="${e.type==='blu'?'background:var(--acc)':''}"></div>
              <div style="font-size:11px;flex:1">${e.msg}</div>
            </div>`).join('')}
        </div>
      </div>`;
}

export function localeLive() {
    return `
      <div class="pg-title">Partite Live</div>
      <div class="pg-sub">Monitoraggio in tempo reale dei giochi nel locale</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[
        {ico:'⚽',name:'Calciobalilla Verde',p1:'Luca F.',p2:'Anna B.',s1:3,s2:2,time:'04:21',status:'live'},
        {ico:'🎯',name:'Freccette Dx',p1:'Marco V.',p2:'Giulia R.',s1:180,s2:140,time:'02:05',status:'live'},
        {ico:'🎱',name:'Biliardo',p1:'Giorgio C.',p2:'Piero M.',s1:4,s2:4,time:'08:33',status:'pausa'},
        {ico:'⚽',name:'Calciobalilla Rosso',p1:'—',p2:'—',s1:0,s2:0,time:'00:00',status:'libero'},
    ].map(g=>`
          <div class="card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:18px">${g.ico}</span>
              <div style="font-family:var(--ff);font-size:13px;font-weight:700;flex:1">${g.name}</div>
              <span class="badge ${g.status==='live'?'b-grn':g.status==='pausa'?'b-amb':'b-blu'}">${g.status}</span>
            </div>
            ${g.status!=='libero'?`
            <div style="display:flex;align-items:center;justify-content:space-around;padding:10px 0;background:var(--surf2);border-radius:8px;margin-bottom:10px">
              <div style="text-align:center"><div style="font-size:11px;color:var(--txt3)">${g.p1}</div><div style="font-family:var(--ff);font-size:26px;font-weight:800">${g.s1}</div></div>
              <div style="font-size:11px;color:var(--txt3)">vs</div>
              <div style="text-align:center"><div style="font-size:11px;color:var(--txt3)">${g.p2}</div><div style="font-family:var(--ff);font-size:26px;font-weight:800">${g.s2}</div></div>
            </div>
            <div style="text-align:center;font-size:11px;color:var(--txt3)">Tempo: ${g.time}</div>`
        :`<div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Nessuna partita in corso</div>`}
          </div>`).join('')}
      </div>`;
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
        ${['locale/bar-belvedere/calciobalilla/cb-001/goal','locale/bar-belvedere/freccette/fr-001/score','locale/bar-belvedere/biliardo/bl-001/pocket','locale/bar-belvedere/edge/status'].map(t=>`
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
        {ico:'⚽',name:'Calciobalilla',pct:58},
        {ico:'🎯',name:'Freccette',pct:24},
        {ico:'🎱',name:'Biliardo',pct:18}
    ].map(g=>`
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


async function initLocaleGames(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    // Come recuperi l’id del locale?
    // Opzione A: se il token contiene localeId, salvalo in localStorage al login e leggilo qui.
    // Per ora metto un fallback:
    const idLocale = localStorage.getItem('localeId') || 1;

    const giochi = await Api.getGiochiByLocale(idLocale);

    if (!giochi || giochi.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Nessun gioco trovato per questo locale.</td></tr>`;
        return;
    }

    tbody.innerHTML = giochi.map(g => {
        // IMPORTANTISSIMO: qui devi usare i nomi reali del DTO.
        // Provo a gestire più naming possibili:
        const idGiocoInstallato = g.idGiocoInstallato || g.id || g.id_gioco_installato;
        const nome = g.nome || g.nomeGioco || g.nomeTipologiaGioco || g.nome_tipologia_gioco || `Gioco #${idGiocoInstallato}`;
        const sensori = g.sensors || g.sensori || g.numeroSensori || 0;
        const ok = (g.ok ?? g.attivo ?? true);

        return `
      <tr>
        <td><span style="font-size:14px">🎮</span> ${nome}</td>
        <td style="font-family:monospace;font-size:11px;color:var(--acc2)">${idGiocoInstallato ?? ''}</td>
        <td>${sensori} attivi</td>
        <td><span class="badge ${ok ? 'b-grn' : 'b-red'}">${ok ? 'ok' : 'errore'}</span></td>
        <td style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="act-btn btn-avvia" data-id="${idGiocoInstallato}">Avvia partita</button>
          <button class="act-btn">Config</button>
        </td>
      </tr>
    `;
    }).join('');

    // eventi click per avviare partita
    tbody.querySelectorAll('.btn-avvia').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id) return;

            e.currentTarget.disabled = true;
            const partita = await Api.avviaPartita(id);
            e.currentTarget.disabled = false;

            if (!partita) {
                alert("Errore: impossibile avviare la partita.");
                return;
            }

            alert(`Partita avviata! ID: ${partita.id || partita.idPartita || '(id non presente nel DTO)'}`);
        });
    });
}