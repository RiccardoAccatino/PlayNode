/**
 * Modulo per la gestione dell'interfaccia e della logica di Registrazione.
 *
 * Esporta la funzione `renderRegister` che inietta il modulo a due step
 * (Dati e Credenziali) e invia una richiesta POST al backend per creare l'utente.
 */

import {registerUser} from '../js/api.js';

/**
 * Disegna la schermata di registrazione e aggancia gli eventi di navigazione e validazione.
 *
 * @param {Function} onSuccess - Callback invocata da app.js. Viene chiamata solo
 *                               se la chiamata API ha successo, passando i dati dell'utente.
 */
export function renderRegister(onSuccess) {

    /*
     * ── template HTML ──
     * Struttura del form divisa in due sezioni logiche (step-1 e step-2).
     */
    const html = `
      <div id="register-root" style="
        min-height:100vh; display:flex; align-items:center; justify-content:center;
        background:var(--bg); font-family:var(--fb); padding:24px 0;
      ">
        <div style="width:100%;max-width:420px;padding:0 16px">
    
          <!-- logo -->
          <div style="text-align:center; margin-bottom:32px; margin-top:32px">
            <div style="display:inline-flex; align-items:center; gap:12px; margin-bottom:6px">
              
              <!-- Immagine logo -->
              <img 
                src="./assets/img/Logo.png" 
                alt="PlayNode Logo" 
                style="width: 45px; height: 45px; object-fit: contain;"
              />
              
              <!-- Nome del progetto -->
              <span style="font-family:var(--ff); font-size:24px; font-weight:800; color:#fff; letter-spacing:-.3px">
                PlayNode
              </span>
            </div>
          </div>
    
          <!-- card principale del modulo -->
          <div style="
            background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:28px;
          ">
            <div style="font-family:var(--ff);font-size:16px;font-weight:700;margin-bottom:4px">Crea account</div>
            <div style="font-size:11px;color:var(--txt3);margin-bottom:22px">
              Unisciti alla piattaforma come giocatore
            </div>
    
            <!-- box errore generico (es. server offline o email duplicata) -->
            <div id="reg-error" style="
              display:none;background:var(--red-bg);border:1px solid var(--red);
              color:var(--red-t);font-size:11px;padding:8px 12px;border-radius:7px;margin-bottom:14px;
            "></div>
    
            <!-- box successo (mostrato prima del re-indirizzamento) -->
            <div id="reg-success" style="
              display:none;background:var(--grn-bg);border:1px solid var(--grn);
              color:var(--grn-t);font-size:11px;padding:8px 12px;border-radius:7px;margin-bottom:14px;
            "></div>
    
            <!-- Indicatore visivo degli Step (1: Dati, 2: Credenziali) -->
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:22px">
              ${[1, 2].map(s => `
                <div id="step-dot-${s}" style="
                  width:24px;height:24px;border-radius:50%;
                  background:${s === 1 ? 'var(--acc)' : 'var(--surf2)'};
                  border:1px ;solid: ${s === 1 ? 'var(--acc)' : 'var(--bdr)'};
                  display:flex;align-items:center;justify-content:center;
                  font-size:10px;font-weight:700;
                  color:${s === 1 ? '#fff' : 'var(--txt3)'};
                  transition:all .2s;
                ">${s}</div>
                ${s < 2 ? `<div id="step-line-1" style="flex:1;height:1px;background:var(--bdr);transition:background .3s"></div>` : ''}`).join('')}
              <span id="step-label" style="font-size:11px;color:var(--txt3);margin-left:6px">Dati</span>
            </div>
    
            <!-- ============================================== -->
            <!-- STEP 1: Dati (Username, Email, Sesso)     -->
            <!-- ============================================== -->
            <div id="step-1">
              
              <div style="margin-bottom:14px">
                <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Username *</label>
                <input id="reg-username" type="text" placeholder="SuperMario99" style="${inputStyle()}" />
                <div class="field-err" id="err-username" style="${errStyle()}"></div>
              </div>
    
              <div style="margin-bottom:14px">
                <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Email *</label>
                <input id="reg-email" type="email" placeholder="mario@email.it" style="${inputStyle()}" />
                <div class="field-err" id="err-email" style="${errStyle()}"></div>
              </div>

              <div style="margin-bottom:14px">
                <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Sesso *</label>
                <select id="reg-sesso" style="${inputStyle()}">
                  <option value="">— Seleziona —</option>
                  <option value="Maschio">Maschio</option>
                  <option value="Femmina">Femmina</option>
                  <option value="Altro">Altro/Preferisco non dirlo</option>
                </select>
                <div class="field-err" id="err-sesso" style="${errStyle()}"></div>
              </div>
    
              <button id="step1-next" style="
                width:100%;margin-top:20px;padding:10px;background:var(--acc);border:none;
                border-radius:8px;color:#fff;font-family:var(--ff);font-size:13px;font-weight:700;
                cursor:pointer;transition:opacity .15s;
              ">Avanti →</button>
            </div>
    
            <!-- ============================================== -->
            <!-- STEP 2: Credenziali (Password, Termini)        -->
            <!-- ============================================== -->
            <div id="step-2" style="display:none">
              
              <!-- CAMPO: PASSWORD PRINCIPALE -->
                <div style="margin-bottom:14px">
                  <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Password *</label>
                  
                  <!-- Involucro per posizionare l'occhietto -->
                  <div style="position:relative; display:flex; align-items:center;">
                    <!-- Nota l'aggiunta di 'padding-right:35px;' per non far sovrapporre il testo all'icona -->
                    <input id="reg-pwd" type="password" placeholder="Min. 8 caratteri" style="${inputStyle()} padding-right:35px;" />
                    
                    <button id="toggle-reg-pwd-btn" type="button" style="
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
                  
                  <div class="field-err" id="err-pwd" style="${errStyle()}"></div>
                  
                  <!-- La tua barra per indicare la forza della password in tempo reale -->
                  <div style="margin-top:6px">
                    <div style="height:3px;background:var(--surf2);border-radius:2px;overflow:hidden">
                      <div id="pwd-strength-bar" style="height:3px;width:0%;border-radius:2px;transition:width .2s,background .2s"></div>
                    </div>
                    <div id="pwd-strength-label" style="font-size:9px;color:var(--txt3);margin-top:3px"></div>
                  </div>
                </div>
                
                <!-- CAMPO: CONFERMA PASSWORD -->
                <div style="margin-bottom:14px">
                  <label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:5px">Conferma password *</label>
                  
                  <!-- Involucro per posizionare il secondo occhietto -->
                  <div style="position:relative; display:flex; align-items:center;">
                    <input id="reg-pwd2" type="password" placeholder="Ripeti la password" style="${inputStyle()} padding-right:35px;" />
                    
                    <button id="toggle-reg-pwd2-btn" type="button" style="
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
                  
                  <div class="field-err" id="err-pwd2" style="${errStyle()}"></div>
                </div>
    
              <!-- Checkbox termini di servizio -->
              <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin-bottom:6px">
                <input id="reg-terms" type="checkbox" style="margin-top:2px;accent-color:var(--acc)" />
                <span style="font-size:11px;color:var(--txt2);line-height:1.5">
                  Accetto i <span style="color:var(--acc2)">Termini di servizio</span> e la
                  <span style="color:var(--acc2)">Privacy policy</span> *
                </span>
              </label>
              <div class="field-err" id="err-terms" style="${errStyle()}"></div>
    
              <!-- Pulsanti di navigazione step 2 -->
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
    
          <!-- link per tornare al login -->
          <div style="text-align:center;margin-top:14px">
            <span style="font-size:12px;color:var(--txt3)">Hai già un account? </span>
            <span id="go-login-btn" style="font-size:12px;color:var(--acc2);cursor:pointer;font-weight:500">
              Accedi
            </span>
          </div>
    
          <!-- footer -->
          <div style="text-align:center;margin-top:14px;font-size:10px;color:var(--txt3)">
            Dappia · Ricky · Angie - 2026
          </div>
        </div>
      </div>`;

    document.getElementById('app-root').innerHTML = html;

    /**
     * Funzioni CSS in linea per i campi di input
     */
    function inputStyle() {
        return `width:100%;padding:9px 12px;background:var(--surf2);border:1px solid var(--bdr);
            border-radius:7px;color:var(--txt);font-family:var(--fb);font-size:13px;outline:none;`;
    }

    function errStyle() {
        return `display:none;font-size:10px;color:var(--red-t);margin-top:4px;`;
    }

    /**
     * Funzioni Helper per mostrare/nascondere gli errori nei singoli campi
     */
    const regPwdInput = document.getElementById('reg-pwd');
    const toggleRegPwdBtn = document.getElementById('toggle-reg-pwd-btn');

    const regPwd2Input = document.getElementById('reg-pwd2');
    const toggleRegPwd2Btn = document.getElementById('toggle-reg-pwd2-btn');

    function togglePasswordVisibility(inputElement, btnElement) {
        if (inputElement.type === 'password') {
            // Mostra la password e metti l'icona "Occhio aperto"
            inputElement.type = 'text';
            btnElement.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">' +
                '  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>' +
                '  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>' +
                '</svg>';
        } else {
            // Nascondi la password e metti l'icona "Occhio sbarrato"
            inputElement.type = 'password';
            btnElement.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">' +
                '  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>' +
                '  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>' +
                '  <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>' +
                '</svg>';
        }
    }
    toggleRegPwdBtn.addEventListener('click', () => togglePasswordVisibility(regPwdInput, toggleRegPwdBtn));
    toggleRegPwd2Btn.addEventListener('click', () => togglePasswordVisibility(regPwd2Input, toggleRegPwd2Btn));

    function showFieldErr(id, msg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg;
        el.style.display = msg ? 'block' : 'none';
    }

    function clearFieldErrors() {
        document.querySelectorAll('.field-err').forEach(e => {
            e.style.display = 'none';
            e.textContent = '';
        });
        document.getElementById('reg-error').style.display = 'none';
    }

    function showGlobalError(msg) {
        const el = document.getElementById('reg-error');
        el.textContent = msg;
        el.style.display = 'block';
    }

    /*
     * Logica della barra di forza della password.
     * Calcola un punteggio basato su lunghezza, maiuscole, numeri e simboli.
     */
    document.getElementById('reg-pwd').addEventListener('input', function () {
        const v = this.value;
        const bar = document.getElementById('pwd-strength-bar');
        const lbl = document.getElementById('pwd-strength-label');
        let score = 0;

        if (v.length >= 8) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;

        const configs = [
            {w: '0%', bg: '', t: ''},
            {w: '25%', bg: 'var(--red)', t: 'Debole'},
            {w: '50%', bg: 'var(--amb)', t: 'Discreta'},
            {w: '75%', bg: 'var(--acc2)', t: 'Buona'},
            {w: '100%', bg: 'var(--grn)', t: 'Ottima'},
        ];

        bar.style.width = configs[score].w;
        bar.style.background = configs[score].bg;
        lbl.textContent = configs[score].t;
        lbl.style.color = configs[score].bg;
    });

    /**
     * Transizione: Step 1 (Dati) → Step 2 (Credenziali)
     * Controlla che i campi della prima schermata siano compilati correttamente.
     */
    document.getElementById('step1-next').addEventListener('click', () => {
        clearFieldErrors();
        let valid = true;

        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const sesso = document.getElementById('reg-sesso').value;

        // Validazione dei campi dello step 1
        if (!username) {
            showFieldErr('err-username', 'Campo obbligatorio');
            valid = false;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldErr('err-email', 'Email non valida');
            valid = false;
        }
        if (!sesso) {
            showFieldErr('err-sesso', 'Seleziona un genere');
            valid = false;
        }

        if (!valid) return; // Si ferma se ci sono errori

        /* Animazione e cambio visualizzazione: Nasconde Step 1, Mostra Step 2 */
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';

        /* Aggiorna la grafica dei pallini in alto */
        document.getElementById('step-dot-1').style.background = 'var(--grn)';
        document.getElementById('step-dot-1').style.borderColor = 'var(--grn)';
        document.getElementById('step-dot-2').style.background = 'var(--acc)';
        document.getElementById('step-dot-2').style.borderColor = 'var(--acc)';
        document.getElementById('step-dot-2').style.color = '#fff';
        document.getElementById('step-line-1').style.background = 'var(--grn)';
        document.getElementById('step-label').textContent = 'Credenziali';
    });

    /**
     * Transizione: Step 2 (Credenziali) → Torna allo Step 1 (Dati)
     */
    document.getElementById('step2-back').addEventListener('click', () => {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';

        /* Ripristina la grafica dei pallini */
        document.getElementById('step-dot-1').style.background = 'var(--acc)';
        document.getElementById('step-dot-1').style.borderColor = 'var(--acc)';
        document.getElementById('step-dot-2').style.background = 'var(--surf2)';
        document.getElementById('step-dot-2').style.borderColor = 'var(--bdr)';
        document.getElementById('step-dot-2').style.color = 'var(--txt3)';
        document.getElementById('step-line-1').style.background = 'var(--bdr)';
        document.getElementById('step-label').textContent = 'Dati';
    });

    /**ù
     * Raccoglie i dati, li impacchetta per Java e chiama l'API tramite api.js.
     */
    document.getElementById('reg-btn').addEventListener('click', async () => {
        clearFieldErrors();
        let valid = true;

        // 1. Recupero valori dallo Step 2
        const pwd = document.getElementById('reg-pwd').value;
        const pwd2 = document.getElementById('reg-pwd2').value;
        const terms = document.getElementById('reg-terms').checked;

        // Validazione finale frontend
        if (pwd.length < 8) {
            showFieldErr('err-pwd', 'Minimo 8 caratteri');
            valid = false;
        }
        if (pwd !== pwd2) {
            showFieldErr('err-pwd2', 'Le password non corrispondono');
            valid = false;
        }
        if (!terms) {
            showFieldErr('err-terms', 'Devi accettare i termini di servizio');
            valid = false;
        }

        if (!valid) return;

        // Recupero i dati dallo Step 1 (che sono ancora presenti nella pagina anche se nascosti)
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const sesso = document.getElementById('reg-sesso').value;

        // Disabilitazione pulsante per prevenire doppi invii accidentali
        const btn = document.getElementById('reg-btn');
        btn.textContent = 'Registrazione in corso…';
        btn.style.opacity = '.7';
        btn.disabled = true;

        /*
         * 2. Creazione dell'oggetto Payload (i dati da inviare al database).
         */
        const payloadRegister = {
            username: username,
            email: email,
            password: pwd,
            ruolo: "Giocatore",
            sesso: sesso
        };

        try {
            // 3. Chiamata HTTP tramite fetch (in api.js)
            const responseData = await registerUser(payloadRegister);

            // 4. Se la registrazione va a buon fine, prepariamo i dati per la dashboard:
            // Usiamo le prime due lettere dello username per creare un piccolo avatar circolare
            const initials = username.substring(0, 2).toUpperCase();
            const userForDashboard = {
                name: username,
                initials: initials,
                role: 'Giocatore'
            };

            // Se il backend restituisce subito un token di accesso dopo la registrazione, lo salviamo
            if (responseData.token) {
                localStorage.setItem('token', responseData.token);
            }

            // Mostriamo il messaggio di successo verde
            const okMsg = document.getElementById('reg-success');
            okMsg.textContent = `Account creato! Benvenuto, ${username}.`;
            okMsg.style.display = 'block';
            btn.style.display = 'none'; // Nascondiamo il bottone per evitare nuova confusione

            // 5. Attendiamo 1.5 secondi per far leggere il messaggio, poi passiamo il controllo a app.js
            setTimeout(() => onSuccess(userForDashboard), 1500);

        } catch (error) {
            // Gestione dell'errore (es. Email già in uso nel DB, oppure backend spento)
            showGlobalError('Errore durante la registrazione. Forse l\'email o lo username sono già in uso.');

            // Ripristiniamo il bottone
            btn.textContent = 'Registrati';
            btn.style.opacity = '1';
            btn.disabled = false;
        }
    });

    /**
     * Navigazione inversa: Torna alla schermata di Login se l'utente ha già un account.
     */
    document.getElementById('go-login-btn').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cgp:goto', {detail: 'login'}));
    });
}