/**
 * register.js
 * PlayNode — modulo Registrazione
 * Esporta: renderRegister(onSuccess)
 *
 * onSuccess(user) viene chiamata dal main quando la registrazione va a buon fine.
 * user = { name, initials, role }   (nuovo utente → sempre 'player')
 */

export function renderRegister(onSuccess) {

    const html = `
  <div id="register-root" style="
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--bg); font-family:var(--fb); padding:24px 0;
  ">
    <div style="width:100%;max-width:420px;padding:0 16px">

      <!-- logo -->
      <div style="text-align:center;margin-bottom:28px">
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
        <div style="font-family:var(--ff);font-size:16px;font-weight:700;margin-bottom:4px">Crea account</div>
        <div style="font-size:11px;color:var(--txt3);margin-bottom:22px">
          Unisciti alla piattaforma come giocatore
        </div>

        <!-- errore globale -->
        <div id="reg-error" style="
          display:none;background:var(--red-bg);border:1px solid var(--red);
          color:var(--red-t);font-size:11px;padding:8px 12px;border-radius:7px;margin-bottom:14px;
        "></div>

        <!-- successo -->
        <div id="reg-success" style="
          display:none;background:var(--grn-bg);border:1px solid var(--grn);
          color:var(--grn-t);font-size:11px;padding:8px 12px;border-radius:7px;margin-bottom:14px;
        "></div>

        <!-- step indicator -->
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:22px">
          ${[1,2].map(s => `
            <div id="step-dot-${s}" style="
              width:24px;height:24px;border-radius:50%;
              background:${s===1?'var(--acc)':'var(--surf2)'};
              border:1px solid ${s===1?'var(--acc)':'var(--bdr)'};
              display:flex;align-items:center;justify-content:center;
              font-size:10px;font-weight:700;
              color:${s===1?'#fff':'var(--txt3)'};
              transition:all .2s;
            ">${s}</div>
            ${s<2?`<div id="step-line-1" style="flex:1;height:1px;background:var(--bdr);transition:background .3s"></div>`:''}`
    ).join('')}
          <span id="step-label" style="font-size:11px;color:var(--txt3);margin-left:6px">Dati personali</span>
        </div>

        <!-- STEP 1: dati personali -->
        <div id="step-1">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Nome *</label>
              <input id="reg-nome" type="text" placeholder="Mario" style="${inputStyle()}" />
              <div class="field-err" id="err-nome" style="${errStyle()}"></div>
            </div>
            <div>
              <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Cognome *</label>
              <input id="reg-cognome" type="text" placeholder="Rossi" style="${inputStyle()}" />
              <div class="field-err" id="err-cognome" style="${errStyle()}"></div>
            </div>
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Email *</label>
            <input id="reg-email" type="email" placeholder="mario@email.it" style="${inputStyle()}" />
            <div class="field-err" id="err-email" style="${errStyle()}"></div>
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Nickname (opzionale)</label>
            <input id="reg-nick" type="text" placeholder="SuperMario99" style="${inputStyle()}" />
          </div>

          <div style="margin-bottom:6px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Data di nascita *</label>
            <input id="reg-dob" type="date" style="${inputStyle()}" />
            <div class="field-err" id="err-dob" style="${errStyle()}"></div>
          </div>

          <button id="step1-next" style="
            width:100%;margin-top:20px;padding:10px;background:var(--acc);border:none;
            border-radius:8px;color:#fff;font-family:var(--ff);font-size:13px;font-weight:700;
            cursor:pointer;transition:opacity .15s;
          ">Avanti →</button>
        </div>

        <!-- STEP 2: credenziali e locale -->
        <div id="step-2" style="display:none">
          <div style="margin-bottom:14px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Password *</label>
            <input id="reg-pwd" type="password" placeholder="Min. 8 caratteri" style="${inputStyle()}" />
            <div class="field-err" id="err-pwd" style="${errStyle()}"></div>
            <!-- strength bar -->
            <div style="margin-top:6px">
              <div style="height:3px;background:var(--surf2);border-radius:2px;overflow:hidden">
                <div id="pwd-strength-bar" style="height:3px;width:0%;border-radius:2px;transition:width .2s,background .2s"></div>
              </div>
              <div id="pwd-strength-label" style="font-size:9px;color:var(--txt3);margin-top:3px"></div>
            </div>
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Conferma password *</label>
            <input id="reg-pwd2" type="password" placeholder="Ripeti la password" style="${inputStyle()}" />
            <div class="field-err" id="err-pwd2" style="${errStyle()}"></div>
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Locale preferito (opzionale)</label>
            <select id="reg-locale" style="${inputStyle()}">
              <option value="">— Seleziona locale —</option>
              <option value="LOC-007">Bar Belvedere — Roma</option>
              <option value="LOC-002">Circolo Sportivo — Milano</option>
              <option value="LOC-003">Sala Giochi — Torino</option>
              <option value="LOC-004">Bar Sport — Genova</option>
            </select>
          </div>

          <!-- terms -->
          <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin-bottom:6px">
            <input id="reg-terms" type="checkbox" style="margin-top:2px;accent-color:var(--acc)" />
            <span style="font-size:11px;color:var(--txt2);line-height:1.5">
              Accetto i <span style="color:var(--acc2)">Termini di servizio</span> e la
              <span style="color:var(--acc2)">Privacy policy</span> della piattaforma *
            </span>
          </label>
          <div class="field-err" id="err-terms" style="${errStyle()}"></div>

          <div style="display:flex;gap:8px;margin-top:20px">
            <button id="step2-back" style="
              flex:0 0 80px;padding:10px;background:none;border:1px solid var(--bdr);
              border-radius:8px;color:var(--txt2);font-family:var(--fb);font-size:12px;cursor:pointer;
            ">← Indietro</button>
            <button id="reg-btn" style="
              flex:1;padding:10px;background:var(--acc);border:none;border-radius:8px;
              color:#fff;font-family:var(--ff);font-size:13px;font-weight:700;cursor:pointer;
              transition:opacity .15s;
            ">Registrati</button>
          </div>
        </div>

      </div>

      <!-- torna al login -->
      <div style="text-align:center;margin-top:14px">
        <span style="font-size:12px;color:var(--txt3)">Hai già un account? </span>
        <span id="go-login-btn" style="font-size:12px;color:var(--acc2);cursor:pointer;font-weight:500">
          Accedi
        </span>
      </div>

      <!-- footer -->
      <div style="text-align:center;margin-top:14px;font-size:10px;color:var(--txt3)">
        Dappia · Ricky · Angie · [team] — PISSIR Lab 2025/2026
      </div>
    </div>
  </div>`;

    document.getElementById('app-root').innerHTML = html;

    /* ── helpers stile ── */
    function inputStyle() {
        return `width:100%;padding:9px 12px;background:var(--surf2);border:1px solid var(--bdr);
            border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;`;
    }
    function errStyle() {
        return `display:none;font-size:10px;color:var(--red-t);margin-top:4px;`;
    }

    /* ── utils ── */
    function showFieldErr(id, msg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg;
        el.style.display = msg ? 'block' : 'none';
    }
    function clearFieldErrors() {
        document.querySelectorAll('.field-err').forEach(e => { e.style.display = 'none'; e.textContent = ''; });
        document.getElementById('reg-error').style.display = 'none';
    }
    function showGlobalError(msg) {
        const el = document.getElementById('reg-error');
        el.textContent = msg;
        el.style.display = 'block';
    }

    /* ── password strength ── */
    document.getElementById('reg-pwd').addEventListener('input', function() {
        const v = this.value;
        const bar = document.getElementById('pwd-strength-bar');
        const lbl = document.getElementById('pwd-strength-label');
        let score = 0;
        if (v.length >= 8)  score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        const configs = [
            { w: '0%',   bg: '',              t: '' },
            { w: '25%',  bg: 'var(--red)',   t: 'Debole' },
            { w: '50%',  bg: 'var(--amb)',   t: 'Discreta' },
            { w: '75%',  bg: 'var(--acc2)',  t: 'Buona' },
            { w: '100%', bg: 'var(--grn)',   t: 'Ottima' },
        ];
        bar.style.width      = configs[score].w;
        bar.style.background = configs[score].bg;
        lbl.textContent      = configs[score].t;
        lbl.style.color      = configs[score].bg;
    });

    /* ── step 1 → step 2 ── */
    document.getElementById('step1-next').addEventListener('click', () => {
        clearFieldErrors();
        let valid = true;
        const nome    = document.getElementById('reg-nome').value.trim();
        const cognome = document.getElementById('reg-cognome').value.trim();
        const email   = document.getElementById('reg-email').value.trim();
        const dob     = document.getElementById('reg-dob').value;

        if (!nome)    { showFieldErr('err-nome',    'Campo obbligatorio'); valid = false; }
        if (!cognome) { showFieldErr('err-cognome', 'Campo obbligatorio'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldErr('err-email', 'Email non valida'); valid = false;
        }
        if (!dob) { showFieldErr('err-dob', 'Campo obbligatorio'); valid = false; }

        if (!valid) return;

        /* avanza allo step 2 */
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';

        /* aggiorna stepper */
        document.getElementById('step-dot-1').style.background = 'var(--grn)';
        document.getElementById('step-dot-1').style.borderColor = 'var(--grn)';
        document.getElementById('step-dot-2').style.background  = 'var(--acc)';
        document.getElementById('step-dot-2').style.borderColor = 'var(--acc)';
        document.getElementById('step-dot-2').style.color       = '#fff';
        document.getElementById('step-line-1').style.background = 'var(--grn)';
        document.getElementById('step-label').textContent       = 'Credenziali';
    });

    /* ── step 2 → step 1 ── */
    document.getElementById('step2-back').addEventListener('click', () => {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
        document.getElementById('step-dot-1').style.background  = 'var(--acc)';
        document.getElementById('step-dot-1').style.borderColor = 'var(--acc)';
        document.getElementById('step-dot-2').style.background  = 'var(--surf2)';
        document.getElementById('step-dot-2').style.borderColor = 'var(--bdr)';
        document.getElementById('step-dot-2').style.color       = 'var(--txt3)';
        document.getElementById('step-line-1').style.background = 'var(--bdr)';
        document.getElementById('step-label').textContent       = 'Dati personali';
    });

    /* ── submit finale ── */
    document.getElementById('reg-btn').addEventListener('click', () => {
        clearFieldErrors();
        let valid = true;

        const nome    = document.getElementById('reg-nome').value.trim();
        const cognome = document.getElementById('reg-cognome').value.trim();
        const pwd     = document.getElementById('reg-pwd').value;
        const pwd2    = document.getElementById('reg-pwd2').value;
        const terms   = document.getElementById('reg-terms').checked;

        if (pwd.length < 8)  { showFieldErr('err-pwd',  'Minimo 8 caratteri'); valid = false; }
        if (pwd !== pwd2)    { showFieldErr('err-pwd2', 'Le password non corrispondono'); valid = false; }
        if (!terms)          { showFieldErr('err-terms', 'Devi accettare i termini'); valid = false; }

        if (!valid) return;

        /* ── TODO produzione: POST /api/auth/register → JWT → localStorage ── */
        const btn = document.getElementById('reg-btn');
        btn.textContent   = 'Registrazione in corso…';
        btn.style.opacity = '.7';

        setTimeout(() => {
            const initials = (nome[0] + cognome[0]).toUpperCase();
            const user = { name: `${nome} ${cognome}`, initials, role: 'player' };

            const ok = document.getElementById('reg-success');
            ok.textContent   = `Account creato! Benvenuto, ${nome}.`;
            ok.style.display = 'block';
            btn.style.display = 'none';

            setTimeout(() => onSuccess(user), 1200);
        }, 800);
    });

    /* ── torna al login ── */
    document.getElementById('go-login-btn').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cgp:goto', { detail: 'login' }));
    });
}