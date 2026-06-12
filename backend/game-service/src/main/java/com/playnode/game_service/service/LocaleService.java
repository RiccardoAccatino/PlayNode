package com.playnode.game_service.service;

import com.playnode.game_service.dto.GiocoInstallatoDTO;
import com.playnode.game_service.dto.LocaleDTO;
import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.entity.Partita;
import com.playnode.game_service.entity.TipologiaGioco;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import com.playnode.game_service.repository.PartitaRepository;
import com.playnode.game_service.repository.SensoreRepository;
import com.playnode.game_service.repository.TipologiaGiocoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class LocaleService {

    private final LocaleRepository localeRepository;
    private final GiocoFisicoRepository giocoFisicoRepository;
    private final TipologiaGiocoRepository tipologiaGiocoRepository;
    private final SensoreRepository sensoreRepository;
    private final PartitaRepository partitaRepository;

    public LocaleService(LocaleRepository localeRepository,
            GiocoFisicoRepository giocoFisicoRepository,
            TipologiaGiocoRepository tipologiaGiocoRepository,
            SensoreRepository sensoreRepository,
            PartitaRepository partitaRepository) {
        this.localeRepository = localeRepository;
        this.giocoFisicoRepository = giocoFisicoRepository;
        this.tipologiaGiocoRepository = tipologiaGiocoRepository;
        this.sensoreRepository = sensoreRepository;
        this.partitaRepository = partitaRepository;
    }

    public List<LocaleDTO> ottieniTuttiILocali() {
        List<LocaleDTO> localiDTO = new ArrayList<>();
        for (Locale locale : localeRepository.findAll()) {
            localiDTO.add(toDto(locale));
        }
        return localiDTO;
    }

    public LocaleDTO ottieniLocalePerId(Long id) {
        return localeRepository.findById(id).map(this::toDto).orElse(null);
    }

    public LocaleDTO creaLocale(LocaleDTO dto) {
        if (dto.getNome() == null || dto.getIndirizzo() == null
                || dto.getAccesso() == null || dto.getGestoreId() == null) {
            throw new IllegalArgumentException("nome, indirizzo, accesso e gestoreId sono obbligatori.");
        }
        Locale locale = new Locale();
        locale.setNome(dto.getNome().trim());
        locale.setIndirizzo(dto.getIndirizzo().trim());
        locale.setAccesso(dto.getAccesso());
        locale.setGestoreId(dto.getGestoreId());
        return toDto(localeRepository.save(locale));
    }

    public LocaleDTO aggiornaLocale(Long id, LocaleDTO dto) {
        Optional<Locale> op = localeRepository.findById(id);
        if (op.isEmpty())
            return null;

        Locale locale = op.get();
        if (dto.getNome() != null && !dto.getNome().isBlank())
            locale.setNome(dto.getNome().trim());
        if (dto.getIndirizzo() != null && !dto.getIndirizzo().isBlank())
            locale.setIndirizzo(dto.getIndirizzo().trim());
        if (dto.getAccesso() != null)
            locale.setAccesso(dto.getAccesso());
        if (dto.getGestoreId() != null)
            locale.setGestoreId(dto.getGestoreId());

        return toDto(localeRepository.save(locale));
    }

    public boolean eliminaLocale(Long id) {
        if (!localeRepository.existsById(id))
            return false;
        localeRepository.deleteById(id);
        return true;
    }

    private LocaleDTO toDto(Locale locale) {
        LocaleDTO dto = new LocaleDTO();
        dto.setId(locale.getIdLocale());
        dto.setNome(locale.getNome());
        dto.setIndirizzo(locale.getIndirizzo());
        dto.setAccesso(locale.getAccesso());
        dto.setGestoreId(locale.getGestoreId());
        return dto;
    }

    public List<GiocoInstallatoDTO> ottieniGiochiPerLocale(Long idLocale) {
        List<GiocoFisico> giochiDalDatabase = giocoFisicoRepository.findByLocaleId(idLocale);
        List<GiocoInstallatoDTO> giochiDTO = new ArrayList<>();

        Set<Long> giochiInUso = new HashSet<>();
        for (Partita partita : partitaRepository.findAll()) {
            if (partita.getTimestampFine() == null && partita.getGiocoFisicoId() != null) {
                giochiInUso.add(partita.getGiocoFisicoId());
            }
        }

        for (GiocoFisico gioco : giochiDalDatabase) {
            GiocoInstallatoDTO dto = new GiocoInstallatoDTO();
            dto.setId(gioco.getIdGiocoFisico());
            dto.setIdLocale(gioco.getLocaleId());
            dto.setTipologiaId(gioco.getTipologiaGiocoId());

            String nomeTipologia = "Gioco";
            if (gioco.getTipologiaGiocoId() != null) {
                Optional<TipologiaGioco> tipologia = tipologiaGiocoRepository.findById(gioco.getTipologiaGiocoId());
                if (tipologia.isPresent()) {
                    nomeTipologia = tipologia.get().getNomeTipologiaGioco();
                }
            }
            dto.setTipoGioco(nomeTipologia);

            dto.setStato(giochiInUso.contains(gioco.getIdGiocoFisico()) ? "IN_USO" : "LIBERO");
            dto.setNumSensori(sensoreRepository.findByGiocoFisicoIdGiocoFisico(gioco.getIdGiocoFisico()).size());

            giochiDTO.add(dto);
        }
        return giochiDTO;
    }
}
