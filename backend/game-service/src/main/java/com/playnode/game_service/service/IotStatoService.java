package com.playnode.game_service.service;

import com.playnode.game_service.dto.IotStatoLocaleDTO;
import com.playnode.game_service.entity.ComponenteEdge;
import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.entity.Sensore;
import com.playnode.game_service.repository.ComponenteEdgeRepository;
import com.playnode.game_service.repository.EventoIotRepository;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import com.playnode.game_service.repository.PartitaRepository;
import com.playnode.game_service.repository.SensoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class IotStatoService {

    private final LocaleRepository localeRepository;
    private final ComponenteEdgeRepository componenteEdgeRepository;
    private final GiocoFisicoRepository giocoFisicoRepository;
    private final SensoreRepository sensoreRepository;
    private final EventoIotRepository eventoIotRepository;
    private final PartitaRepository partitaRepository;

    public IotStatoService(LocaleRepository localeRepository,
            ComponenteEdgeRepository componenteEdgeRepository,
            GiocoFisicoRepository giocoFisicoRepository,
            SensoreRepository sensoreRepository,
            EventoIotRepository eventoIotRepository,
            PartitaRepository partitaRepository) {
        this.localeRepository = localeRepository;
        this.componenteEdgeRepository = componenteEdgeRepository;
        this.giocoFisicoRepository = giocoFisicoRepository;
        this.sensoreRepository = sensoreRepository;
        this.eventoIotRepository = eventoIotRepository;
        this.partitaRepository = partitaRepository;
    }

    public Optional<IotStatoLocaleDTO> ottieniStatoPerLocale(Long localeId) {
        Optional<Locale> localeOp = localeRepository.findById(localeId);
        if (localeOp.isEmpty()) {
            return Optional.empty();
        }

        Locale locale = localeOp.get();
        List<ComponenteEdge> edges = componenteEdgeRepository.findByLocaleId(localeId);
        List<GiocoFisico> giochi = giocoFisicoRepository.findByLocaleId(localeId);

        IotStatoLocaleDTO dto = new IotStatoLocaleDTO();
        dto.setLocaleId(localeId);

        ComponenteEdge principale = edges.stream()
                .filter(e -> "Online".equalsIgnoreCase(e.getStato()))
                .findFirst()
                .orElse(edges.isEmpty() ? null : edges.get(0));

        if (principale != null) {
            dto.setEdgeId(principale.getIdComponenteEdge());
            dto.setEdgeAddress(principale.getAddress());
            dto.setEdgeStato(principale.getStato());
        } else {
            dto.setEdgeStato("Offline");
        }

        boolean brokerConnesso = edges.stream()
                .anyMatch(e -> "Online".equalsIgnoreCase(e.getStato())
                        && e.getUltimoHeartbeat() != null
                        && e.getUltimoHeartbeat().isAfter(LocalDateTime.now().minusSeconds(90)))
                && locale.getHostBroker() != null && !locale.getHostBroker().isBlank();
        dto.setBrokerConnesso(brokerConnesso);

        LocalDateTime since = LocalDateTime.now().minusMinutes(1);
        dto.setMessaggiPerMinuto(eventoIotRepository.countByLocaleSince(localeId, since));

        List<Object[]> picco = partitaRepository.trovaPiccoEventiOggi(localeId);
        if (!picco.isEmpty() && picco.get(0)[0] != null) {
            int ora = ((Number) picco.get(0)[0]).intValue();
            dto.setPiccoOra(String.format("%02d:00", ora));
        } else {
            dto.setPiccoOra("-");
        }

        Set<String> topics = new LinkedHashSet<>();
        String slug = slugify(locale.getNome());
        topics.add("locale/" + slug + "/edge/status");

        for (GiocoFisico gioco : giochi) {
            topics.add("edge/gioco/" + gioco.getIdGiocoFisico() + "/comandi");
            List<Sensore> sensori = sensoreRepository.findByGiocoFisicoIdGiocoFisico(gioco.getIdGiocoFisico());
            for (Sensore sensore : sensori) {
                if (Boolean.TRUE.equals(sensore.getAttivo())) {
                    String pos = slugify(sensore.getPosizione());
                    topics.add("locale/" + slug + "/gioco/" + gioco.getIdGiocoFisico() + "/" + pos);
                }
            }
        }

        dto.setTopicAttiviLista(new ArrayList<>(topics));
        dto.setTopicAttivi(topics.size());
        return Optional.of(dto);
    }

    private String slugify(String value) {
        if (value == null || value.isBlank()) {
            return "locale";
        }
        return value.toLowerCase(java.util.Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
