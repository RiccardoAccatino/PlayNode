package com.playnode.game_service.service;

import com.playnode.game_service.entity.ComponenteEdge;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.repository.ComponenteEdgeRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LocaleEdgeService {

    private final LocaleRepository localeRepository;
    private final ComponenteEdgeRepository componenteEdgeRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LocaleEdgeService(LocaleRepository localeRepository,
            ComponenteEdgeRepository componenteEdgeRepository) {
        this.localeRepository = localeRepository;
        this.componenteEdgeRepository = componenteEdgeRepository;
    }

    @Transactional
    public Optional<String> cambiaPasswordEdge(Long localeId, String nuovaPassword) {
        if (nuovaPassword == null || nuovaPassword.length() < 8) {
            throw new IllegalArgumentException("La password edge deve avere almeno 8 caratteri.");
        }
        Optional<Locale> op = localeRepository.findById(localeId);
        if (op.isEmpty()) {
            return Optional.empty();
        }
        Locale locale = op.get();
        locale.setEdgePassword(passwordEncoder.encode(nuovaPassword));
        localeRepository.save(locale);
        return Optional.of("Password edge aggiornata.");
    }

    @Transactional
    public Optional<String> rigeneraTokenApi(Long localeId) {
        Optional<Locale> op = localeRepository.findById(localeId);
        if (op.isEmpty()) {
            return Optional.empty();
        }
        Locale locale = op.get();
        String token = UUID.randomUUID().toString().replace("-", "");
        locale.setEdgeApiToken(token);
        localeRepository.save(locale);
        return Optional.of(token);
    }

    @Transactional
    public boolean disconnettiLocale(Long localeId) {
        if (!localeRepository.existsById(localeId)) {
            return false;
        }
        List<ComponenteEdge> edges = componenteEdgeRepository.findByLocaleId(localeId);
        for (ComponenteEdge edge : edges) {
            edge.setStato("Offline");
            componenteEdgeRepository.save(edge);
        }
        return true;
    }
}
