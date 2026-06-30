package com.playnode.tournament_service.service;

import com.playnode.tournament_service.dto.IncontroTorneoDTO;
import com.playnode.tournament_service.dto.TorneoDTO;
import com.playnode.tournament_service.dto.TorneoDettaglioDTO;
import com.playnode.tournament_service.entity.IncontroTorneo;
import com.playnode.tournament_service.entity.IscrizioneTorneo;
import com.playnode.tournament_service.entity.PartecipaRef;
import com.playnode.tournament_service.entity.Torneo;
import com.playnode.tournament_service.repository.IncontroTorneoRepository;
import com.playnode.tournament_service.repository.IscrizioneTorneoRepository;
import com.playnode.tournament_service.repository.PartecipaRefRepository;
import com.playnode.tournament_service.repository.TorneoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class TorneoTabelloneService {

    private final TorneoRepository torneoRepository;
    private final IscrizioneTorneoRepository iscrizioneRepository;
    private final IncontroTorneoRepository incontroRepository;
    private final PartecipaRefRepository partecipaRefRepository;
    private final TorneoService torneoService;

    public TorneoTabelloneService(TorneoRepository torneoRepository,
            IscrizioneTorneoRepository iscrizioneRepository,
            IncontroTorneoRepository incontroRepository,
            PartecipaRefRepository partecipaRefRepository,
            TorneoService torneoService) {
        this.torneoRepository = torneoRepository;
        this.iscrizioneRepository = iscrizioneRepository;
        this.incontroRepository = incontroRepository;
        this.partecipaRefRepository = partecipaRefRepository;
        this.torneoService = torneoService;
    }

    public Optional<TorneoDettaglioDTO> dettaglio(Long torneoId, Long utenteCorrenteId) {
        TorneoDTO base = torneoService.ottieniTorneoPerId(torneoId);
        if (base == null) {
            return Optional.empty();
        }
        TorneoDettaglioDTO dto = new TorneoDettaglioDTO();
        copiaTorneo(base, dto);
        List<Long> iscritti = iscrizioneRepository.findByIdTorneoOrderByDataIscrizioneAsc(torneoId).stream()
                .map(IscrizioneTorneo::getIdUtente)
                .toList();
        dto.setIscrittiIds(new ArrayList<>(iscritti));
        dto.setIncontri(incontroRepository.findByIdTorneoOrderByRoundNumAscSlotNumAsc(torneoId).stream()
                .map(this::toIncontroDto)
                .toList());
        if (utenteCorrenteId != null) {
            dto.setIscrittoUtenteCorrente(
                    iscrizioneRepository.existsByIdTorneoAndIdUtente(torneoId, utenteCorrenteId));
        }
        return Optional.of(dto);
    }

    @Transactional
    public boolean iscrivi(Long torneoId, Long utenteId) {
        Torneo torneo = torneoRepository.findById(torneoId).orElse(null);
        if (torneo == null) {
            return false;
        }
        if (isTerminato(torneo)) {
            throw new IllegalStateException("Il torneo è già terminato.");
        }
        if (iscrizioneRepository.existsByIdTorneoAndIdUtente(torneoId, utenteId)) {
            throw new IllegalStateException("Sei già iscritto a questo torneo.");
        }
        IscrizioneTorneo iscrizione = new IscrizioneTorneo();
        iscrizione.setIdTorneo(torneoId);
        iscrizione.setIdUtente(utenteId);
        iscrizione.setDataIscrizione(LocalDateTime.now());
        iscrizioneRepository.save(iscrizione);
        if ("Da definire".equalsIgnoreCase(torneo.getClassifica())) {
            torneo.setClassifica("In corso");
            torneoRepository.save(torneo);
        }
        return true;
    }

    @Transactional
    public boolean disiscrivi(Long torneoId, Long utenteId) {
        if (!iscrizioneRepository.existsByIdTorneoAndIdUtente(torneoId, utenteId)) {
            return false;
        }
        iscrizioneRepository.deleteById(new com.playnode.tournament_service.entity.IscrizioneTorneoId(torneoId, utenteId));
        return true;
    }

    @Transactional
    public List<IncontroTorneoDTO> generaTabellone(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new IllegalArgumentException("Torneo non trovato"));
        if (isTerminato(torneo)) {
            throw new IllegalStateException("Impossibile generare il tabellone: torneo terminato.");
        }
        List<Long> iscritti = iscrizioneRepository.findByIdTorneoOrderByDataIscrizioneAsc(torneoId).stream()
                .map(IscrizioneTorneo::getIdUtente)
                .toList();
        if (iscritti.size() < 2) {
            throw new IllegalStateException("Servono almeno 2 iscritti per generare il tabellone.");
        }
        incontroRepository.deleteByIdTorneo(torneoId);

        int slot = 0;
        for (int i = 0; i < iscritti.size(); i += 2) {
            IncontroTorneo incontro = new IncontroTorneo();
            incontro.setIdTorneo(torneoId);
            incontro.setRoundNum(1);
            incontro.setSlotNum(slot++);
            incontro.setGiocatore1Id(iscritti.get(i));
            if (i + 1 < iscritti.size()) {
                incontro.setGiocatore2Id(iscritti.get(i + 1));
            } else {
                incontro.setVincitoreId(iscritti.get(i));
            }
            incontroRepository.save(incontro);
        }
        torneo.setClassifica("In corso");
        torneoRepository.save(torneo);
        return incontroRepository.findByIdTorneoOrderByRoundNumAscSlotNumAsc(torneoId).stream()
                .map(this::toIncontroDto)
                .toList();
    }

    @Transactional
    public void collegaPartita(Long incontroId, Long partitaId) {
        IncontroTorneo incontro = incontroRepository.findById(incontroId)
                .orElseThrow(() -> new IllegalArgumentException("Incontro non trovato"));
        incontro.setIdPartita(partitaId);
        incontroRepository.save(incontro);
    }

    @Transactional
    public boolean avanzaDaPartita(Long partitaId) {
        Optional<IncontroTorneo> incontroOp = incontroRepository.findByIdPartita(partitaId);
        if (incontroOp.isEmpty()) {
            return false;
        }
        IncontroTorneo incontro = incontroOp.get();
        if (incontro.getVincitoreId() != null) {
            return true;
        }

        Long vincitore = determinaVincitore(partitaId, incontro);
        if (vincitore == null) {
            return false;
        }
        incontro.setVincitoreId(vincitore);
        incontroRepository.save(incontro);

        Long torneoId = incontro.getIdTorneo();
        int round = incontro.getRoundNum();
        int pending = incontroRepository.countByIdTorneoAndRoundNumAndVincitoreIdIsNull(torneoId, round);
        if (pending > 0) {
            return true;
        }

        List<IncontroTorneo> roundCompletato = incontroRepository.findByIdTorneoAndRoundNumOrderBySlotNumAsc(torneoId, round);
        List<Long> vincitori = roundCompletato.stream()
                .map(IncontroTorneo::getVincitoreId)
                .filter(id -> id != null)
                .toList();

        if (vincitori.size() <= 1) {
            Torneo torneo = torneoRepository.findById(torneoId).orElse(null);
            if (torneo != null && vincitori.size() == 1) {
                torneo.setClassifica("Terminato — Vincitore utente #" + vincitori.get(0));
                torneoRepository.save(torneo);
            }
            return true;
        }

        int nextRound = round + 1;
        int slot = 0;
        for (int i = 0; i < vincitori.size(); i += 2) {
            IncontroTorneo next = new IncontroTorneo();
            next.setIdTorneo(torneoId);
            next.setRoundNum(nextRound);
            next.setSlotNum(slot++);
            next.setGiocatore1Id(vincitori.get(i));
            if (i + 1 < vincitori.size()) {
                next.setGiocatore2Id(vincitori.get(i + 1));
            } else {
                next.setVincitoreId(vincitori.get(i));
            }
            incontroRepository.save(next);
        }
        return true;
    }

    private Long determinaVincitore(Long partitaId, IncontroTorneo incontro) {
        if (incontro.getGiocatore2Id() == null) {
            return incontro.getGiocatore1Id();
        }
        List<PartecipaRef> partecipazioni = partecipaRefRepository.findByPartitaIdAndGiocatoreIdIsNotNull(partitaId);
        int score1 = punteggio(partecipazioni, incontro.getGiocatore1Id());
        int score2 = punteggio(partecipazioni, incontro.getGiocatore2Id());
        if (score1 > score2) {
            return incontro.getGiocatore1Id();
        }
        if (score2 > score1) {
            return incontro.getGiocatore2Id();
        }
        Optional<PartecipaRef> vittoria = partecipazioni.stream()
                .filter(p -> Boolean.TRUE.equals(p.getVittoria()))
                .findFirst();
        if (vittoria.isPresent() && vittoria.get().getGiocatoreId() != null) {
            return vittoria.get().getGiocatoreId();
        }
        return incontro.getGiocatore1Id();
    }

    private int punteggio(List<PartecipaRef> partecipazioni, Long giocatoreId) {
        return partecipazioni.stream()
                .filter(p -> giocatoreId.equals(p.getGiocatoreId()))
                .map(PartecipaRef::getPunteggioFinale)
                .findFirst()
                .orElse(0);
    }

    private boolean isTerminato(Torneo torneo) {
        String c = torneo.getClassifica();
        return c != null && c.toLowerCase().contains("terminat");
    }

    private IncontroTorneoDTO toIncontroDto(IncontroTorneo i) {
        IncontroTorneoDTO dto = new IncontroTorneoDTO();
        dto.setId(i.getIdIncontro());
        dto.setRound(i.getRoundNum());
        dto.setSlot(i.getSlotNum());
        dto.setGiocatore1Id(i.getGiocatore1Id());
        dto.setGiocatore2Id(i.getGiocatore2Id());
        dto.setVincitoreId(i.getVincitoreId());
        dto.setPartitaId(i.getIdPartita());
        return dto;
    }

    private void copiaTorneo(TorneoDTO src, TorneoDettaglioDTO dst) {
        dst.setId(src.getId());
        dst.setNome(src.getNome());
        dst.setModalita(src.getModalita());
        dst.setRegole(src.getRegole());
        dst.setIdTipologiaGioco(src.getIdTipologiaGioco());
        dst.setDataInizio(src.getDataInizio());
        dst.setDataFine(src.getDataFine());
        dst.setClassifica(src.getClassifica());
        dst.setLocaliIds(src.getLocaliIds());
    }
}
