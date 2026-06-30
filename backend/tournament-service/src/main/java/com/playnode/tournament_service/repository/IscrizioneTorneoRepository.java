package com.playnode.tournament_service.repository;

import com.playnode.tournament_service.entity.IscrizioneTorneo;
import com.playnode.tournament_service.entity.IscrizioneTorneoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IscrizioneTorneoRepository extends JpaRepository<IscrizioneTorneo, IscrizioneTorneoId> {
    List<IscrizioneTorneo> findByIdTorneoOrderByDataIscrizioneAsc(Long idTorneo);

    boolean existsByIdTorneoAndIdUtente(Long idTorneo, Long idUtente);

    long countByIdTorneo(Long idTorneo);
}
