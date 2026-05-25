package com.playnode.tournament_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI tournamentOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PlayNode - Tournament Service API")
                        .description("Documentazione delle API per la gestione dei tornei e delle classifiche.")
                        .version("1.0.0"));
    }
}