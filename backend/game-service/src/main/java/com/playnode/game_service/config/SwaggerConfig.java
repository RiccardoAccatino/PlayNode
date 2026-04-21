package com.playnode.game_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI playNodeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PlayNode - Game Service API")
                        .description("Documentazione interattiva delle API per la gestione delle partite, dei locali e dell'IoT.")
                        .version("1.0.0"));
    }
}