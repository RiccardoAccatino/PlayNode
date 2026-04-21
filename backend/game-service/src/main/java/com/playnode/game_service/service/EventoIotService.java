package com.playnode.game_service.service;

import com.playnode.game_service.entity.EventoIot;
import com.playnode.game_service.repository.EventoIotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventoIotService {

    private final EventoIotRepository eventoIotRepository;

    public EventoIotService(EventoIotRepository eventoIotRepository) {
        this.eventoIotRepository = eventoIotRepository;
    }

    // Metodo chiamato dall'API per salvare un nuovo dato dal sensore
    public EventoIot registraEvento(Long idPartita, Long idSensore, String valore) {
        EventoIot nuovoEvento = new EventoIot();
        nuovoEvento.setPartitaId(idPartita);
        nuovoEvento.setSensoreId(idSensore);
        nuovoEvento.setValore(valore);
        nuovoEvento.setTimestampEvento(LocalDateTime.now()); // Registriamo l'istante esatto

        return eventoIotRepository.save(nuovoEvento);
    }

    // Metodo per leggere tutti gli eventi di una partita (es. per calcolare le statistiche o fare il replay)
    public List<EventoIot> ottieniEventiPartita(Long idPartita) {
        return eventoIotRepository.findByPartitaIdOrderByTimestampEventoAsc(idPartita);
    }
}