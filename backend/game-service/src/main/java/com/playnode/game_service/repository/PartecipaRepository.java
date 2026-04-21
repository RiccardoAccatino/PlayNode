package com.playnode.game_service.repository;

import com.playnode.game_service.entity.Partecipa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartecipaRepository extends JpaRepository<Partecipa, Long> {

    // Un metodo magico: cerca la partecipazione sapendo a quale partita e a quale squadra si riferisce
    Optional<Partecipa> findByPartitaIdAndSquadraId(Long partitaId, Long squadraId);
}