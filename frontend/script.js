document.getElementById('ft-date').textContent = new Date().toLocaleDateString('it-IT');

const ROLES = {
    player: {
        user: 'Mario R.', initials: 'MR',
        nav: ['Dashboard', 'Giochi', 'Tornei', 'Profilo'],
        sidebar: null,
        pages: {
            'Dashboard': playerDashboard,
            'Giochi': playerGames,
            'Tornei': playerTournaments,
            'Profilo': playerProfile
        }
    },
    locale: {
        user: 'Gestore Bar', initials: 'GB',
        nav: [],
        sidebar: ['Panoramica', 'Giochi del Locale', 'Partite Live', 'Dispositivi', 'Statistiche Locale', 'Impostazioni'],
        sideIcons: ['📊', '🎮', '▶️', '📡', '📈', '⚙️'],
        pages: {
            'Panoramica': localeOverview,
            'Giochi del Locale': localeGames,
            'Partite Live': localeLive,
            'Dispositivi': localeDevices,
            'Statistiche Locale': localeStats,
            'Impostazioni': localeSettings
        }
    },
    platform: {
        user: 'Admin', initials: 'AD',
        nav: [],
        sidebar: ['Overview Globale', 'Utenti', 'Locali', 'Tipi di Gioco', 'Tornei', 'Monitor Sistema', 'Log & Audit'],
        sideIcons: ['🌐', '👥', '🏠', '🎲', '🏆', '🖥️', '📋'],
        pages: {
            'Overview Globale': platformOverview,
            'Utenti': platformUsers,
            'Locali': platformLocali,
            'Tipi di Gioco': platformGames,
            'Tornei': platformTournaments,
            'Monitor Sistema': platformMonitor,
            'Log & Audit': platformLogs
        }
    }
};

let currentRole = 'player';
let currentPage = 'Dashboard';

