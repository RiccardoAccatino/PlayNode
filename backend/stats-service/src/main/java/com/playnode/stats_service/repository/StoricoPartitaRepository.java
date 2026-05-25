package com.playnode.stats_service.repository;

import com.playnode.stats_service.entity.StoricoPartita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoricoPartitaRepository extends JpaRepository<StoricoPartita, Long> {

    // Questo metodo magico dice a Spring Boot di creare automaticamente una query
    // per trovare tutte le partite che corrispondono a un certo utenteId!
    List<StoricoPartita> findByUtenteId(Long utenteId);
}