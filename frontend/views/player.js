import { getUserStats, getUserHistory } from '../js/api.js';

/**
 * Mostra la dashboard principale del giocatore.
 * Scarica asincronamente i veri dati dal microservizio stats-service.
 */
export function playerDashboard() {
    // 1. Assegniamo un ID unico al div che conterrà i dati
    const containerId = 'player-dash-container';

    // 2. Facciamo partire la richiesta asincrona per recuperare i dati reali
    loadDashboardData(containerId);

    // 3. Restituiamo il contenitore vuoto con la scritta "Caricamento..."
    return `
      <div class="pg-title">La mia Dashboard</div>
      <div class="pg-sub">Benvenuto — ecco il tuo riepilogo personale</div>
      <div id="${containerId}">
          <div style="text-align: center; padding: 40px; color: var(--txt3);">
             Caricamento statistiche in corso...
          </div>
      </div>
    `;
}

/**
 * Funzione asincrona che scarica i dati e "inietta" il tuo esatto HTML nel contenitore.
 */
async function loadDashboardData(containerId) {
    try {
        const userId = localStorage.getItem('userId');

        // Chiamate parallele alle nostre API
        const [stats, history] = await Promise.all([
            getUserStats(userId),
            getUserHistory(userId)
        ]);

        const container = document.getElementById(containerId);
        if (!container) return; // Se l'utente ha cambiato pagina nel frattempo, interrompe.

        // 1. MAPPATURA STATISTICHE (Usiamo i nomi esatti del DTO Java)
        const s = stats || {
            partiteGiocate: 0,
            vittorie: 0,
            punteggioTotale: 0
        };

        // Estraiamo i valori sicuri
        const giocate = s.partiteGiocate || 0;
        const vinte = s.vittorie || 0;

        // Calcoliamo il Win Rate in Javascript per evitare il "NaN" (Not a Number) se le partite sono 0
        const winRate = giocate > 0 ? Math.round((vinte / giocate) * 100) : 0;

        // Simuliamo il rank e i tornei per fare bella figura (finché non li implementiamo nel backend)
        const rank = s.punteggioTotale > 0 ? `#${Math.max(1, 150 - s.punteggioTotale)}` : 'N/D';
        const torneiVinti = vinte > 20 ? 1 : 0;

        // 2. MAPPATURA STORICO PARTITE (Usiamo i nomi esatti della tabella storico_partita)
        const recentMatches = history && history.length > 0 ? history.slice(0, 5) : [];

        container.innerHTML = `
          <div class="stats-row">
            <div class="scard"><div class="scard-lbl">Partite totali</div><div class="scard-val">${giocate}</div><div class="scard-delta neutral">Dall'iscrizione</div></div>
            <div class="scard"><div class="scard-lbl">% vittorie</div><div class="scard-val" style="color:var(--grn)">${winRate}%</div><div class="scard-delta neutral">Media globale</div></div>
            <div class="scard"><div class="scard-lbl">Rank globale</div><div class="scard-val" style="color:var(--gold)">${rank}</div><div class="scard-delta neutral">Su PlayNode</div></div>
            <div class="scard"><div class="scard-lbl">Tornei vinti</div><div class="scard-val">${torneiVinti}</div><div class="scard-delta neutral">Miglior player</div></div>
          </div>
    
          <div class="row2">
            <div class="card">
              <div class="card-hd">Partite per settimana (ultime 8)</div>
              <div class="chart-wrap">
                ${[3,5,2,7,4,6,8,5].map((v,i)=>{
            const labels=['S5','S6','S7','S8','S9','S10','S11','S12'];
            const wins=Math.round(v*0.6); const losses=v-wins;
            const maxH=80; const h=Math.round((v/8)*maxH);
            const wh=Math.round((wins/v)*h); const lh=h-wh;
            return `<div class="bar-col">
                            <div class="bar-val">${v}</div>
                            <div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:1px">
                              <div class="bar-seg" style="height:${wh}px;background:var(--grn)"></div>
                              <div class="bar-seg" style="height:${lh}px;background:var(--red);border-radius:0"></div>
                            </div>
                            <div class="bar-lbl">${labels[i]}</div>
                          </div>`;
        }).join('')}
              </div>
              <div style="display:flex;gap:12px;margin-top:4px">
                <span style="font-size:10px;color:var(--txt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--grn);border-radius:2px;display:inline-block"></span>Vittorie</span>
                <span style="font-size:10px;color:var(--txt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--red);border-radius:2px;display:inline-block"></span>Sconfitte</span>
              </div>
            </div>
            
            <div class="card">
              <div class="card-hd">Abilità per gioco</div>
              <div style="margin-top:4px">
                ${[
            {name:'Calciobalilla',pct:82,color:'var(--acc)'},
            {name:'Biliardo',pct:63,color:'#8b5cf6'},
            {name:'Freccette',pct:51,color:'var(--grn)'},
            {name:'Bocce',pct:34,color:'var(--amb)'}
        ].map(skill=>`
                  <div class="skill-row">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-bar"><div class="skill-fill" style="width:${skill.pct}%;background:${skill.color}"></div></div>
                    <div class="skill-pct">${skill.pct}%</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
    
          <div class="row2">
            <div class="card">
              <div class="card-hd">Ultime 5 partite</div>
              ${recentMatches.length > 0 ? recentMatches.map(m=> {
            // Formattiamo la data in modo pulito
            const dataFormattata = m.dataPartita ? new Date(m.dataPartita).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data sconosciuta';
            // Simuliamo vittoria/sconfitta in base al punteggio per far funzionare i colori
            const isVittoria = m.punteggioOttenuto > 5;

            return `
                    <div class="match-row">
                      <span class="m-ico">🎮</span>
                      <div class="m-info">
                         <div class="m-title">Partita #${m.id || 'N/D'}</div>
                         <div class="m-meta">${dataFormattata}</div>
                      </div>
                      <span class="m-score">${m.punteggioOttenuto !== null ? m.punteggioOttenuto + ' pts' : '-'}</span>
                      <span class="result ${isVittoria ? 'win' : 'loss'}">${isVittoria ? 'Vinta' : 'Persa'}</span>
                    </div>`
        }).join('') : '<div style="font-size:11px; color:var(--txt3); padding:10px 0;">Nessuna partita registrata.</div>'}
            </div>
            
            <div class="card">
              <div class="card-hd">Attività mensile</div>
              <div style="margin-bottom:8px;font-size:10px;color:var(--txt3)">Partite giocate — Questo mese</div>
              <div class="heat-grid">
                ${Array.from({length:30},(_,i)=>{
            const v=Math.random();
            const bg = v<.2?'var(--surf2)':v<.5?'#0f2d1f':v<.8?'#14532d':'var(--grn)';
            return `<div class="heat-cell" style="background:${bg}" title="Giorno ${i+1}"></div>`;
        }).join('')}
              </div>
              <div style="display:flex;gap:6px;margin-top:8px;align-items:center">
                <span style="font-size:9px;color:var(--txt3)">Meno</span>
                ${['var(--surf2)','#0f2d1f','#14532d','var(--grn)'].map(c=>`<div style="width:10px;height:10px;background:${c};border-radius:2px"></div>`).join('')}
                <span style="font-size:9px;color:var(--txt3)">Più</span>
              </div>
            </div>
          </div>`;
    } catch (err) {
        console.error("Errore fetch dashboard:", err);
        const container = document.getElementById(containerId);
        if(container) container.innerHTML = `<div style="color:var(--red); padding: 20px;">Errore nel caricamento dei dati dal server. Controlla la console.</div>`;
    }
}


/* ======================================================================
   TUTTE LE ALTRE FUNZIONI SONO INTATTE (Mockup visivi per ora)
   ====================================================================== */

export function playerGames() {
    return `
      <div class="pg-title">Giochi disponibili</div>
      <div class="pg-sub">Tutti i giochi sulla piattaforma</div>
      <div class="row3">
        ${[
        {ico:'⚽',name:'Calciobalilla',bg:'#0f1f3d',total:847,sensors:['goal sensor','timer','display'],myGames:42,myWin:68},
        {ico:'🎯',name:'Freccette',bg:'#0f2d1f',total:312,sensors:['score sensor','turno'],myGames:13,myWin:46},
        {ico:'🎱',name:'Biliardo',bg:'#1f1208',total:189,sensors:['pocket sensor','foul'],myGames:19,myWin:57},
        {ico:'🎳',name:'Bocce',bg:'#1a0d2e',total:98,sensors:['position','GPS'],myGames:0,myWin:0},
    ].map(g=>`
          <div class="card" style="padding:0;overflow:hidden">
            <div style="height:60px;background:${g.bg};display:flex;align-items:center;justify-content:center;font-size:30px">${g.ico}</div>
            <div style="padding:12px">
              <div style="font-family:var(--ff);font-size:14px;font-weight:700">${g.name}</div>
              <div style="font-size:10px;color:var(--txt3);margin-top:2px">${g.total} partite globali</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
                ${g.sensors.map(s=>`<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surf2);color:var(--txt2);border:1px solid var(--bdr)">${s}</span>`).join('')}
              </div>
              ${g.myGames>0?`
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--bdr)">
                <div style="display:flex;justify-content:space-between">
                  <span style="font-size:10px;color:var(--txt3)">Le mie partite</span><span style="font-size:10px;font-weight:500">${g.myGames}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:3px">
                  <span style="font-size:10px;color:var(--txt3)">% vittorie</span><span style="font-size:10px;color:var(--grn);font-weight:500">${g.myWin}%</span>
                </div>
              </div>`:
        `<div style="margin-top:10px;font-size:10px;color:var(--txt3);font-style:italic">Non hai ancora giocato</div>`}
            </div>
          </div>`).join('')}
        <div class="card" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:140px">
          <div style="font-size:28px">➕</div>
          <div style="font-size:12px;color:var(--txt3)">Proponi gioco</div>
        </div>
      </div>`;
}

export function playerTournaments() {
    return `
      <div class="pg-title">Tornei</div>
      <div class="pg-sub">Iscrizioni, classifiche e archivio</div>
      <div class="chip-toggle">
        <button class="chip active">In corso</button>
        <button class="chip">In arrivo</button>
        <button class="chip">Passati</button>
      </div>
      ${[
        {ico:'⚽',name:'Torneo Calciobalilla — Primavera 2026',status:'in corso',players:14,matches:28,locali:5,myRank:4,topPlayers:['Luca Ferrari — 11V','Anna Bianchi — 9V','Marco Verdi — 8V']},
        {ico:'🎱',name:'Coppa Biliardo Milano',status:'in corso',players:8,matches:12,locali:2,myRank:2,topPlayers:['Anna B. — 7V','Mario R. — 6V','Giorgio C. — 5V']},
    ].map(t=>`
        <div class="card" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <span style="font-size:22px">${t.ico}</span>
            <div style="flex:1"><div style="font-family:var(--ff);font-size:14px;font-weight:700">${t.name}</div></div>
            <span class="badge b-grn">${t.status}</span>
            ${t.myRank<=3?`<span class="badge b-gold">🏆 #${t.myRank}</span>`:`<span class="badge b-blu">rank #${t.myRank}</span>`}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
            <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.players}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">giocatori</div></div>
            <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.matches}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">partite</div></div>
            <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.locali}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">locali</div></div>
          </div>
          <div style="border-top:1px solid var(--bdr);padding-top:10px">
            ${t.topPlayers.map((p,i)=>`
              <div class="podium-row">
                <span class="rank ${['r1','r2','r3'][i]}">${i+1}°</span>
                <span style="font-size:12px;flex:1">${p}</span>
              </div>`).join('')}
          </div>
        </div>`).join('')}`;
}

