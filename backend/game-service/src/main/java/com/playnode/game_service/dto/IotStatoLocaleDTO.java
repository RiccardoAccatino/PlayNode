package com.playnode.game_service.dto;

import java.util.ArrayList;
import java.util.List;

public class IotStatoLocaleDTO {
    private Long localeId;
    private String edgeStato;
    private String edgeAddress;
    private Long edgeId;
    private boolean brokerConnesso;
    private int topicAttivi;
    private long messaggiPerMinuto;
    private String piccoOra;
    private List<String> topicAttiviLista = new ArrayList<>();

    public Long getLocaleId() {
        return localeId;
    }

    public void setLocaleId(Long localeId) {
        this.localeId = localeId;
    }

    public String getEdgeStato() {
        return edgeStato;
    }

    public void setEdgeStato(String edgeStato) {
        this.edgeStato = edgeStato;
    }

    public String getEdgeAddress() {
        return edgeAddress;
    }

    public void setEdgeAddress(String edgeAddress) {
        this.edgeAddress = edgeAddress;
    }

    public Long getEdgeId() {
        return edgeId;
    }

    public void setEdgeId(Long edgeId) {
        this.edgeId = edgeId;
    }

    public boolean isBrokerConnesso() {
        return brokerConnesso;
    }

    public void setBrokerConnesso(boolean brokerConnesso) {
        this.brokerConnesso = brokerConnesso;
    }

    public int getTopicAttivi() {
        return topicAttivi;
    }

    public void setTopicAttivi(int topicAttivi) {
        this.topicAttivi = topicAttivi;
    }

    public long getMessaggiPerMinuto() {
        return messaggiPerMinuto;
    }

    public void setMessaggiPerMinuto(long messaggiPerMinuto) {
        this.messaggiPerMinuto = messaggiPerMinuto;
    }

    public String getPiccoOra() {
        return piccoOra;
    }

    public void setPiccoOra(String piccoOra) {
        this.piccoOra = piccoOra;
    }

    public List<String> getTopicAttiviLista() {
        return topicAttiviLista;
    }

    public void setTopicAttiviLista(List<String> topicAttiviLista) {
        this.topicAttiviLista = topicAttiviLista;
    }
}
