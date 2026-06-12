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
        if (repositoryUtente.findByEmail(email) != null) {
            throw new IllegalArgumentException("Email già registrata.");
        }

        Utente u = new Utente();
        u.setUsername(request.getUsername().trim());
        u.setEmail(email);
        u.setPassword(passwordHashService.hashPassword(request.getPassword()));
        u.setRuolo(request.getRuolo());
        u.setSesso(request.getSesso());

        return toDto(repositoryUtente.save(u));
    }

    public UtenteDTO aggiorna(Integer id, UtenteRequest request) {
        Optional<Utente> op = repositoryUtente.findById(id);
        if (op.isEmpty())
            return null;

        Utente u = op.get();
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            u.setUsername(request.getUsername().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase();
            Utente existing = repositoryUtente.findByEmail(email);
            if (existing != null && !existing.getId().equals(id)) {
                throw new IllegalArgumentException("Email già in uso da un altro utente.");
            }
            u.setEmail(email);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
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
