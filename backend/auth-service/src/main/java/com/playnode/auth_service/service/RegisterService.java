package com.playnode.auth_service.service;


import com.playnode.auth_service.dto.AuthResponse;
import com.playnode.auth_service.dto.RegisterRequest;
import com.playnode.auth_service.entity.Utente;
import com.playnode.auth_service.repository.RepositoryUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    @Autowired
    private RepositoryUtente repositoryUtente;

    @Autowired
    private PasswordHashService passwordHashService;


    /**
     * Registra un nuovo utente
     * @param request contiene email e password
     * @return AuthResponse con esito della registrazione
     */
    public AuthResponse register(RegisterRequest request) {
        // Elimina spazi
        String emailPulita = request.getEmail().trim().toLowerCase();

        // Verifica se l'email esiste già
        if (repositoryUtente.findByEmail(emailPulita) != null) {
            return new AuthResponse("Email già registrata", false);
        }

        // Hash della password
        String hashedPassword = passwordHashService.hashPassword(request.getPassword());

        // Crea il nuovo utente
        Utente utente = new Utente();
        utente.setEmail(emailPulita);
        utente.setPassword(hashedPassword);
        utente.setRuolo(request.getRuolo());
        utente.setUsername(request.getUsername());
        utente.setSesso(request.getSesso());

        // Salva nel database
        repositoryUtente.save(utente);

        return new AuthResponse("Registrazione completata con successo", true);
    }
}