package com.playnode.stats_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI statsServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Stats Service")
                        .description("Documentazione interattiva per il microservizio delle statistiche di PlayNode")
                        .version("1.0.0"));
    }
}