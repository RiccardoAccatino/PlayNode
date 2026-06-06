package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Sensore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensoreRepository extends JpaRepository<Sensore, Long> {
    List<Sensore> findByGiocoFisicoIdGiocoFisico(Long giocoFisicoId);

    // find all sensori for games that belong to a given tipologia
    // (tipologia_gioco.id)
    List<Sensore> findByGiocoFisicoTipologiaGiocoId(Long tipologiaGiocoId);
}