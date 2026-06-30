package com.playnode.game_service.dto;

import java.util.ArrayList;
import java.util.List;

public class StatisticaLocaleDTO {
    private Long localeId;
    private long partiteMeseCorrente;
    private long partiteMesePrecedente;
    private double variazionePercentualeMese;
    private String giocoPiuUsato;
    private String oraPunta;
    private long giocatoriUniciMese;
    private List<UtilizzoGiocoDTO> utilizzoPerGioco = new ArrayList<>();

    public static class UtilizzoGiocoDTO {
        private String nomeGioco;
        private long partite;
        private int percentuale;

        public UtilizzoGiocoDTO() {
        }

        public UtilizzoGiocoDTO(String nomeGioco, long partite, int percentuale) {
            this.nomeGioco = nomeGioco;
            this.partite = partite;
            this.percentuale = percentuale;
        }

        public String getNomeGioco() {
            return nomeGioco;
        }

        public void setNomeGioco(String nomeGioco) {
            this.nomeGioco = nomeGioco;
        }

        public long getPartite() {
            return partite;
        }

        public void setPartite(long partite) {
            this.partite = partite;
        }

        public int getPercentuale() {
            return percentuale;
        }

        public void setPercentuale(int percentuale) {
            this.percentuale = percentuale;
        }
    }

    public Long getLocaleId() {
        return localeId;
    }

    public void setLocaleId(Long localeId) {
        this.localeId = localeId;
    }

    public long getPartiteMeseCorrente() {
        return partiteMeseCorrente;
    }

    public void setPartiteMeseCorrente(long partiteMeseCorrente) {
        this.partiteMeseCorrente = partiteMeseCorrente;
    }

    public long getPartiteMesePrecedente() {
        return partiteMesePrecedente;
    }

    public void setPartiteMesePrecedente(long partiteMesePrecedente) {
        this.partiteMesePrecedente = partiteMesePrecedente;
    }

    public double getVariazionePercentualeMese() {
        return variazionePercentualeMese;
    }

    public void setVariazionePercentualeMese(double variazionePercentualeMese) {
        this.variazionePercentualeMese = variazionePercentualeMese;
    }

    public String getGiocoPiuUsato() {
        return giocoPiuUsato;
    }

    public void setGiocoPiuUsato(String giocoPiuUsato) {
        this.giocoPiuUsato = giocoPiuUsato;
    }

    public String getOraPunta() {
        return oraPunta;
    }

    public void setOraPunta(String oraPunta) {
        this.oraPunta = oraPunta;
    }

    public long getGiocatoriUniciMese() {
        return giocatoriUniciMese;
    }

    public void setGiocatoriUniciMese(long giocatoriUniciMese) {
        this.giocatoriUniciMese = giocatoriUniciMese;
    }

    public List<UtilizzoGiocoDTO> getUtilizzoPerGioco() {
        return utilizzoPerGioco;
    }

    public void setUtilizzoPerGioco(List<UtilizzoGiocoDTO> utilizzoPerGioco) {
        this.utilizzoPerGioco = utilizzoPerGioco;
    }
}
