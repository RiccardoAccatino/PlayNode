package com.playnode.game_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configurazione CORS di livello superiore per il GAME-SERVICE.
 */
@Configuration
public class GlobalCorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permette l'invio del token JWT
        config.setAllowCredentials(true);

        // Accetta richieste da qualsiasi porta (compresa quella di IntelliJ / Frontend)
        config.addAllowedOriginPattern("*");

        // Accetta tutti gli header
        config.addAllowedHeader("*");

        // Accetta tutti i metodi (GET, POST, OPTIONS, ecc.)
        config.addAllowedMethod("*");

        // Applica questa configurazione a tutte le rotte API
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}