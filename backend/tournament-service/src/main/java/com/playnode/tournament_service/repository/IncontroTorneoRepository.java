package com.playnode.tournament_service.repository;

import com.playnode.tournament_service.entity.IncontroTorneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncontroTorneoRepository extends JpaRepository<IncontroTorneo, Long> {
    List<IncontroTorneo> findByIdTorneoOrderByRoundNumAscSlotNumAsc(Long idTorneo);

    List<IncontroTorneo> findByIdTorneoAndRoundNumOrderBySlotNumAsc(Long idTorneo, Integer roundNum);

    Optional<IncontroTorneo> findByIdPartita(Long idPartita);

    void deleteByIdTorneo(Long idTorneo);

    int countByIdTorneoAndRoundNumAndVincitoreIdIsNull(Long idTorneo, Integer roundNum);
}