function setRole(role, btn) {
    document.querySelectorAll('.role-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRole = role;
    const cfg = ROLES[role];
    document.getElementById('av-name').textContent = cfg.user;
    document.getElementById('av-initials').textContent = cfg.initials;
    buildNav(cfg);
    buildSidebar(cfg);
    const firstPage = cfg.nav[0] || (cfg.sidebar && cfg.sidebar[0]);
    showPage(firstPage);
}

function buildNav(cfg) {
    const nav = document.getElementById('topnav');
    nav.innerHTML = '';
    cfg.nav.forEach((label, i) => {
        const b = document.createElement('button');
        b.className = 'nav-btn' + (i === 0 ? ' active' : '');
        b.textContent = label;
        b.onclick = () => {
            document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            showPage(label);
        };
        nav.appendChild(b);
    });
}

function buildSidebar(cfg) {
    const sb = document.getElementById('sidebar');
    if (!cfg.sidebar) {
        sb.classList.add('hidden');
        return;
    }
    sb.classList.remove('hidden');
    sb.innerHTML = '';
    const lbl = document.createElement('div');
    lbl.className = 'sb-label';
    lbl.textContent = 'Navigazione';
    sb.appendChild(lbl);
    cfg.sidebar.forEach((label, i) => {
        const b = document.createElement('button');
        b.className = 'sb-btn' + (i === 0 ? ' active' : '');
        b.innerHTML = `<span class="sb-icon">${cfg.sideIcons[i]}</span>${label}`;
        b.onclick = () => {
            document.querySelectorAll('.sb-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            showPage(label);
        };
        sb.appendChild(b);
    });
}

function showPage(name) {
    currentPage = name;
    const cfg = ROLES[currentRole];
    const fn = cfg.pages[name];
    const main = document.getElementById('main-content');
    main.innerHTML = fn ? fn() : `<div class="pg-title">${name}</div><p style="color:var(--txt3);font-size:13px;margin-top:8px">Pagina in costruzione.</p>`;
}

/* ─── PLAYER PAGES ─── */
function playerDashboard() {
    return `
  <div class="pg-title">La mia Dashboard</div>
  <div class="pg-sub">Benvenuto Mario — ecco il tuo riepilogo personale</div>

  <div class="stats-row">
    <div class="scard"><div class="scard-lbl">Partite totali</div><div class="scard-val">74</div><div class="scard-delta up">+6 questa settimana</div></div>
    <div class="scard"><div class="scard-lbl">% vittorie</div><div class="scard-val" style="color:var(--grn)">61%</div><div class="scard-delta up">+3% vs mese scorso</div></div>
    <div class="scard"><div class="scard-lbl">Rank globale</div><div class="scard-val" style="color:var(--gold)">#12</div><div class="scard-delta up">+4 posizioni</div></div>
    <div class="scard"><div class="scard-lbl">Tornei vinti</div><div class="scard-val">2</div><div class="scard-delta neutral">su 5 partecipati</div></div>
  </div>

  <div class="row2">
    <div class="card">
      <div class="card-hd">Partite per settimana (ultime 8)</div>
      <div class="chart-wrap">
        ${[3, 5, 2, 7, 4, 6, 8, 5].map((v, i) => {
        const labels = ['S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'];
        const wins = Math.round(v * 0.6);
        const losses = v - wins;
        const maxH = 80;
        const h = Math.round((v / 8) * maxH);
        const wh = Math.round((wins / v) * h);
        const lh = h - wh;
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
        {name: 'Calciobalilla', pct: 82, color: 'var(--acc)'},
        {name: 'Biliardo', pct: 63, color: '#8b5cf6'},
        {name: 'Freccette', pct: 51, color: 'var(--grn)'},
        {name: 'Bocce', pct: 34, color: 'var(--amb)'}
    ].map(s => `
          <div class="skill-row">
            <div class="skill-name">${s.name}</div>
            <div class="skill-bar"><div class="skill-fill" style="width:${s.pct}%;background:${s.color}"></div></div>
            <div class="skill-pct">${s.pct}%</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="row2">
    <div class="card">
      <div class="card-hd">Ultime 5 partite</div>
      ${[
        {ico: '⚽', title: 'Calciobalilla · Bar Belvedere', meta: 'oggi 14:32', score: '5-3', win: true},
        {ico: '🎯', title: 'Freccette · Circolo Milano', meta: 'ieri', score: '281 pts', win: false},
        {ico: '⚽', title: 'Calciobalilla · Casa propria', meta: '2 gg fa', score: '7-4', win: true},
        {ico: '🎱', title: 'Biliardo · Sala Torino', meta: '3 gg fa', score: '8 balls', win: true},
        {ico: '🎳', title: 'Bocce · Giardini Roma', meta: '5 gg fa', score: '13-9', win: false},
    ].map(m => `
        <div class="match-row">
          <span class="m-ico">${m.ico}</span>
          <div class="m-info"><div class="m-title">${m.title}</div><div class="m-meta">${m.meta}</div></div>
          <span class="m-score">${m.score}</span>
          <span class="result ${m.win ? 'win' : 'loss'}">${m.win ? 'Vinta' : 'Persa'}</span>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd">Attività mensile</div>
      <div style="margin-bottom:8px;font-size:10px;color:var(--txt3)">Partite giocate — aprile 2026</div>
      <div class="heat-grid">
        ${Array.from({length: 30}, (_, i) => {
        const v = Math.random();
        const bg = v < .2 ? 'var(--surf2)' : v < .5 ? '#0f2d1f' : v < .8 ? '#14532d' : 'var(--grn)';
        return `<div class="heat-cell" style="background:${bg}" title="Giorno ${i + 1}"></div>`;
    }).join('')}
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;align-items:center">
        <span style="font-size:9px;color:var(--txt3)">Meno</span>
        ${['var(--surf2)', '#0f2d1f', '#14532d', 'var(--grn)'].map(c => `<div style="width:10px;height:10px;background:${c};border-radius:2px"></div>`).join('')}
        <span style="font-size:9px;color:var(--txt3)">Più</span>
      </div>
    </div>
  </div>`;
}

function playerGames() {
    return `
  <div class="pg-title">Giochi disponibili</div>
  <div class="pg-sub">Tutti i giochi sulla piattaforma</div>
  <div class="row3">
    ${[
        {
            ico: '⚽',
            name: 'Calciobalilla',
            bg: '#0f1f3d',
            total: 847,
            sensors: ['goal sensor', 'timer', 'display'],
            myGames: 42,
            myWin: 68
        },
        {
            ico: '🎯',
            name: 'Freccette',
            bg: '#0f2d1f',
            total: 312,
            sensors: ['score sensor', 'turno'],
            myGames: 13,
            myWin: 46
        },
        {
            ico: '🎱',
            name: 'Biliardo',
            bg: '#1f1208',
            total: 189,
            sensors: ['pocket sensor', 'foul'],
            myGames: 19,
            myWin: 57
        },
        {ico: '🎳', name: 'Bocce', bg: '#1a0d2e', total: 98, sensors: ['position', 'GPS'], myGames: 0, myWin: 0},
    ].map(g => `
      <div class="card" style="padding:0;overflow:hidden">
        <div style="height:60px;background:${g.bg};display:flex;align-items:center;justify-content:center;font-size:30px">${g.ico}</div>
        <div style="padding:12px">
          <div style="font-family:var(--ff);font-size:14px;font-weight:700">${g.name}</div>
          <div style="font-size:10px;color:var(--txt3);margin-top:2px">${g.total} partite globali</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
            ${g.sensors.map(s => `<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surf2);color:var(--txt2);border:1px solid var(--bdr)">${s}</span>`).join('')}
          </div>
          ${g.myGames > 0 ? `
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--bdr)">
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:10px;color:var(--txt3)">Le mie partite</span><span style="font-size:10px;font-weight:500">${g.myGames}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:3px">
              <span style="font-size:10px;color:var(--txt3)">% vittorie</span><span style="font-size:10px;color:var(--grn);font-weight:500">${g.myWin}%</span>
            </div>
          </div>` :
        `<div style="margin-top:10px;font-size:10px;color:var(--txt3);font-style:italic">Non hai ancora giocato</div>`}
        </div>
      </div>`).join('')}
    <div class="card" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:140px">
      <div style="font-size:28px">➕</div>
      <div style="font-size:12px;color:var(--txt3)">Proponi gioco</div>
    </div>
  </div>`;
}

function playerTournaments() {
    return `
  <div class="pg-title">Tornei</div>
  <div class="pg-sub">Iscrizioni, classifiche e archivio</div>
  <div class="chip-toggle">
    <button class="chip active">In corso</button>
    <button class="chip">In arrivo</button>
    <button class="chip">Passati</button>
  </div>
  ${[
        {
            ico: '⚽',
            name: 'Torneo Calciobalilla — Primavera 2026',
            status: 'in corso',
            players: 14,
            matches: 28,
            locali: 5,
            myRank: 4,
            topPlayers: ['Luca Ferrari — 11V', 'Anna Bianchi — 9V', 'Marco Verdi — 8V']
        },
        {
            ico: '🎱',
            name: 'Coppa Biliardo Milano',
            status: 'in corso',
            players: 8,
            matches: 12,
            locali: 2,
            myRank: 2,
            topPlayers: ['Anna B. — 7V', 'Mario R. — 6V', 'Giorgio C. — 5V']
        },
    ].map(t => `
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:22px">${t.ico}</span>
        <div style="flex:1"><div style="font-family:var(--ff);font-size:14px;font-weight:700">${t.name}</div></div>
        <span class="badge b-grn">${t.status}</span>
        ${t.myRank <= 3 ? `<span class="badge b-gold">🏆 #${t.myRank}</span>` : `<span class="badge b-blu">rank #${t.myRank}</span>`}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
        <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.players}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">giocatori</div></div>
        <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.matches}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">partite</div></div>
        <div style="text-align:center"><div style="font-family:var(--ff);font-size:18px;font-weight:700">${t.locali}</div><div style="font-size:9px;color:var(--txt3);margin-top:2px">locali</div></div>
      </div>
      <div style="border-top:1px solid var(--bdr);padding-top:10px">
        ${t.topPlayers.map((p, i) => `
          <div class="podium-row">
            <span class="rank ${['r1', 'r2', 'r3'][i]}">${i + 1}°</span>
            <span style="font-size:12px;flex:1">${p}</span>
          </div>`).join('')}
      </div>
    </div>`).join('')}`;
}

function playerProfile() {
    return `
  <div class="pg-title">Il mio profilo</div>
  <div class="pg-sub">Statistiche personali e impostazioni account</div>
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;padding:14px;background:var(--surf);border:1px solid var(--bdr);border-radius:10px">
    <div style="width:52px;height:52px;border-radius:12px;background:var(--acc3);border:2px solid var(--acc);display:flex;align-items:center;justify-content:center;font-family:var(--ff);font-size:20px;font-weight:800;color:var(--acc2)">MR</div>
    <div style="flex:1">
      <div style="font-family:var(--ff);font-size:17px;font-weight:700">Mario Rossi</div>
      <div style="font-size:11px;color:var(--txt3);margin-top:2px">mario.rossi@email.it · Giocatore · dal gen 2025</div>
    </div>
    <div style="display:flex;gap:8px">
      <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700">74</div><div style="font-size:9px;color:var(--txt3)">partite</div></div>
      <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700;color:var(--grn)">61%</div><div style="font-size:9px;color:var(--txt3)">vittorie</div></div>
      <div style="text-align:center;padding:8px 14px;background:var(--surf2);border-radius:8px"><div style="font-family:var(--ff);font-size:20px;font-weight:700;color:var(--gold)">#12</div><div style="font-size:9px;color:var(--txt3)">rank</div></div>
    </div>
  </div>
  <div class="row2">
    <div class="card">
      <div class="card-hd">Statistiche per gioco</div>
      ${[
        {ico: '⚽', name: 'Calciobalilla', p: 42, w: 68, pref: true},
        {ico: '🎱', name: 'Biliardo', p: 19, w: 57, pref: false},
        {ico: '🎯', name: 'Freccette', p: 13, w: 46, pref: false},
    ].map(g => `
        <div class="list-row">
          <div class="gi" style="background:var(--surf2)">${g.ico}</div>
          <div style="flex:1"><div class="rname">${g.name}</div><div class="rmeta">${g.p} partite · ${g.w}% vittorie</div></div>
          <div class="barw"><div class="barf" style="width:${g.w}%"></div></div>
          ${g.pref ? '<span class="badge b-grn">Preferito</span>' : ''}
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd">Locali frequentati</div>
      ${[
        {name: 'Bar Belvedere — Roma', v: 34, icon: '🏪'},
        {name: 'Circolo Sportivo Milano', v: 21, icon: '🏟️'},
        {name: 'Casa propria', v: 19, icon: '🏠'},
    ].map(l => `
        <div class="list-row">
          <span style="font-size:14px">${l.icon}</span>
          <div style="flex:1"><div class="rname">${l.name}</div><div class="rmeta">${l.v} visite</div></div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ─── LOCALE ADMIN PAGES ─── */
function localeOverview() {
    return `
  <div class="pg-title">Panoramica — Bar Belvedere</div>
  <div class="pg-sub">Roma, Via del Corso 42 · Locale pubblico</div>
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
        {
            ico: '⚽',
            name: 'Calciobalilla Verde',
            status: 'In partita',
            score: '3-2',
            time: '04:21',
            players: 'Luca vs Anna'
        },
        {ico: '⚽', name: 'Calciobalilla Rosso', status: 'Libero', score: '—', time: '—', players: '—'},
        {
            ico: '🎯',
            name: 'Freccette Dx',
            status: 'In partita',
            score: '180 pts',
            time: '02:05',
            players: 'Marco vs Giulia'
        },
        {ico: '🎱', name: 'Biliardo', status: 'In pausa', score: '4-4', time: '08:33', players: 'Giorgio vs Piero'},
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
        {t: '14:47', msg: 'Goal segnato — Calciobalilla Verde (3-2)', type: 'grn'},
        {t: '14:45', msg: 'Partita iniziata — Freccette Dx', type: 'blu'},
        {t: '14:38', msg: 'Partita terminata — Calciobalilla Rosso (5-3)', type: 'grn'},
        {t: '14:31', msg: 'Edge offline temporaneo (42 sec)', type: 'amb'},
        {t: '14:29', msg: 'Sincronizzazione dati completata', type: 'blu'},
        {t: '14:20', msg: 'Nuovo giocatore registrato', type: 'grn'},
    ].map(e => `
        <div class="list-row">
          <span style="font-size:9px;color:var(--txt3);width:32px;flex-shrink:0">${e.t}</span>
          <div class="dot ${e.type === 'grn' ? 'd-grn' : e.type === 'amb' ? 'd-amb' : 'd-grn'}" style="${e.type === 'blu' ? 'background:var(--acc)' : ''}"></div>
          <div style="font-size:11px;flex:1">${e.msg}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

function localeLive() {
    return `
  <div class="pg-title">Partite Live</div>
  <div class="pg-sub">Monitoraggio in tempo reale dei giochi nel locale</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    ${[
        {
            ico: '⚽',
            name: 'Calciobalilla Verde',
            p1: 'Luca F.',
            p2: 'Anna B.',
            s1: 3,
            s2: 2,
            time: '04:21',
            status: 'live'
        },
        {
            ico: '🎯',
            name: 'Freccette Dx',
            p1: 'Marco V.',
            p2: 'Giulia R.',
            s1: 180,
            s2: 140,
            time: '02:05',
            status: 'live'
        },
        {ico: '🎱', name: 'Biliardo', p1: 'Giorgio C.', p2: 'Piero M.', s1: 4, s2: 4, time: '08:33', status: 'pausa'},
        {ico: '⚽', name: 'Calciobalilla Rosso', p1: '—', p2: '—', s1: 0, s2: 0, time: '00:00', status: 'libero'},
    ].map(g => `
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:18px">${g.ico}</span>
          <div style="font-family:var(--ff);font-size:13px;font-weight:700;flex:1">${g.name}</div>
          <span class="badge ${g.status === 'live' ? 'b-grn' : g.status === 'pausa' ? 'b-amb' : 'b-blu'}">${g.status}</span>
        </div>
        ${g.status !== 'libero' ? `
        <div style="display:flex;align-items:center;justify-content:space-around;padding:10px 0;background:var(--surf2);border-radius:8px;margin-bottom:10px">
          <div style="text-align:center"><div style="font-size:11px;color:var(--txt3)">${g.p1}</div><div style="font-family:var(--ff);font-size:26px;font-weight:800">${g.s1}</div></div>
          <div style="font-size:11px;color:var(--txt3)">vs</div>
          <div style="text-align:center"><div style="font-size:11px;color:var(--txt3)">${g.p2}</div><div style="font-family:var(--ff);font-size:26px;font-weight:800">${g.s2}</div></div>
        </div>
        <div style="text-align:center;font-size:11px;color:var(--txt3)">Tempo: ${g.time}</div>`
        : `<div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Nessuna partita in corso</div>`}
      </div>`).join('')}
  </div>`;
}

function localeGames() {
    return `<div class="pg-title">Giochi del Locale</div><div class="pg-sub">Configurazione e gestione giochi installati</div><div class="card"><table class="tbl"><thead><tr><th>Gioco</th><th>ID</th><th>Sensori</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${[{
        ico: '⚽',
        name: 'Calciobalilla Verde',
        id: 'CB-001',
        sensors: 3,
        ok: true
    }, {ico: '⚽', name: 'Calciobalilla Rosso', id: 'CB-002', sensors: 3, ok: true}, {
        ico: '🎯',
        name: 'Freccette Dx',
        id: 'FR-001',
        sensors: 1,
        ok: true
    }, {
        ico: '🎱',
        name: 'Biliardo',
        id: 'BL-001',
        sensors: 2,
        ok: false
    }].map(g => `<tr><td><span style="font-size:14px">${g.ico}</span> ${g.name}</td><td style="font-family:monospace;font-size:11px;color:var(--acc2)">${g.id}</td><td>${g.sensors} attivi</td><td><span class="badge ${g.ok ? 'b-grn' : 'b-red'}">${g.ok ? 'ok' : 'errore'}</span></td><td><button class="act-btn">Config</button></td></tr>`).join('')}</tbody></table></div>`;
}

function localeDevices() {
    return `<div class="pg-title">Dispositivi Edge</div><div class="pg-sub">Stato hardware e connessione MQTT</div><div class="stats-row-3"><div class="scard"><div class="scard-lbl">Edge principale</div><div class="scard-val" style="font-size:16px;color:var(--grn)">Online</div><div class="scard-delta up">Raspberry Pi 4 · 12ms latency</div></div><div class="scard"><div class="scard-lbl">Broker MQTT</div><div class="scard-val" style="font-size:16px;color:var(--grn)">Connesso</div><div class="scard-delta neutral">4 topic attivi</div></div><div class="scard"><div class="scard-lbl">Messaggi/min</div><div class="scard-val">142</div><div class="scard-delta up">picco 18:00</div></div></div><div class="card"><div class="card-hd">Topic MQTT attivi</div>${['locale/bar-belvedere/calciobalilla/cb-001/goal', 'locale/bar-belvedere/freccette/fr-001/score', 'locale/bar-belvedere/biliardo/bl-001/pocket', 'locale/bar-belvedere/edge/status'].map(t => `<div class="list-row"><div class="dot d-grn"></div><div style="font-family:monospace;font-size:11px;color:var(--acc2);flex:1">${t}</div></div>`).join('')}</div>`;
}

function localeStats() {
    return `<div class="pg-title">Statistiche Locale</div><div class="pg-sub">Analisi utilizzo — Bar Belvedere</div><div class="stats-row"><div class="scard"><div class="scard-lbl">Partite questo mese</div><div class="scard-val">412</div><div class="scard-delta up">+28% vs mese scorso</div></div><div class="scard"><div class="scard-lbl">Gioco più usato</div><div class="scard-val" style="font-size:16px">⚽</div><div class="scard-delta neutral">Calciobalilla</div></div><div class="scard"><div class="scard-lbl">Ora di punta</div><div class="scard-val" style="font-size:18px">18:00</div><div class="scard-delta neutral">mer-ven</div></div><div class="scard"><div class="scard-lbl">Giocatori unici</div><div class="scard-val">87</div><div class="scard-delta up">questo mese</div></div></div><div class="card"><div class="card-hd">Utilizzo per gioco</div>${[{
        ico: '⚽',
        name: 'Calciobalilla',
        pct: 58
    }, {ico: '🎯', name: 'Freccette', pct: 24}, {
        ico: '🎱',
        name: 'Biliardo',
        pct: 18
    }].map(g => `<div class="skill-row"><div class="skill-name">${g.ico} ${g.name}</div><div class="skill-bar"><div class="skill-fill" style="width:${g.pct}%;background:var(--acc)"></div></div><div class="skill-pct">${g.pct}%</div></div>`).join('')}</div>`;
}

function localeSettings() {
    return `<div class="pg-title">Impostazioni Locale</div><div class="pg-sub">Configurazione Bar Belvedere</div><div class="card" style="margin-bottom:12px"><div class="card-hd">Informazioni locale</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px"><div><div style="color:var(--txt3);margin-bottom:3px">Nome</div><div>Bar Belvedere</div></div><div><div style="color:var(--txt3);margin-bottom:3px">Tipo</div><div>Pubblico</div></div><div><div style="color:var(--txt3);margin-bottom:3px">Indirizzo</div><div>Via del Corso 42, Roma</div></div><div><div style="color:var(--txt3);margin-bottom:3px">ID Locale</div><div style="font-family:monospace;color:var(--acc2)">LOC-007</div></div></div></div><div class="card"><div class="card-hd">Accesso e sicurezza</div><div style="display:flex;flex-direction:column;gap:10px"><button class="act-btn" style="width:fit-content">Cambia password edge</button><button class="act-btn" style="width:fit-content">Rigenera token API</button><button class="danger-btn" style="width:fit-content">Disconnetti locale</button></div></div>`;
}

/* ─── PLATFORM ADMIN PAGES ─── */
function platformOverview() {
    return `
  <div class="pg-title">Overview Globale</div>
  <div class="pg-sub">Stato dell'intera piattaforma NodePlay</div>
  <div class="stats-row">
    <div class="scard"><div class="scard-lbl">Utenti totali</div><div class="scard-val">1.284</div><div class="scard-delta up">+47 questa settimana</div></div>
    <div class="scard"><div class="scard-lbl">Locali attivi</div><div class="scard-val">23</div><div class="scard-delta down">1 offline</div></div>
    <div class="scard"><div class="scard-lbl">Partite totali</div><div class="scard-val">8.4k</div><div class="scard-delta up">+142 oggi</div></div>
    <div class="scard"><div class="scard-lbl">Uptime sistema</div><div class="scard-val" style="color:var(--grn)">99.8%</div><div class="scard-delta up">ultimi 30gg</div></div>
  </div>
  <div class="row2">
    <div class="card">
      <div class="card-hd">Stato locali</div>
      ${[
        {name: 'Bar Belvedere — Roma', status: 'online', games: 4, lat: '12ms'},
        {name: 'Circolo Sportivo Milano', status: 'online', games: 6, lat: '8ms'},
        {name: 'Sala Giochi Torino', status: 'sync', games: 3, lat: '34ms'},
        {name: 'Bar Sport Genova', status: 'offline', games: 2, lat: '—'},
        {name: 'Casa di Mario Rossi', status: 'online', games: 2, lat: '22ms'},
    ].map(l => `
        <div class="list-row">
          <div class="dot ${l.status === 'online' ? 'd-grn' : l.status === 'sync' ? 'd-amb' : 'd-red'}"></div>
          <div style="flex:1"><div class="rname">${l.name}</div><div class="rmeta">${l.games} giochi · latenza ${l.lat}</div></div>
          <span class="badge ${l.status === 'online' ? 'b-grn' : l.status === 'sync' ? 'b-amb' : 'b-red'}">${l.status}</span>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd">Microservizi</div>
      ${[
        {name: 'auth-service', port: 8081, status: 'up'},
        {name: 'game-service', port: 8082, status: 'up'},
        {name: 'match-service', port: 8083, status: 'up'},
        {name: 'stats-service', port: 8084, status: 'up'},
        {name: 'tournament-service', port: 8085, status: 'up'},
        {name: 'mqtt-broker', port: 1883, status: 'up'},
        {name: 'edge-sync-service', port: 8086, status: 'degraded'},
    ].map(s => `
        <div class="list-row">
          <div class="dot ${s.status === 'up' ? 'd-grn' : 'd-amb'}"></div>
          <div style="flex:1;font-family:monospace;font-size:11px;color:var(--acc2)">${s.name}</div>
          <div style="font-size:10px;color:var(--txt3)">:${s.port}</div>
          <span class="badge ${s.status === 'up' ? 'b-grn' : 'b-amb'}">${s.status}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function platformUsers() {
    return `<div class="pg-title">Gestione Utenti</div><div class="pg-sub">Tutti gli utenti registrati sulla piattaforma</div><div style="display:flex;gap:8px;margin-bottom:12px"><button class="act-btn">+ Nuovo utente</button></div><div class="card"><table class="tbl"><thead><tr><th>Utente</th><th>Ruolo</th><th>Locale</th><th>Partite</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${[{
        name: 'Mario Rossi',
        role: 'Giocatore',
        locale: 'Bar Belvedere',
        matches: 74,
        active: true
    }, {name: 'Anna Bianchi', role: 'Giocatore', locale: 'Milano', matches: 58, active: true}, {
        name: 'Giuseppe Verdi',
        role: 'Admin Locale',
        locale: 'Bar Belvedere',
        matches: 0,
        active: true
    }, {name: 'Lucia Neri', role: 'Giocatore', locale: 'Torino', matches: 12, active: false}, {
        name: 'Roberto Blu',
        role: 'Admin Gioco',
        locale: '—',
        matches: 0,
        active: true
    }].map(u => `<tr><td><div style="font-weight:500;font-size:12px">${u.name}</div></td><td><span class="badge ${u.role === 'Giocatore' ? 'b-blu' : u.role === 'Admin Locale' ? 'b-amb' : 'b-grn'}">${u.role}</span></td><td style="font-size:11px;color:var(--txt2)">${u.locale}</td><td style="font-size:12px">${u.matches}</td><td><span class="badge ${u.active ? 'b-grn' : 'b-red'}">${u.active ? 'attivo' : 'sospeso'}</span></td><td><button class="act-btn">Edit</button></td></tr>`).join('')}</tbody></table></div>`;
}

function platformLocali() {
    return `<div class="pg-title">Gestione Locali</div><div class="pg-sub">Tutti i locali registrati sulla piattaforma</div><div style="display:flex;gap:8px;margin-bottom:12px"><button class="act-btn">+ Nuovo locale</button></div><div class="card"><table class="tbl"><thead><tr><th>Nome</th><th>Tipo</th><th>Città</th><th>Giochi</th><th>Stato</th><th></th></tr></thead><tbody>${[{
        name: 'Bar Belvedere',
        type: 'Pubblico',
        city: 'Roma',
        games: 4,
        ok: true
    }, {name: 'Circolo Sportivo', type: 'Pubblico', city: 'Milano', games: 6, ok: true}, {
        name: 'Sala Giochi',
        type: 'Pubblico',
        city: 'Torino',
        games: 3,
        ok: true
    }, {name: 'Casa di Mario Rossi', type: 'Privato', city: 'Roma', games: 2, ok: true}, {
        name: 'Bar Sport',
        type: 'Pubblico',
        city: 'Genova',
        games: 2,
        ok: false
    }].map(l => `<tr><td style="font-weight:500;font-size:12px">${l.name}</td><td><span class="badge ${l.type === 'Pubblico' ? 'b-blu' : 'b-amb'}">${l.type}</span></td><td style="font-size:11px">${l.city}</td><td>${l.games}</td><td><span class="badge ${l.ok ? 'b-grn' : 'b-red'}">${l.ok ? 'online' : 'offline'}</span></td><td><button class="act-btn">Dettagli</button></td></tr>`).join('')}</tbody></table></div>`;
}

function platformGames() {
    return `<div class="pg-title">Tipi di Gioco</div><div class="pg-sub">Definizione giochi e configurazione sensori</div><div style="display:flex;gap:8px;margin-bottom:12px"><button class="act-btn">+ Nuovo tipo gioco</button></div><div class="card"><table class="tbl"><thead><tr><th>Gioco</th><th>Sensori def.</th><th>Installazioni</th><th>Partite totali</th><th></th></tr></thead><tbody>${[{
        ico: '⚽',
        name: 'Calcioballica',
        sensors: 3,
        inst: 12,
        matches: 847
    }, {ico: '🎯', name: 'Freccette', sensors: 1, inst: 5, matches: 312}, {
        ico: '🎱',
        name: 'Biliardo',
        sensors: 2,
        inst: 4,
        matches: 189
    }, {
        ico: '🎳',
        name: 'Bocce',
        sensors: 2,
        inst: 3,
        matches: 98
    }].map(g => `<tr><td><span style="font-size:14px">${g.ico}</span> <span style="font-weight:500;font-size:12px">${g.name}</span></td><td>${g.sensors}</td><td>${g.inst}</td><td>${g.matches}</td><td><button class="act-btn">Config sensori</button></td></tr>`).join('')}</tbody></table></div>`;
}

function platformTournaments() {
    return `<div class="pg-title">Gestione Tornei</div><div class="pg-sub">Crea e gestisci tornei multi-locale</div><div style="display:flex;gap:8px;margin-bottom:12px"><button class="act-btn">+ Nuovo torneo</button></div><div class="card"><table class="tbl"><thead><tr><th>Torneo</th><th>Gioco</th><th>Locali</th><th>Partecipanti</th><th>Stato</th><th></th></tr></thead><tbody>${[{
        name: 'Calcioballica Primavera 2026',
        game: '⚽ Calcioballica',
        locali: 5,
        players: 14,
        status: 'in corso'
    }, {
        name: 'Coppa Biliardo Milano',
        game: '🎱 Biliardo',
        locali: 2,
        players: 8,
        status: 'in corso'
    }, {
        name: 'Campionato Freccette 2026',
        game: '🎯 Freccette',
        locali: 3,
        players: 0,
        status: 'in arrivo'
    }, {
        name: 'Gran Torneo Bocce 2025',
        game: '🎳 Bocce',
        locali: 4,
        players: 16,
        status: 'concluso'
    }].map(t => `<tr><td style="font-weight:500;font-size:12px">${t.name}</td><td>${t.game}</td><td>${t.locali}</td><td>${t.players || '—'}</td><td><span class="badge ${t.status === 'in corso' ? 'b-grn' : t.status === 'in arrivo' ? 'b-blu' : 'b-amb'}">${t.status}</span></td><td><button class="act-btn">Gestisci</button></td></tr>`).join('')}</tbody></table></div>`;
}

function platformMonitor() {
    return `<div class="pg-title">Monitor Sistema</div><div class="pg-sub">Performance e salute dei microservizi</div><div class="stats-row"><div class="scard"><div class="scard-lbl">CPU media</div><div class="scard-val">34%</div><div class="scard-delta up">normale</div></div><div class="scard"><div class="scard-lbl">RAM usata</div><div class="scard-val">2.1GB</div><div class="scard-delta neutral">su 8GB</div></div><div class="scard"><div class="scard-lbl">Req/min API</div><div class="scard-val">847</div><div class="scard-delta up">picco 18:00</div></div><div class="scard"><div class="scard-lbl">Msg MQTT/min</div><div class="scard-val">1.2k</div><div class="scard-delta neutral">stabile</div></div></div><div class="card"><div class="card-hd">Latenza API per endpoint</div>${[{
        ep: 'POST /api/matches',
        ms: 42,
        ok: true
    }, {ep: 'GET /api/stats/player', ms: 78, ok: true}, {
        ep: 'GET /api/tournaments',
        ms: 31,
        ok: true
    }, {
        ep: 'POST /api/edge/sync',
        ms: 234,
        ok: false
    }].map(e => `<div class="skill-row"><div class="skill-name" style="width:180px;font-family:monospace;font-size:10px;color:var(--acc2)">${e.ep}</div><div class="skill-bar"><div class="skill-fill" style="width:${Math.min(e.ms / 300 * 100, 100)}%;background:${e.ok ? 'var(--grn)' : 'var(--red)'}"></div></div><div class="skill-pct" style="width:40px">${e.ms}ms</div></div>`).join('')}</div>`;
}

function platformLogs() {
    return `<div class="pg-title">Log & Audit</div><div class="pg-sub">Registro eventi e accessi alla piattaforma</div><div class="card"><div class="card-hd">Ultimi eventi di sistema</div>${[{
        t: '14:52:01',
        type: 'INFO',
        msg: 'Match created: ID#4821 · locale LOC-007 · game CB-001',
        svc: 'match-service'
    }, {
        t: '14:51:48',
        type: 'WARN',
        msg: 'Edge LOC-004 offline — buffering 12 events locally',
        svc: 'edge-sync'
    }, {
        t: '14:49:22',
        type: 'INFO',
        msg: 'User login: mario.rossi@email.it · IP 192.168.1.42',
        svc: 'auth-service'
    }, {
        t: '14:47:10',
        type: 'INFO',
        msg: 'Goal event received: CB-001 team_a score=3',
        svc: 'mqtt-broker'
    }, {
        t: '14:45:00',
        type: 'INFO',
        msg: 'Tournament standings updated: T-003 Calciobalilla Primavera',
        svc: 'tournament-service'
    }, {
        t: '14:31:55',
        type: 'ERROR',
        msg: 'Edge sync timeout LOC-004 — retry in 30s',
        svc: 'edge-sync'
    }, {
        t: '14:30:00',
        type: 'INFO',
        msg: 'Stats aggregation job completed: 847 records',
        svc: 'stats-service'
    }].map(e => `<div class="list-row" style="gap:8px"><span style="font-size:9px;color:var(--txt3);width:56px;flex-shrink:0;font-family:monospace">${e.t}</span><span class="badge ${e.type === 'INFO' ? 'b-blu' : e.type === 'WARN' ? 'b-amb' : 'b-red'}" style="width:36px;text-align:center">${e.type}</span><span style="font-family:monospace;font-size:10px;flex:1;color:var(--txt2)">${e.msg}</span><span style="font-size:9px;color:var(--txt3);flex-shrink:0">${e.svc}</span></div>`).join('')}</div></div>`;
}

setRole('player', document.querySelector('.role-tab'));