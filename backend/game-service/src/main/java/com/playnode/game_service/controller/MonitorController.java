package com.playnode.game_service.controller;

import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.repository.EventoIotRepository;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.PartitaRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        Map<String, Object> m = new HashMap<>();

        long gamesInstalled = giocoRepo.count();
        long totalPartite = partitaRepo.count();
        long totalLocali = localeRepo.count();

        // live partite (in-memory scan)
        long live = partitaRepo.findAll().stream()
                .filter(p -> {
                    try {
                        return "IN_CORSO".equalsIgnoreCase((String) p.getClass().getMethod("getStato").invoke(p));
                    } catch (Exception ex) {
                        return false;
                    }
                }).count();

        // mqtt events in last minute
        LocalDateTime since = LocalDateTime.now().minusMinutes(1);
        long mqttLastMin = eventoRepo.findAll().stream()
                .filter(e -> e.getTimestampEvento() != null && e.getTimestampEvento().isAfter(since))
                .count();

        // simple synthetic API/service counts
        int apisCount = 12;
        int servicesCount = 6;

        m.put("gamesInstalled", gamesInstalled);
        m.put("totalPartite", totalPartite);
        m.put("livePartite", live);
        m.put("totalLocali", totalLocali);
        m.put("mqttEventsLastMinute", mqttLastMin);
        m.put("apisCount", apisCount);
        m.put("servicesCount", servicesCount);
        m.put("reqPerMin", Math.max(0, mqttLastMin + (int) live * 2));

        return m;
    }

    @GetMapping("/latencies")
    public List<Map<String, Object>> latencies() {
        // synthesize latency values for common endpoints
        List<String> eps = Arrays.asList("/api/partite", "/api/sensori", "/api/locali", "/api/tipologie-gioco",
                "/api/iot/partita/{id}");
        Random r = new Random();
        return eps.stream().map(ep -> {
            Map<String, Object> mm = new HashMap<>();
            mm.put("ep", ep);
            int ms = 10 + r.nextInt(120);
            mm.put("ms", ms);
            mm.put("p50", ms);
            mm.put("ok", ms < 300);
            return mm;
        }).collect(Collectors.toList());
    }

    @GetMapping("/logs")
    public List<Map<String, String>> logs() {
        // build recent logs from latest EventoIot entries (fallback synthetic if none)
        List<EventoIot> ev = eventoRepo.findAll();
        List<EventoIot> recent = ev.stream()
                .sorted(Comparator.comparing(EventoIot::getTimestampEvento,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .collect(Collectors.toList());

        if (recent.isEmpty()) {
            return Arrays.asList(
                    mkLog("INFO", "game-service", "Avvio servizio game-service"),
                    mkLog("INFO", "auth-service", "Token refreshed"),
                    mkLog("WARN", "edge-sync", "Edge LOC-004 in ritardo"));
        }

        return recent.stream().map(e -> {
            Map<String, String> mm = new HashMap<>();
            mm.put("t", e.getTimestampEvento() != null ? e.getTimestampEvento().toString() : "?");
            mm.put("type", "INFO");
            mm.put("msg", "IoT event: " + (e.getValore() != null ? e.getValore() : "-") + " (sensore:"
                    + e.getSensoreId() + ")");
            mm.put("svc", "mqtt-broker");
            return mm;
        }).collect(Collectors.toList());
    }

    private Map<String, String> mkLog(String type, String svc, String msg) {
        Map<String, String> m = new HashMap<>();
        m.put("t", LocalDateTime.now().toString());
        m.put("type", type);
        m.put("msg", msg);
        m.put("svc", svc);
        return m;
    }
}
