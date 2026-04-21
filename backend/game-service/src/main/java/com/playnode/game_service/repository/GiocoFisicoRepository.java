package com.playnode.game_service.repository;

import com.playnode.game_service.entity.GiocoFisico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GiocoFisicoRepository extends JpaRepository<GiocoFisico, Long> {
    // Questo metodo magico trova tutti i giochi usando l'ID del locale!
    List<GiocoFisico> findByLocaleId(Long localeId);
}