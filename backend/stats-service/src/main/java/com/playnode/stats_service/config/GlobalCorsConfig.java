package com.playnode.stats_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configurazione CORS di livello superiore.
 * Utilizza un CorsFilter che intercetta le richieste prima di qualsiasi controllo di sicurezza,
 * permettendo alle richieste preflight (OPTIONS) del browser di passare senza problemi.
 */
@Configuration
public class GlobalCorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permette l'invio del token JWT
        config.setAllowCredentials(true);

        // Accetta richieste da qualsiasi porta (compresa quella di IntelliJ)
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