package com.playnode.game_service.service;

import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TipologiaGiocoService {

    @Autowired
    private TipologiaGiocoRepository repository;

    public List<TipologiaGioco> findAll() {
        return repository.findAll();
    }

    public TipologiaGioco save(TipologiaGioco tipologia) {
        return repository.save(tipologia);
    }
}