package com.playnode.auth_service.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class passwordVerifyService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Verifica se una password in chiaro corrisponde a quella hashata
     * @param rawPassword la password inserita dall'utente
     * @param hashedPassword la password hashata salvata nel database
     * @return true se corrisponde, false altrimenti
     */
    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}