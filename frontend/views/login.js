/**
 * login.js
 * PlayNode — modulo Login
 * Esporta: renderLogin(onSuccess)
 *
 * onSuccess(user) viene chiamata dal main quando il login va a buon fine.
 * user = { name, initials, role }   role: 'player' | 'locale' | 'platform'
 */

export function renderLogin(onSuccess) {
    /* ── dati mock: in produzione sostituire con chiamata a /api/auth/login ── */
    const MOCK_USERS = [
        { email: 'mario@cgp.it',   password: '1234', name: 'Mario Rossi',   initials: 'MR', role: 'player'   },
        { email: 'gestore@cgp.it', password: '1234', name: 'Gestore Bar',   initials: 'GB', role: 'locale'   },
        { email: 'admin@cgp.it',   password: '1234', name: 'Admin',         initials: 'AD', role: 'platform' },
    ];

    /* ── template HTML ── */
    const html = `
  <div id="login-root" style="
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--bg); font-family:var(--fb);
  ">
    <div style="width:100%;max-width:380px;padding:0 16px">
 
      <!-- logo -->
      <div style="text-align:center;margin-bottom:32px">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:9px;height:9px;background:var(--acc);border-radius:50%"></div>
          <span style="font-family:var(--ff);font-size:18px;font-weight:800;color:#fff;letter-spacing:-.3px">
            PlayNode
          </span>
        </div>
        <div style="font-size:12px;color:var(--txt3)">UPO — A.A. 2025/2026</div>
      </div>
 
      <!-- card -->
      <div style="
        background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:28px;
      ">
        <div style="font-family:var(--ff);font-size:16px;font-weight:700;margin-bottom:4px">Accedi</div>
        <div style="font-size:11px;color:var(--txt3);margin-bottom:22px">
          Inserisci le credenziali del tuo account
        </div>
 
        <!-- errore -->
        <div id="login-error" style="
          display:none;background:var(--red-bg);border:1px solid var(--red);
          color:var(--red-t);font-size:11px;padding:8px 12px;border-radius:7px;margin-bottom:14px;
        "></div>
 
        <!-- email -->
        <div style="margin-bottom:14px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Email</label>
          <input id="login-email" type="email" placeholder="mario@cgp.it" style="
            width:100%;padding:9px 12px;background:var(--surf2);border:1px solid var(--bdr);
            border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;
          " />
        </div>
 
        <!-- password -->
        <div style="margin-bottom:6px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Password</label>
          <input id="login-password" type="password" placeholder="••••••••" style="
            width:100%;padding:9px 12px;background:var(--surf2);border:1px solid var(--bdr);
            border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;
          " />
        </div>
 
        <!-- forgot -->
        <div style="text-align:right;margin-bottom:20px">
          <span style="font-size:11px;color:var(--acc2);cursor:pointer">Password dimenticata?</span>
        </div>
 
        <!-- submit -->
        <button id="login-btn" style="
          width:100%;padding:10px;background:var(--acc);border:none;border-radius:8px;
          color:#fff;font-family:var(--ff);font-size:13px;font-weight:700;cursor:pointer;
          transition:opacity .15s;
        ">Accedi</button>
 
        <!-- divider -->
        <div style="
          display:flex;align-items:center;gap:10px;margin:18px 0;
        ">
          <div style="flex:1;height:1px;background:var(--bdr)"></div>
          <span style="font-size:10px;color:var(--txt3)">oppure</span>
          <div style="flex:1;height:1px;background:var(--bdr)"></div>
        </div>
 
        <!-- vai a registrazione -->
        <button id="go-register-btn" style="
          width:100%;padding:9px;background:none;border:1px solid var(--bdr);border-radius:8px;
          color:var(--txt2);font-family:var(--fb);font-size:12px;cursor:pointer;
          transition:background .15s;
        ">Non hai un account? <span style="color:var(--acc2);font-weight:500">Registrati</span></button>
      </div>
 
      <!-- hint credenziali demo -->
      <div style="
        margin-top:14px;background:var(--surf2);border:1px solid var(--bdr);
        border-radius:9px;padding:12px 14px;
      ">
        <div style="font-size:10px;color:var(--txt3);margin-bottom:7px;text-transform:uppercase;letter-spacing:.5px">
          Credenziali demo (password: 1234)
        </div>
        ${MOCK_USERS.map(u => `
          <div class="demo-fill" data-email="${u.email}" style="
            display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:6px;
            cursor:pointer;transition:background .15s;
          ">
            <div style="
              width:22px;height:22px;border-radius:50%;background:var(--acc3);
              display:flex;align-items:center;justify-content:center;
              font-size:8px;font-weight:700;color:var(--acc2);flex-shrink:0;
            ">${u.initials}</div>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:500">${u.name}</div>
              <div style="font-size:10px;color:var(--txt3)">${u.email}</div>
            </div>
            <span style="
              font-size:9px;padding:2px 6px;border-radius:10px;
              background:var(--acc3);color:var(--acc2);
            ">${u.role}</span>
          </div>`).join('')}
      </div>
 
      <!-- footer -->
      <div style="text-align:center;margin-top:18px;font-size:10px;color:var(--txt3)">
        Dappia · Ricky · Angie · [team] — PISSIR Lab 2025/2026
      </div>
    </div>
  </div>`;

    document.getElementById('login-root').innerHTML = html;

    /* ── logica ── */
    const emailInput    = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorBox      = document.getElementById('login-error');
    const loginBtn      = document.getElementById('login-btn');
    const goRegBtn      = document.getElementById('go-register-btn');

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
    }
    function hideError() { errorBox.style.display = 'none'; }

    /* autofill credenziali demo */
    document.querySelectorAll('.demo-fill').forEach(el => {
        el.addEventListener('mouseenter', () => el.style.background = 'var(--surf3)');
        el.addEventListener('mouseleave', () => el.style.background = '');
        el.addEventListener('click', () => {
            emailInput.value    = el.dataset.email;
            passwordInput.value = '1234';
            hideError();
        });
    });

    function attemptLogin() {
        hideError();
        const email = emailInput.value.trim().toLowerCase();
        const pwd   = passwordInput.value;

        if (!email || !pwd) { showError('Compila email e password.'); return; }

        const user = MOCK_USERS.find(u => u.email === email && u.password === pwd);
        if (!user) { showError('Credenziali non valide.'); return; }

        /* ── TODO produzione: POST /api/auth/login → JWT → localStorage ── */
        loginBtn.textContent = 'Accesso in corso…';
        loginBtn.style.opacity = '.7';
        setTimeout(() => onSuccess({ name: user.name, initials: user.initials, role: user.role }), 600);
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });

    /* navigazione verso registrazione */
    goRegBtn.addEventListener('click', () => {
        /* lancia evento custom intercettato da main.js */
        document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'register' }));
    });
}