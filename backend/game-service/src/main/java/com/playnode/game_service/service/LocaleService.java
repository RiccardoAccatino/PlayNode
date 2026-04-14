package com.playnode.game_service.service;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LocaleService {

    // TODO: In futuro inietteremo i Repository di Angie per Locali e GiochiInstallati

    public List<LocaleDTO> ottieniTuttiILocali() {
        // TODO: Recuperare la lista dei locali dal DB
        return new ArrayList<>(); // Restituisce lista vuota per ora
    }

    public List<GiocoInstallatoDTO> ottieniGiochiPerLocale(Long idLocale) {
        // TODO: Recuperare dal DB tutti i giochi filtrati per idLocale
        return new ArrayList<>(); // Restituisce lista vuota per ora
    }
}