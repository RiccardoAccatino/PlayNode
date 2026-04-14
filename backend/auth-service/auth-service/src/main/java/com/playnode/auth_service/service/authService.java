package com.playnode.auth_service.service;

import com.playnode.auth_service.dto.loginRequest;
import com.playnode.auth_service.dto.registerRequest;
import com.playnode.auth_service.entity.utente;
import com.playnode.auth_service.repository.repositoryUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class authService {

    @Autowired
    private repositoryUtente utenteRepository; // Assumendo tu abbia un Repository

    @Autowired
    private PasswordEncoder passwordEncoder; // Per codificare la password

    // ...

    public void register(registerRequest registerRequest) {

        if (utenteRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Errore: Username già in uso!");
        }
        if (utenteRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Errore: Email già in uso!");
        }
        utente nuovoUtente = new utente(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getRuolo(),
                registerRequest.getSesso()
        );

        utenteRepository.save(nuovoUtente);
    }


    public String login(loginRequest loginRequest) {

            utente utente = (utente) utenteRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utente non trovato."));

            // 2. Controlla se la password è corretta
            if (passwordEncoder.matches(loginRequest.getPassword(), utente.getPassword())) {
                // 3. Se è corretta, genera un token JWT      DA CAPIREEEEEEEEEE
                // return generateJwtToken(user);
                return "TOKEN_GENERATO_CON_SUCCESSO"; // Semplifichiamo per ora
            } else {
                throw new RuntimeException("Password non valida.");
            }
        }
    }
}