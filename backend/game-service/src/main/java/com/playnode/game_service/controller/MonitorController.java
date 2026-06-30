package com.playnode.game_service.controller;

import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.repository.EventoIotRepository;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.PartitaRepository;
import com.playnode.game_service.repository.LocaleRepository;
import com.playnode.game_service.monitor.RequestMetricsRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitor")
public class MonitorController {

    @Autowired
    private GiocoFisicoRepository giocoRepo;

    @Autowired
    private PartitaRepository partitaRepo;

    @Autowired
    private LocaleRepository localeRepo;

    @Autowired
    private EventoIotRepository eventoRepo;

    @Autowired
    private RequestMappingHandlerMapping handlerMapping;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public Map<String, Object> summary() {
        Map<String, Object> m = new HashMap<>();

        long gamesInstalled = giocoRepo.count();
        long totalPartite = partitaRepo.count();
        long totalLocali = localeRepo.count();

        long live = partitaRepo.findAll().stream()
                .filter(p -> p.getTimestampFine() == null)
                .count();

        LocalDateTime since = LocalDateTime.now().minusMinutes(1);
        long mqttLastMin = eventoRepo.findAll().stream()
                .filter(e -> e.getTimestampEvento() != null && e.getTimestampEvento().isAfter(since))
                .count();

        int apisCount = handlerMapping.getHandlerMethods().size();
        int servicesCount = 4;

        m.put("gamesInstalled", gamesInstalled);
        m.put("totalPartite", totalPartite);
        m.put("livePartite", live);
        m.put("totalLocali", totalLocali);
        m.put("mqttEventsLastMinute", mqttLastMin);
        m.put("apisCount", apisCount);
        m.put("servicesCount", servicesCount);
        m.put("reqPerMin", mqttLastMin + RequestMetricsRegistry.getTotalSamplesLastWindow());

        return m;
    }

    @GetMapping("/latencies")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public List<Map<String, Object>> latencies() {
        return RequestMetricsRegistry.getLatencies();
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMINGIOCO','ADMINPIATTAFORMA')")
    public List<Map<String, String>> logs() {
        List<EventoIot> recent = eventoRepo.findAll().stream()
                .sorted(Comparator.comparing(EventoIot::getTimestampEvento,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .collect(Collectors.toList());

        return recent.stream().map(e -> {
            Map<String, String> mm = new HashMap<>();
            mm.put("t", e.getTimestampEvento() != null ? e.getTimestampEvento().toString() : "?");
            mm.put("type", "INFO");
            mm.put("msg", "IoT event: " + (e.getValore() != null ? e.getValore() : "-") + " (sensore:"
                    + e.getSensoreId() + ")");
            mm.put("svc", "game-service");
            return mm;
        }).collect(Collectors.toList());
    }
}
