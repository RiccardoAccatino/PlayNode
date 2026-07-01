package com.playnode.tournament_service.entity;

import java.io.Serializable;
import java.util.Objects;

public class IscrizioneTorneoId implements Serializable {
    private Long idTorneo;
    private Long idUtente;

    public IscrizioneTorneoId() {
    }

    public IscrizioneTorneoId(Long idTorneo, Long idUtente) {
        this.idTorneo = idTorneo;
        this.idUtente = idUtente;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IscrizioneTorneoId that = (IscrizioneTorneoId) o;
        return Objects.equals(idTorneo, that.idTorneo) && Objects.equals(idUtente, that.idUtente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idTorneo, idUtente);
    }
}
