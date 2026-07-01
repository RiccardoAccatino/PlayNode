package com.playnode.game_service.security;

import com.playnode.game_service.repository.LocaleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("localeSecurity")
public class LocaleAuthorizationService {

    private final LocaleRepository localeRepository;

    public LocaleAuthorizationService(LocaleRepository localeRepository) {
        this.localeRepository = localeRepository;
    }

    public boolean isGestoreOfLocale(Long localeId) {
        if (localeId == null) {
            return false;
        }
        if (hasAdminRole()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return false;
        }
        try {
            Long userId = Long.parseLong(auth.getPrincipal().toString());
            return localeRepository.findById(localeId)
                    .map(locale -> userId.equals(locale.getGestoreId()))
                    .orElse(false);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public boolean isAdminOrGestore() {
        return hasAdminRole() || hasRole("ROLE_GESTORE");
    }

    private boolean hasAdminRole() {
        return hasRole("ROLE_ADMINPIATTAFORMA") || hasRole("ROLE_ADMINGIOCO");
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
