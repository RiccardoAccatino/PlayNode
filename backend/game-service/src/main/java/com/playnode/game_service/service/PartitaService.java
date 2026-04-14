package com.playnode.game_service.service;

import main.java.com.playnode.game_service.dto.PartitaDTO;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class PartitaService {

    // TODO: Qui in futuro inietteremo il "PartitaRepository" di Angie

    public List<PartitaDTO> ottieniTutteLePartite() {
        // Ritorna una lista vuota in attesa del collegamento al DB
        return new ArrayList<>();
    }

    public PartitaDTO avviaNuovaPartita(Long idGiocoInstallato) {
        // TODO: In futuro qui salveremo la nuova partita nel DB tramite il Repository
        // Per ora restituiamo null (vuoto) per compilare correttamente
        return null;
    }
}