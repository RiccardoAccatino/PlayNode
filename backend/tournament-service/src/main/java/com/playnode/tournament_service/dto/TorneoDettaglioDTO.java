package com.playnode.tournament_service.dto;

import java.util.ArrayList;
import java.util.List;

public class TorneoDettaglioDTO extends TorneoDTO {
    private List<Long> iscrittiIds = new ArrayList<>();
    private List<IncontroTorneoDTO> incontri = new ArrayList<>();
    private boolean iscrittoUtenteCorrente;

    public List<Long> getIscrittiIds() {
        return iscrittiIds;
    }

    public void setIscrittiIds(List<Long> iscrittiIds) {
        this.iscrittiIds = iscrittiIds;
    }

    public List<IncontroTorneoDTO> getIncontri() {
        return incontri;
    }

    public void setIncontri(List<IncontroTorneoDTO> incontri) {
        this.incontri = incontri;
    }

    public boolean isIscrittoUtenteCorrente() {
        return iscrittoUtenteCorrente;
    }

    public void setIscrittoUtenteCorrente(boolean iscrittoUtenteCorrente) {
        this.iscrittoUtenteCorrente = iscrittoUtenteCorrente;
    }
}
