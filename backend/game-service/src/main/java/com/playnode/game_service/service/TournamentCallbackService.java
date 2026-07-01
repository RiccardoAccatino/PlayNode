package com.playnode.game_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class TournamentCallbackService {

    private static final Logger log = LoggerFactory.getLogger(TournamentCallbackService.class);

    private final RestTemplate restTemplate;
    private final String tournamentServiceUrl;

    public TournamentCallbackService(
            RestTemplate restTemplate,
            @Value("${tournament.service.url:http://localhost:8083}") String tournamentServiceUrl) {
        this.restTemplate = restTemplate;
        this.tournamentServiceUrl = tournamentServiceUrl;
    }

    public void notificaFinePartita(Long partitaId) {
        if (partitaId == null) {
            return;
        }
        String url = tournamentServiceUrl + "/api/tornei/interno/partite/" + partitaId + "/avanza";
        try {
            ResponseEntity<Void> response = restTemplate.postForEntity(url, null, Void.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("Avanzamento torneo non riuscito per partita {}: HTTP {}", partitaId, response.getStatusCode());
            }
        } catch (RestClientException ex) {
            log.warn("Impossibile notificare tournament-service per partita {}: {}", partitaId, ex.getMessage());
        }
    }

    public void collegaPartitaAIncontro(Long incontroId, Long partitaId) {
        if (incontroId == null || partitaId == null) {
            return;
        }
        String url = tournamentServiceUrl + "/api/tornei/interno/incontri/" + incontroId + "/collega-partita?partitaId=" + partitaId;
        try {
            restTemplate.postForEntity(url, null, Void.class);
        } catch (RestClientException ex) {
            log.warn("Impossibile collegare partita {} a incontro {}: {}", partitaId, incontroId, ex.getMessage());
        }
    }
}
