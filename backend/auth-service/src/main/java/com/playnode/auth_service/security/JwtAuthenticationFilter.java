package com.playnode.auth_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

/**
 * Filter che intercetta tutte le richieste HTTP per validare il JWT token.
 * 
 * Agisce una sola volta per request.
 * Se il token è presente nell'header Authorization:
 * - Lo valida
 * - Estrae i claims
 * - Popola il SecurityContextHolder con UsernamePasswordAuthenticationToken
 * - Rende disponibili le autorizzazioni ai controller via SecurityContext
 *
 * Per le richieste senza token (es. /api/auth/*):
 * - Il filter permette alla richiesta di procedere normalmente
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Percorsi pubblici che non richiedono autenticazione
        String requestPath = request.getServletPath();
        if (isPublicPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Estrae il token dall'header Authorization
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Se il token è valido, popola il SecurityContext
        if (token != null && jwtService.validateToken(token)) {
            // Estrae i claims dal token
            Long userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            // Crea le autorità con il prefisso ROLE_
            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

            // Crea un UsernamePasswordAuthenticationToken e lo memorizza nel
            // SecurityContext
            // Principal: userId (identificativo univoco)
            // Credentials: null (non usato in JWT, il token è già nel header)
            // Authorities: ruoli estratti dal token con prefisso ROLE_
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId,
                    null, authorities);

            // Imposta dettagli aggiuntivi per tracciamento
            authenticationToken.setDetails(email);

            // Memorizza l'autenticazione nel SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        // Continua la catena di filter
        filterChain.doFilter(request, response);
    }

    /**
     * Determina se un path è pubblico (non richiede autenticazione)
     */
    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.equals("/");
    }
}