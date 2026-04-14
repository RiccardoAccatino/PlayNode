package com.playnode.game_service.service;

import com.playnode.game_service.dto.PartitaDTO;
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

    // Metodo per aggiornare il punteggio di una partita
    public PartitaDTO aggiornaPunteggio(Long idPartita, int squadraCheHaSegnato) {
        // TODO: Recuperare la partita dal Database usando l'idPartita

        // TODO: Controllare quale squadra ha segnato (1 o 2) e aumentare il punteggio corrispondente
        /* Esempio di logica futura:
           if (squadraCheHaSegnato == 1) {
               partita.setPunteggio1(partita.getPunteggio1() + 1);
           } else if (squadraCheHaSegnato == 2) {
               partita.setPunteggio2(partita.getPunteggio2() + 1);
           }
        */

        // TODO: Salvare la partita aggiornata nel Database e restituirla

        // Per ora restituiamo null in attesa del collegamento al DB di Angie
        return null;
    }
    // Metodo per terminare una partita
    public PartitaDTO terminaPartita(Long idPartita) {
        // TODO: Recuperare la partita dal Database usando l'idPartita

        // TODO: Cambiare lo stato della partita in "TERMINATA"
        /* Esempio di logica futura:
           partita.setStato("TERMINATA");
        */

        // TODO: Salvare la partita aggiornata nel Database e restituirla

        // Per ora restituiamo null in attesa del DB
        return null;
    }
}