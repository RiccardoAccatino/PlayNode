/**
 * file: admin-game.js
 * Pagine e componenti per gli ADMIN GIOCO
 * Attualmente rimanda alle stesse pagine di Admin Piattaforma
 * ma può essere espanso con funzionalità specifiche
 */

// Re-export delle funzioni da admin-platform
// Gli Admin Gioco hanno accesso alle stesse viste
export { platformGames, platformTournaments, platformMonitor } from './admin-platform.js';

export function adminGameDashboard() {
    return `
      <div class="pg-title">Admin Gioco — Dashboard</div>
      <div class="pg-sub">Gestione tipi di gioco e configurazione</div>
      <div class="stats-row">
        <div class="scard">
          <div class="scard-lbl">Tipi di gioco</div>
          <div class="scard-val">4</div>
          <div class="scard-delta neutral">attivi</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Installazioni totali</div>
          <div class="scard-val">24</div>
          <div class="scard-delta up">+2 questa settimana</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Partite globali</div>
          <div class="scard-val">1.4k</div>
          <div class="scard-delta up">questa settimana</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Gioco popolare</div>
          <div class="scard-val" style="font-size:16px">⚽</div>
          <div class="scard-delta neutral">Calciobalilla</div>
        </div>
      </div>
      <div class="row2">
        <div class="card">
          <div class="card-hd">Utilizzo per gioco</div>
          ${[
        {ico:'⚽',name:'Calciobalilla',matches:847,trend:'up'},
        {ico:'🎯',name:'Freccette',matches:312,trend:'stable'},
        {ico:'🎱',name:'Biliardo',matches:189,trend:'up'},
        {ico:'🎳',name:'Bocce',matches:98,trend:'down'}
    ].map(g=>`
            <div class="list-row">
              <div class="gi" style="background:var(--surf2)">${g.ico}</div>
              <div style="flex:1"><div class="rname">${g.name}</div><div class="rmeta">${g.matches} partite globali</div></div>
              <span class="badge ${g.trend==='up'?'b-grn':g.trend==='down'?'b-red':'b-blu'}">${g.trend==='up'?'📈':g.trend==='down'?'📉':'→'}</span>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-hd">Sensori configurati</div>
          ${[
        {ico:'⚽',name:'Calciobalilla',sensors:['goal sensor','timer','display']},
        {ico:'🎯',name:'Freccette',sensors:['score sensor','turno']},
        {ico:'🎱',name:'Biliardo',sensors:['pocket sensor','foul']},
        {ico:'🎳',name:'Bocce',sensors:['position','GPS']}
    ].map(g=>`
            <div style="margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:16px">${g.ico}</span>
                <span style="font-weight:500;font-size:12px">${g.name}</span>
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-left:24px">
                ${g.sensors.map(s=>`<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surf2);color:var(--txt2);border:1px solid var(--bdr)">${s}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
}