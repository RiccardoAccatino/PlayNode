package com.playnode.game_service.repository;

import com.playnode.game_service.entity.TipologiaGioco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipologiaGiocoRepository extends JpaRepository<TipologiaGioco, Long> {
}