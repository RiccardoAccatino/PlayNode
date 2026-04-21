package com.playnode.auth_service.service;


import com.playnode.auth_service.dto.authResponse;
import com.playnode.auth_service.dto.registerRequest;
import com.playnode.auth_service.entity.utente;
import com.playnode.auth_service.entity.ruoloTipo;
import com.playnode.auth_service.repository.repositoryUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class registerService {

    @Autowired
    private repositoryUtente repositoryUtente;

    @Autowired
    private passwordHashService passwordHashService;


    /**
     * Registra un nuovo utente
     * @param request contiene email e password
     * @return AuthResponse con esito della registrazione
     */
    public authResponse register(registerRequest request) {

        // Verifica se l'email esiste già
        if (repositoryUtente.findByEmail(request.getEmail()) != null) {
            return new authResponse("Email già registrata", false);
        }

        // Hash della password
        String hashedPassword = passwordHashService.hashPassword(request.getPassword());

        // Crea il nuovo utente
        utente utente = new utente();
        utente.setEmail(request.getEmail());
        utente.setPassword(hashedPassword);
        utente.setRuolo(ruoloTipo.Giocatore);

        // Salva nel database
        repositoryUtente.save(utente);

        return new authResponse("Registrazione completata con successo", true);
    }
}