/**
 * Visualizza il profilo dell'utente con statistiche dinamiche.
 * @param {Object} userData - Deve contenere: initials, name, role,
 * e opzionalmente: partiteGiocate, vittorie, rank.
 */
export function playerProfile(userData) {
    // Leggiamo i dati reali dal database (fallback a 0 se non presenti)
    const partite = userData.partiteGiocate || 0;
    const vittorie = userData.vittorie || 0;
    const winRate = partite > 0 ? Math.round((vittorie / partite) * 100) : 0;
    const rank = userData.rank || '12';

    return `
      <div class="pg-title">Il mio profilo</div>
      <div class="pg-sub">Statistiche personali e impostazioni account</div>
      
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;padding:14px;background:var(--surf);border:1px solid var(--bdr);border-radius:10px">
        <div style="width:52px;height:52px;border-radius:12px;background:var(--acc3);border:2px solid var(--acc);display:flex;align-items:center;justify-content:center;font-family:var(--ff);font-size:20px;font-weight:800;color:var(--acc2)">${userData.initials}</div>
        <div style="flex:1">
          <div style="font-family:var(--ff);font-size:17px;font-weight:700">${userData.name}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${userData.role} · PlayNode 2026</div>
        </div>
        <div style="display:flex;gap:8px">
          <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700">${partite}</div><div style="font-size:9px;color:var(--txt3)">partite</div></div>
          <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700;color:var(--grn)">${winRate}%</div><div style="font-size:9px;color:var(--txt3)">vittorie</div></div>
          <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700;color:var(--gold)">#${rank}</div><div style="font-size:9px;color:var(--txt3)">rank</div></div>
        </div>
      </div>

      <div class="row2">
        <div class="card">
          <div class="card-hd">Statistiche per gioco</div>
          ${[
        {ico:'⚽',name:'Calciobalilla',p:partite,w:winRate,pref:true},
        {ico:'🎱',name:'Biliardo',p:Math.round(partite*0.3),w:57,pref:false},
        {ico:'🎯',name:'Freccette',p:Math.round(partite*0.2),w:46,pref:false},
    ].map(g=>`
            <div class="list-row">
              <div class="gi" style="background:var(--surf2)">${g.ico}</div>
              <div style="flex:1"><div class="rname">${g.name}</div><div class="rmeta">${g.p} partite · ${g.w}% vittorie</div></div>
              <div class="barw"><div class="barf" style="width:${g.w}%"></div></div>
              ${g.pref?'<span class="badge b-grn">Preferito</span>':''}
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-hd">Locali frequentati</div>
          ${[
        {name:'Bar Belvedere — Roma',v:34,icon:'🏪'},
        {name:'Circolo Sportivo Milano',v:21,icon:'🏟️'},
        {name:'Casa propria',v:19,icon:'🏠'},
    ].map(l=>`
            <div class="list-row">
              <span style="font-size:14px">${l.icon}</span>
              <div style="flex:1"><div class="rname">${l.name}</div><div class="rmeta">${l.v} visite</div></div>
            </div>`).join('')}
        </div>
      </div>
    `;
}