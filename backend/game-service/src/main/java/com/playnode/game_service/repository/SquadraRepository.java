package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Squadra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SquadraRepository extends JpaRepository<Squadra, Long> {
    List<Squadra> findByIdTipologiaGioco(Long idTipologiaGioco);
}
