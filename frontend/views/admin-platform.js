/**
 * file: admin-platform.js
 * Pagine e componenti per gli ADMIN PIATTAFORMA
 */

export function platformOverview() {
    return `
      <div class="pg-title">Overview Globale</div>
      <div class="pg-sub">Stato dell'intera piattaforma Connected Games</div>
      <div class="stats-row">
        <div class="scard">
          <div class="scard-lbl">Utenti totali</div>
          <div class="scard-val">1.284</div>
          <div class="scard-delta up">+47 questa settimana</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Locali attivi</div>
          <div class="scard-val">23</div>
          <div class="scard-delta down">1 offline</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Partite totali</div>
          <div class="scard-val">8.4k</div>
          <div class="scard-delta up">+142 oggi</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Uptime sistema</div>
          <div class="scard-val" style="color:var(--grn)">99.8%</div>
          <div class="scard-delta up">ultimi 30gg</div>
        </div>
      </div>
      <div class="row2">
        <div class="card">
          <div class="card-hd">Stato locali</div>
          ${[
        {name:'Bar Belvedere — Roma',status:'online',games:4,lat:'12ms'},
        {name:'Circolo Sportivo Milano',status:'online',games:6,lat:'8ms'},
        {name:'Sala Giochi Torino',status:'sync',games:3,lat:'34ms'},
        {name:'Bar Sport Genova',status:'offline',games:2,lat:'—'},
        {name:'Casa di Mario Rossi',status:'online',games:2,lat:'22ms'},
    ].map(l=>`
            <div class="list-row">
              <div class="dot ${l.status==='online'?'d-grn':l.status==='sync'?'d-amb':'d-red'}"></div>
              <div style="flex:1"><div class="rname">${l.name}</div><div class="rmeta">${l.games} giochi · latenza ${l.lat}</div></div>
              <span class="badge ${l.status==='online'?'b-grn':l.status==='sync'?'b-amb':'b-red'}">${l.status}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-hd">Microservizi</div>
          ${[
        {name:'auth-service',port:8081,status:'up'},
        {name:'game-service',port:8082,status:'up'},
        {name:'match-service',port:8083,status:'up'},
        {name:'stats-service',port:8084,status:'up'},
        {name:'tournament-service',port:8085,status:'up'},
        {name:'mqtt-broker',port:1883,status:'up'},
        {name:'edge-sync-service',port:8086,status:'degraded'},
    ].map(s=>`
            <div class="list-row">
              <div class="dot ${s.status==='up'?'d-grn':'d-amb'}"></div>
              <div style="flex:1;font-family:monospace;font-size:11px;color:var(--acc2)">${s.name}</div>
              <div style="font-size:10px;color:var(--txt3)">:${s.port}</div>
              <span class="badge ${s.status==='up'?'b-grn':'b-amb'}">${s.status}</span>
            </div>`).join('')}
        </div>
      </div>`;
}

export function platformUsers() {
    return `
      <div class="pg-title">Gestione Utenti</div>
      <div class="pg-sub">Tutti gli utenti registrati sulla piattaforma</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="act-btn">+ Nuovo utente</button>
      </div>
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Utente</th>
              <th>Ruolo</th>
              <th>Locale</th>
              <th>Partite</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${[
        {name:'Mario Rossi',role:'Giocatore',locale:'Bar Belvedere',matches:74,active:true},
        {name:'Anna Bianchi',role:'Giocatore',locale:'Milano',matches:58,active:true},
        {name:'Giuseppe Verdi',role:'Admin Locale',locale:'Bar Belvedere',matches:0,active:true},
        {name:'Lucia Neri',role:'Giocatore',locale:'Torino',matches:12,active:false},
        {name:'Roberto Blu',role:'Admin Gioco',locale:'—',matches:0,active:true}
    ].map(u=>`
              <tr>
                <td><div style="font-weight:500;font-size:12px">${u.name}</div></td>
                <td><span class="badge ${u.role==='Giocatore'?'b-blu':u.role==='Admin Locale'?'b-amb':'b-grn'}">${u.role}</span></td>
                <td style="font-size:11px;color:var(--txt2)">${u.locale}</td>
                <td style="font-size:12px">${u.matches}</td>
                <td><span class="badge ${u.active?'b-grn':'b-red'}">${u.active?'attivo':'sospeso'}</span></td>
                <td><button class="act-btn">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
}

export function platformLocali() {
    return `
      <div class="pg-title">Gestione Locali</div>
      <div class="pg-sub">Tutti i locali registrati sulla piattaforma</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="act-btn">+ Nuovo locale</button>
      </div>
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Città</th>
              <th>Giochi</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${[
        {name:'Bar Belvedere',type:'Pubblico',city:'Roma',games:4,ok:true},
        {name:'Circolo Sportivo',type:'Pubblico',city:'Milano',games:6,ok:true},
        {name:'Sala Giochi',type:'Pubblico',city:'Torino',games:3,ok:true},
        {name:'Casa di Mario Rossi',type:'Privato',city:'Roma',games:2,ok:true},
        {name:'Bar Sport',type:'Pubblico',city:'Genova',games:2,ok:false}
    ].map(l=>`
              <tr>
                <td style="font-weight:500;font-size:12px">${l.name}</td>
                <td><span class="badge ${l.type==='Pubblico'?'b-blu':'b-amb'}">${l.type}</span></td>
                <td style="font-size:11px">${l.city}</td>
                <td>${l.games}</td>
                <td><span class="badge ${l.ok?'b-grn':'b-red'}">${l.ok?'online':'offline'}</span></td>
                <td><button class="act-btn">Dettagli</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
}

export function platformGames() {
    return `
      <div class="pg-title">Tipi di Gioco</div>
      <div class="pg-sub">Definizione giochi e configurazione sensori</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="act-btn">+ Nuovo tipo gioco</button>
      </div>
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Gioco</th>
              <th>Sensori def.</th>
              <th>Installazioni</th>
              <th>Partite totali</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${[
        {ico:'⚽',name:'Calcioballica',sensors:3,inst:12,matches:847},
        {ico:'🎯',name:'Freccette',sensors:1,inst:5,matches:312},
        {ico:'🎱',name:'Biliardo',sensors:2,inst:4,matches:189},
        {ico:'🎳',name:'Bocce',sensors:2,inst:3,matches:98}
    ].map(g=>`
              <tr>
                <td><span style="font-size:14px">${g.ico}</span> <span style="font-weight:500;font-size:12px">${g.name}</span></td>
                <td>${g.sensors}</td>
                <td>${g.inst}</td>
                <td>${g.matches}</td>
                <td><button class="act-btn">Config sensori</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
}

export function platformTournaments() {
    return `
      <div class="pg-title">Gestione Tornei</div>
      <div class="pg-sub">Crea e gestisci tornei multi-locale</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="act-btn">+ Nuovo torneo</button>
      </div>
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Torneo</th>
              <th>Gioco</th>
              <th>Locali</th>
              <th>Partecipanti</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${[
        {name:'Calcioballica Primavera 2026',game:'⚽ Calcioballica',locali:5,players:14,status:'in corso'},
        {name:'Coppa Biliardo Milano',game:'🎱 Biliardo',locali:2,players:8,status:'in corso'},
        {name:'Campionato Freccette 2026',game:'🎯 Freccette',locali:3,players:0,status:'in arrivo'},
        {name:'Gran Torneo Bocce 2025',game:'🎳 Bocce',locali:4,players:16,status:'concluso'}
    ].map(t=>`
              <tr>
                <td style="font-weight:500;font-size:12px">${t.name}</td>
                <td>${t.game}</td>
                <td>${t.locali}</td>
                <td>${t.players||'—'}</td>
                <td><span class="badge ${t.status==='in corso'?'b-grn':t.status==='in arrivo'?'b-blu':'b-amb'}">${t.status}</span></td>
                <td><button class="act-btn">Gestisci</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
}

export function platformMonitor() {
    return `
      <div class="pg-title">Monitor Sistema</div>
      <div class="pg-sub">Performance e salute dei microservizi</div>
      <div class="stats-row">
        <div class="scard">
          <div class="scard-lbl">CPU media</div>
          <div class="scard-val">34%</div>
          <div class="scard-delta up">normale</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">RAM usata</div>
          <div class="scard-val">2.1GB</div>
          <div class="scard-delta neutral">su 8GB</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Req/min API</div>
          <div class="scard-val">847</div>
          <div class="scard-delta up">picco 18:00</div>
        </div>
        <div class="scard">
          <div class="scard-lbl">Msg MQTT/min</div>
          <div class="scard-val">1.2k</div>
          <div class="scard-delta neutral">stabile</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Latenza API per endpoint</div>
        ${[
        {ep:'POST /api/matches',ms:42,ok:true},
        {ep:'GET /api/stats/player',ms:78,ok:true},
        {ep:'GET /api/tournaments',ms:31,ok:true},
        {ep:'POST /api/edge/sync',ms:234,ok:false}
    ].map(e=>`
          <div class="skill-row">
            <div class="skill-name" style="width:180px;font-family:monospace;font-size:10px;color:var(--acc2)">${e.ep}</div>
            <div class="skill-bar"><div class="skill-fill" style="width:${Math.min(e.ms/300*100,100)}%;background:${e.ok?'var(--grn)':'var(--red)'}"></div></div>
            <div class="skill-pct" style="width:40px">${e.ms}ms</div>
          </div>
        `).join('')}
      </div>`;
}

export function platformLogs() {
    return `
      <div class="pg-title">Log & Audit</div>
      <div class="pg-sub">Registro eventi e accessi alla piattaforma</div>
      <div class="card">
        <div class="card-hd">Ultimi eventi di sistema</div>
        ${[
        {t:'14:52:01',type:'INFO',msg:'Match created: ID#4821 · locale LOC-007 · game CB-001',svc:'match-service'},
        {t:'14:51:48',type:'WARN',msg:'Edge LOC-004 offline — buffering 12 events locally',svc:'edge-sync'},
        {t:'14:49:22',type:'INFO',msg:'User login: mario.rossi@email.it · IP 192.168.1.42',svc:'auth-service'},
        {t:'14:47:10',type:'INFO',msg:'Goal event received: CB-001 team_a score=3',svc:'mqtt-broker'},
        {t:'14:45:00',type:'INFO',msg:'Tournament standings updated: T-003 Calciobalilla Primavera',svc:'tournament-service'},
        {t:'14:31:55',type:'ERROR',msg:'Edge sync timeout LOC-004 — retry in 30s',svc:'edge-sync'},
        {t:'14:30:00',type:'INFO',msg:'Stats aggregation job completed: 847 records',svc:'stats-service'}
    ].map(e=>`
          <div class="list-row" style="gap:8px">
            <span style="font-size:9px;color:var(--txt3);width:56px;flex-shrink:0;font-family:monospace">${e.t}</span>
            <span class="badge ${e.type==='INFO'?'b-blu':e.type==='WARN'?'b-amb':'b-red'}" style="width:36px;text-align:center">${e.type}</span>
            <span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${e.msg}</span>
            <span style="font-size:9px;color:var(--txt3);flex-shrink:0">${e.svc}</span>
          </div>
        `).join('')}
      </div>`;
}