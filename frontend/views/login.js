/**
 * login.js
 * PlayNode — modulo Login
 * Esporta: renderLogin(onSuccess)
 *
 * onSuccess(user) viene chiamata dal main quando il login va a buon fine.
 * user = { name, initials, role }   role: 'player' | 'locale' | 'platform'
 */

import { loginUser } from '../js/api.js';

export function renderLogin(onSuccess) {
    /* ── Dati demo aggiornati con il database reale ── */
    const MOCK_USERS = [
        { email: 'angie.albitres@gmail.com',     password: 'PlayNode2026!', name: 'Angie (Giocatore)', initials: 'AN', role: 'player'   },
        { email: 'mario.rossi@gmail.com',        password: 'PlayNode2026!', name: 'Mario (Gestore)',   initials: 'MR', role: 'locale'   },
        { email: 'francesco.dappiano@gmail.com', password: 'PlayNode2026!', name: 'Francesco (Admin)', initials: 'FR', role: 'platform' },
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
 
        <!-- password con bottone mostra/nascondi -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Password</label>
          <div style="position:relative; display:flex; align-items:center;">
            <!-- Ho aggiunto padding-right: 35px per non far finire il testo sotto l'icona -->
            <input id="login-password" type="password" placeholder="••••••••" style="
              width:100%;padding:9px 12px;padding-right:35px;background:var(--surf2);border:1px solid var(--bdr);
              border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;
            " />
            <!-- Bottone con l'icona a forma di occhio -->
            <button id="toggle-pwd-btn" type="button" style="
              position:absolute; right:10px; background:none; border:none; cursor:pointer; 
              font-size:14px; color:var(--txt3); padding:0; display:flex; align-items:center;
            ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
              <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
              <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
              <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
            </svg>
            </button>
          </div>
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
          Credenziali demo (password: PlayNode2026!)
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
        Dappia · Ricky · Angie - 2026
      </div>
    </div>
  </div>`;

    document.getElementById('app-root').innerHTML = html;

    /* ── logica ── */
    const emailInput    = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const togglePwdBtn  = document.getElementById('toggle-pwd-btn');
    const errorBox      = document.getElementById('login-error');
    const loginBtn      = document.getElementById('login-btn');
    const goRegBtn      = document.getElementById('go-register-btn');

    /* Logica per mostrare/nascondere la password */
    togglePwdBtn.addEventListener('click', () => {
        // Se il campo è di tipo password, lo facciamo diventare testo leggibile
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';

            // Icona: Occhio sbarrato (eye-slash) per dire "clicca per nascondere"
            togglePwdBtn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">' +
                '<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>' +
                '<path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>' +
                '<path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>' +
                '</svg>';
        } else {
            // Altrimenti, lo facciamo tornare a pallini nascosti
            passwordInput.type = 'password';

            // Icona: Occhio normale (eye) per dire "clicca per mostrare"
            togglePwdBtn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">' +
                '  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>' +
                '  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>' +
                '</svg>';
        }
    });

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
            // Inserisce l'email associata al pulsante
            emailInput.value = el.dataset.email;
            // Inserisce la nuova password corretta
            passwordInput.value = 'PlayNode2026!';
            hideError();
        });
    });

    async function attemptLogin() {
        hideError();
        const email = emailInput.value.trim().toLowerCase();
        const pwd   = passwordInput.value;

        // Controllo base: se i campi sono vuoti ci fermiamo subito
        if (!email || !pwd) {
            showError('Compila email e password.');
            return;
        }

        // Cambiamo l'aspetto del bottone per far capire all'utente che stiamo caricando
        loginBtn.textContent = 'Accesso in corso…';
        loginBtn.style.opacity = '.7';
        loginBtn.disabled = true; // Disabilitiamo il bottone per evitare doppi click

        try {
            const userData = await loginUser(email, pwd);

            //localStorage.setItem('token', userData.token);

            // Passiamo i dati alla funzione onSuccess di app.js
            // Adattiamo i dati al formato che app.js si aspetta (name, initials, role)
            onSuccess({
                name: userData.nome || 'Utente', // Modifica "nome" in base a cosa restituisce il tuo Java
                initials: 'UT',
                role: userData.ruolo || 'player'
            });

        } catch (error) {
            // Se c'è stato un errore (password errata o server spento), mostriamo l'errore
            showError('Credenziali non valide o impossibile connettersi al server.');

            // Ripristiniamo il bottone
            loginBtn.textContent = 'Accedi';
            loginBtn.style.opacity = '1';
            loginBtn.disabled = false;
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });

    /* navigazione verso registrazione */
    goRegBtn.addEventListener('click', () => {
        /* lancia evento custom intercettato da main.js */
        document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'register' }));
    });
}