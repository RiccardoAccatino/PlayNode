package com.playnode.auth_service.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configurazione della sicurezza Spring Security con JWT e CORS.
 * * Responsabile per:
 * - Configurare SecurityFilterChain con JWT authentication
 * - Integrare il JwtAuthenticationFilter
 * - Configurare CORS leggendo i domini consentiti da application.properties
 * - Impostare la politica di sessione a STATELESS
 */
@Configuration
@EnableWebSecurity // Abilita la configurazione di sicurezza web moderna di Spring
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // Legge la lista degli origin consentiti dal file application.properties
    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    /**
     * Configura la SecurityFilterChain (il "casello autostradale" delle tue API).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Applica la configurazione CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disabilita CSRF (non serve per le API REST stateless protette da JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Imposta la gestione delle sessioni su STATELESS (nessuna sessione salvata
                // sul server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Regole di autorizzazione per i vari endpoint
                .authorizeHttpRequests(auth -> auth
                        // Endpoint pubblici che non richiedono il token
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/").permitAll()
                        // Qualsiasi altra richiesta richiede un token JWT valido
                        .anyRequest().authenticated())

                // 5. Inserisce il tuo filtro JWT prima del filtro standard di Spring Security
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configura le regole CORS per permettere al frontend di comunicare con il
     * backend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Usa la lista di origin (es. localhost:3000) prelevata dinamicamente dal
        // properties
        configuration.setAllowedOrigins(allowedOrigins);

        // Metodi HTTP consentiti
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Headers consentiti nelle richieste in ingresso
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Headers che il frontend è autorizzato a leggere dalla risposta (fondamentale
        // per leggere il token o altri dati custom)
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // Abilita l'invio di credenziali (come cookie o header di autorizzazione
        // cross-origin)
        configuration.setAllowCredentials(true);

        // Tempo per cui il browser può memorizzare in cache la risposta preflight
        // (evita doppie chiamate OPTIONS continue)
        configuration.setMaxAge(3600L);

        // Applica questa configurazione a tutte le rotte che iniziano con /api/
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}