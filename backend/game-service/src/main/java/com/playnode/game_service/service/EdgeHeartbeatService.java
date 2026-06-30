package com.playnode.game_service.service;

import com.playnode.game_service.entity.ComponenteEdge;
import com.playnode.game_service.repository.ComponenteEdgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EdgeHeartbeatService {

    private final ComponenteEdgeRepository componenteEdgeRepository;

    public EdgeHeartbeatService(ComponenteEdgeRepository componenteEdgeRepository) {
        this.componenteEdgeRepository = componenteEdgeRepository;
    }

    @Transactional
    public boolean registraHeartbeat(Long componenteEdgeId) {
        Optional<ComponenteEdge> op = componenteEdgeRepository.findById(componenteEdgeId);
        if (op.isEmpty()) {
            return false;
        }
        ComponenteEdge edge = op.get();
        edge.setStato("Online");
        edge.setUltimoHeartbeat(LocalDateTime.now());
        componenteEdgeRepository.save(edge);
        return true;
    }

    @Transactional
    public void marcaOfflineScaduti(int timeoutSeconds) {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(timeoutSeconds);
        for (ComponenteEdge edge : componenteEdgeRepository.findAll()) {
            if ("Online".equalsIgnoreCase(edge.getStato())
                    && (edge.getUltimoHeartbeat() == null || edge.getUltimoHeartbeat().isBefore(cutoff))) {
                edge.setStato("Offline");
                componenteEdgeRepository.save(edge);
            }
        }
    }
}
