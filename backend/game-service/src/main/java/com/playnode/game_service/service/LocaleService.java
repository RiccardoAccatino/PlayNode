package com.playnode.game_service.service;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LocaleService {

    private final LocaleRepository localeRepository;
    private final GiocoFisicoRepository giocoFisicoRepository;

    // Iniezione delle dipendenze (Colleghiamo i magazzinieri)
    public LocaleService(LocaleRepository localeRepository, GiocoFisicoRepository giocoFisicoRepository) {
        this.localeRepository = localeRepository;
        this.giocoFisicoRepository = giocoFisicoRepository;
    }

    public List<LocaleDTO> ottieniTuttiILocali() {
        List<Locale> localiDalDatabase = localeRepository.findAll();
        List<LocaleDTO> localiDTO = new ArrayList<>();

        for (Locale locale : localiDalDatabase) {
            LocaleDTO dto = new LocaleDTO();
            dto.setId(locale.getIdLocale());
            dto.setNome(locale.getNome());
            dto.setIndirizzo(locale.getIndirizzo());
            localiDTO.add(dto);
        }
        return localiDTO;
    }

    public List<GiocoInstallatoDTO> ottieniGiochiPerLocale(Long idLocale) {
        List<GiocoFisico> giochiDalDatabase = giocoFisicoRepository.findByLocaleId(idLocale);
        List<GiocoInstallatoDTO> giochiDTO = new ArrayList<>();

        for (GiocoFisico gioco : giochiDalDatabase) {
            GiocoInstallatoDTO dto = new GiocoInstallatoDTO();
            dto.setId(gioco.getIdGiocoFisico());
            dto.setIdLocale(gioco.getLocaleId());
            dto.setTipoGioco("Gioco Fisico"); // Semplificato per ora
            dto.setStato("LIBERO");
            giochiDTO.add(dto);
        }
        return giochiDTO;
    }
}