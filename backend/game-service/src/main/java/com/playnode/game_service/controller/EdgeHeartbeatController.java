package com.playnode.game_service.controller;

import com.playnode.game_service.service.EdgeHeartbeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/iot")
public class EdgeHeartbeatController {

    private final EdgeHeartbeatService edgeHeartbeatService;

    public EdgeHeartbeatController(EdgeHeartbeatService edgeHeartbeatService) {
        this.edgeHeartbeatService = edgeHeartbeatService;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@RequestParam Long idComponenteEdge) {
        return edgeHeartbeatService.registraHeartbeat(idComponenteEdge)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
