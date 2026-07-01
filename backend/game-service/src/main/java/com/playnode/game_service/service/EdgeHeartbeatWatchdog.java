package com.playnode.game_service.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EdgeHeartbeatWatchdog {

    private static final int TIMEOUT_SECONDS = 90;

    private final EdgeHeartbeatService edgeHeartbeatService;

    public EdgeHeartbeatWatchdog(EdgeHeartbeatService edgeHeartbeatService) {
        this.edgeHeartbeatService = edgeHeartbeatService;
    }

    @Scheduled(fixedDelay = 30000)
    public void controllaEdgeScaduti() {
        edgeHeartbeatService.marcaOfflineScaduti(TIMEOUT_SECONDS);
    }
}
