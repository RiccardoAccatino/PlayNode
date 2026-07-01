package com.playnode.game_service.service;

import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TipologiaGiocoService {

    @Autowired
    private TipologiaGiocoRepository repository;

    @Autowired
    private GiocoFisicoRepository giocoFisicoRepository;

    public List<TipologiaGioco> findAll() {
        return repository.findAll();
    }

    public TipologiaGioco save(TipologiaGioco tipologia) {
        return repository.save(tipologia);
    }

    public Optional<TipologiaGioco> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<TipologiaGioco> aggiorna(Long id, String nome, String descrizione, String regole) {
        Optional<TipologiaGioco> op = repository.findById(id);
        if (op.isEmpty()) {
            return Optional.empty();
        }
        TipologiaGioco t = op.get();
        if (nome != null && !nome.isBlank()) {
            t.setNomeTipologiaGioco(nome.trim());
        }
        if (descrizione != null && !descrizione.isBlank()) {
            t.setDescrizione(descrizione.trim());
        }
        if (regole != null && !regole.isBlank()) {
            t.setRegole(regole.trim());
        }
        return Optional.of(repository.save(t));
    }

    public boolean elimina(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        if (giocoFisicoRepository.existsByTipologiaGiocoId(id)) {
            throw new IllegalStateException("Impossibile eliminare: esistono giochi fisici installati per questa tipologia.");
        }
        repository.deleteById(id);
        return true;
    }
}
