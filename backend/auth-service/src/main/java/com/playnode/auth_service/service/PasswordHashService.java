package com.playnode.auth_service.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordHashService {


    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Hashizza una password con BCrypt
     * @param rawPassword la password in chiaro
     * @return la password hashata
     */
    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Verifica se una password in chiaro corrisponde all'hash
     * @param rawPassword la password in chiaro
     * @param encodedPassword l'hash salvato sul database
     * @return true se corrispondono, false altrimenti
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}