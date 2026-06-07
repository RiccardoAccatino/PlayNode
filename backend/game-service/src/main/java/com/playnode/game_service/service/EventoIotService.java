package com.playnode.game_service.service;

import com.playnode.game_service.dto.EventoIotDTO;
import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.repository.EventoIotRepository;
import com.playnode.game_service.repository.SensoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventoIotService {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final EventoIotRepository eventoIotRepository;
    private final SensoreRepository sensoreRepository;

    public EventoIotService(EventoIotRepository eventoIotRepository,
                            SensoreRepository sensoreRepository) {
        this.eventoIotRepository = eventoIotRepository;
        this.sensoreRepository = sensoreRepository;
    }

    public EventoIotDTO registraEvento(Long idPartita, Long idSensore, String valore) {
        EventoIot nuovoEvento = new EventoIot();
        nuovoEvento.setPartitaId(idPartita);
        nuovoEvento.setSensoreId(risolviSensoreId(idSensore));
        nuovoEvento.setValore(valore);
        nuovoEvento.setTimestampEvento(LocalDateTime.now());

        return toDto(eventoIotRepository.save(nuovoEvento));
    }

    public List<EventoIotDTO> ottieniEventiPartita(Long idPartita) {
        return eventoIotRepository.findByPartitaIdOrderByTimestampEventoAsc(idPartita)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Evita violazioni FK: accetta solo ID sensore esistenti, altrimenti null
     * (consentito dallo schema — es. eventi manuali o goal da debug UI).
     */
    private Long risolviSensoreId(Long idSensore) {
        if (idSensore == null) {
            return null;
        }
        return sensoreRepository.existsById(idSensore) ? idSensore : null;
    }

    private EventoIotDTO toDto(EventoIot evento) {
        EventoIotDTO dto = new EventoIotDTO();
        dto.setId(evento.getIdEvento());
        dto.setIdPartita(evento.getPartitaId());
        dto.setIdSensore(evento.getSensoreId());
        dto.setValore(evento.getValore());
        if (evento.getTimestampEvento() != null) {
            dto.setTimestamp(evento.getTimestampEvento().format(ISO_FORMATTER));
        }
        return dto;
    }
}