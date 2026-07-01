package com.playnode.game_service.repository;

import com.playnode.game_service.entity.ComponenteEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponenteEdgeRepository extends JpaRepository<ComponenteEdge, Long> {
    List<ComponenteEdge> findByLocaleId(Long localeId);
}
