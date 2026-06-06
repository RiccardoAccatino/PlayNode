package com.playnode.auth_service.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configurazione CORS Suprema per l'AUTH-SERVICE.
 * Scavalca le rigide regole di Spring Security.
 */
@Configuration
public class GlobalCorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> customCorsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permette l'invio del token JWT
        config.setAllowCredentials(false); // Per il test locale

        // Accetta richieste da qualsiasi porta (VS Code 5500, IntelliJ 63342, ecc.)
        config.addAllowedOriginPattern("*");

        // Accetta tutti gli header
        config.addAllowedHeader("*");

        // Accetta tutti i metodi
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);

        // IL TRUCCO È QUI: Creiamo un filtro e gli diamo la priorità MASSIMA.
        // In questo modo viene eseguito PRIMA che Spring Security blocchi la richiesta!
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return bean;
    }
}