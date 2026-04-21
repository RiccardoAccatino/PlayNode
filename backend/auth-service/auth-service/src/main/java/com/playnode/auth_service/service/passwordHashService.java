package com.playnode.auth_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class passwordHashService {


    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Hashizza una password con BCrypt
     * @param rawPassword la password in chiaro
     * @return la password hashata
     */
    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}