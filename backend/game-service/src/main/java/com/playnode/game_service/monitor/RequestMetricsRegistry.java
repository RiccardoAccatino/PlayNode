package com.playnode.game_service.monitor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;

public final class RequestMetricsRegistry {

    private static final int MAX_SAMPLES_PER_ENDPOINT = 200;
    private static final Pattern ID_SEGMENT = Pattern.compile("/\\d+");

    private static final ConcurrentHashMap<String, CopyOnWriteArrayList<Long>> SAMPLES = new ConcurrentHashMap<>();

    private RequestMetricsRegistry() {
    }

    public static void record(String rawPath, long durationMs) {
        if (rawPath == null || rawPath.isBlank() || rawPath.startsWith("/actuator")) {
            return;
        }
        String key = normalizePath(rawPath);
        CopyOnWriteArrayList<Long> bucket = SAMPLES.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());
        bucket.add(durationMs);
        while (bucket.size() > MAX_SAMPLES_PER_ENDPOINT) {
            bucket.remove(0);
        }
    }

    public static List<Map<String, Object>> getLatencies() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map.Entry<String, CopyOnWriteArrayList<Long>> entry : SAMPLES.entrySet()) {
            List<Long> values = new ArrayList<>(entry.getValue());
            if (values.isEmpty()) {
                continue;
            }
            Collections.sort(values);
            long p50 = values.get(values.size() / 2);
            Map<String, Object> row = new HashMap<>();
            row.put("ep", entry.getKey());
            row.put("ms", p50);
            row.put("p50", p50);
            row.put("ok", p50 < 300);
            out.add(row);
        }
        out.sort(Comparator.comparing(m -> (String) m.get("ep")));
        return out;
    }

    public static long getTotalSamplesLastWindow() {
        return SAMPLES.values().stream().mapToLong(List::size).sum();
    }

    private static String normalizePath(String path) {
        String normalized = ID_SEGMENT.matcher(path).replaceAll("/{id}");
        if (normalized.startsWith("/api")) {
            return normalized;
        }
        return "/api" + normalized;
    }
}
