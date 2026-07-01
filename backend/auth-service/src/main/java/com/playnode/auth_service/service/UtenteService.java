package com.playnode.auth_service.service;

import com.playnode.auth_service.dto.UtenteDTO;
import com.playnode.auth_service.dto.UtenteRequest;
import com.playnode.auth_service.entity.Utente;
import com.playnode.auth_service.repository.RepositoryUtente;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UtenteService {

    private final RepositoryUtente repositoryUtente;
    private final PasswordHashService passwordHashService;

    public UtenteService(RepositoryUtente repositoryUtente, PasswordHashService passwordHashService) {
        this.repositoryUtente = repositoryUtente;
        this.passwordHashService = passwordHashService;
    }

    public List<UtenteDTO> ottieniTutti() {
        List<UtenteDTO> out = new ArrayList<>();
        for (Utente u : repositoryUtente.findAll()) {
            out.add(toDto(u));
        }
        return out;
    }

    public UtenteDTO ottieniPerId(Integer id) {
        return repositoryUtente.findById(id).map(this::toDto).orElse(null);
    }

    public UtenteDTO crea(UtenteRequest request) {
        if (request.getEmail() == null || request.getUsername() == null
                || request.getPassword() == null || request.getRuolo() == null || request.getSesso() == null) {
            throw new IllegalArgumentException("Tutti i campi obbligatori devono essere valorizzati.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!repositoryUtente.findByEmailIgnoreCase(email).isEmpty()) {
            throw new IllegalArgumentException("Email già registrata.");
        }
        
        String username = request.getUsername().trim();
        if (!repositoryUtente.findByUsernameIgnoreCase(username).isEmpty()) {
            throw new IllegalArgumentException("Username già in uso.");
        }

        Utente u = new Utente();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordHashService.hashPassword(request.getPassword()));
        u.setRuolo(request.getRuolo());
        u.setSesso(request.getSesso());

        return toDto(repositoryUtente.save(u));
    }

    public UtenteDTO aggiorna(Integer id, UtenteRequest request, boolean isAdmin) {
        Optional<Utente> op = repositoryUtente.findById(id);
        if (op.isEmpty())
            return null;

        Utente u = op.get();
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String username = request.getUsername().trim();
            java.util.List<Utente> existingUsernames = repositoryUtente.findByUsernameIgnoreCase(username);
            if (!existingUsernames.isEmpty()) {
                Utente existingUsername = existingUsernames.get(0);
                if (!existingUsername.getId().equals(id)) {
                    throw new IllegalArgumentException("Username già in uso da un altro utente.");
                }
            }
            u.setUsername(username);
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase();
            java.util.List<Utente> existings = repositoryUtente.findByEmailIgnoreCase(email);
            if (!existings.isEmpty()) {
                Utente existing = existings.get(0);
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Email già in uso da un altro utente.");
                }
            }
            u.setEmail(email);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (!isAdmin) {
                if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                    throw new IllegalArgumentException("La password attuale è obbligatoria per poterne impostare una nuova.");
                }
                if (!passwordHashService.verifyPassword(request.getOldPassword(), u.getPassword())) {
                    throw new IllegalArgumentException("La password attuale è errata.");
                }
            }
            u.setPassword(passwordHashService.hashPassword(request.getPassword()));
        }
        if (request.getRuolo() != null)
            u.setRuolo(request.getRuolo());
        if (request.getSesso() != null)
            u.setSesso(request.getSesso());

        return toDto(repositoryUtente.save(u));
    }

    public boolean elimina(Integer id) {
        if (!repositoryUtente.existsById(id))
            return false;
        repositoryUtente.deleteById(id);
        return true;
    }

    private UtenteDTO toDto(Utente u) {
        UtenteDTO dto = new UtenteDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setRuolo(u.getRuolo());
        dto.setSesso(u.getSesso());
        return dto;
    }
}
