package com.playnode.game_service.service;

import com.playnode.game_service.dto.StatisticaLocaleDTO;
import com.playnode.game_service.repository.LocaleRepository;
import com.playnode.game_service.repository.PartecipaRepository;
import com.playnode.game_service.repository.PartitaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StatisticaLocaleService {

    private final LocaleRepository localeRepository;
    private final PartitaRepository partitaRepository;
    private final PartecipaRepository partecipaRepository;

    public StatisticaLocaleService(LocaleRepository localeRepository,
            PartitaRepository partitaRepository,
            PartecipaRepository partecipaRepository) {
        this.localeRepository = localeRepository;
        this.partitaRepository = partitaRepository;
        this.partecipaRepository = partecipaRepository;
    }

    public Optional<StatisticaLocaleDTO> ottieniStatistichePerLocale(Long localeId) {
        if (!localeRepository.existsById(localeId)) {
            return Optional.empty();
        }

        LocalDate oggi = LocalDate.now();
        LocalDateTime inizioMese = oggi.withDayOfMonth(1).atStartOfDay();
        LocalDateTime inizioMesePrecedente = oggi.minusMonths(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime fineMesePrecedente = oggi.withDayOfMonth(1).atStartOfDay();

        long partiteMese = partitaRepository.countByLocaleBetween(localeId, inizioMese, oggi.plusDays(1).atStartOfDay());
        long partiteMesePrec = partitaRepository.countByLocaleBetween(localeId, inizioMesePrecedente, fineMesePrecedente);

        StatisticaLocaleDTO dto = new StatisticaLocaleDTO();
        dto.setLocaleId(localeId);
        dto.setPartiteMeseCorrente(partiteMese);
        dto.setPartiteMesePrecedente(partiteMesePrec);
        dto.setVariazionePercentualeMese(calcolaVariazione(partiteMese, partiteMesePrec));

        List<Object[]> giocoTop = partitaRepository.trovaGiocoPiuUsato(localeId);
        if (!giocoTop.isEmpty() && giocoTop.get(0)[0] != null) {
            dto.setGiocoPiuUsato((String) giocoTop.get(0)[0]);
        } else {
            dto.setGiocoPiuUsato("-");
        }

        List<Object[]> oraPunta = partitaRepository.trovaOraPunta(localeId);
        if (!oraPunta.isEmpty() && oraPunta.get(0)[0] != null) {
            int ora = ((Number) oraPunta.get(0)[0]).intValue();
            dto.setOraPunta(String.format("%02d:00", ora));
        } else {
            dto.setOraPunta("-");
        }

        dto.setGiocatoriUniciMese(partecipaRepository.countGiocatoriUniciByLocaleBetween(
                localeId, inizioMese, oggi.plusDays(1).atStartOfDay()));

        List<Object[]> perGioco = partitaRepository.conteggioPartitePerGioco(localeId);
        long totale = perGioco.stream().mapToLong(row -> ((Number) row[1]).longValue()).sum();
        List<StatisticaLocaleDTO.UtilizzoGiocoDTO> utilizzo = new ArrayList<>();
        for (Object[] row : perGioco) {
            String nome = (String) row[0];
            long cnt = ((Number) row[1]).longValue();
            int pct = totale > 0 ? (int) Math.round((cnt * 100.0) / totale) : 0;
            utilizzo.add(new StatisticaLocaleDTO.UtilizzoGiocoDTO(nome, cnt, pct));
        }
        dto.setUtilizzoPerGioco(utilizzo);
        return Optional.of(dto);
    }

    private double calcolaVariazione(long corrente, long precedente) {
        if (precedente == 0) {
            return corrente > 0 ? 100.0 : 0.0;
        }
        return Math.round(((corrente - precedente) * 100.0 / precedente) * 10.0) / 10.0;
    }
}
