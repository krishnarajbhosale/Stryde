package com.strydeeva.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://strydeeva.com",
                "https://www.strydeeva.com"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        // Payment gateway endpoints must accept cross-site POSTs reliably (no cookies needed).
        // If the browser sends an unexpected Origin (or "null"), Spring can return 403 "Invalid CORS request".
        // Keep this permissive but scoped only to the Easebuzz payment endpoints.
        CorsConfiguration easebuzzPublicCors = new CorsConfiguration();
        easebuzzPublicCors.addAllowedOriginPattern("*");
        easebuzzPublicCors.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        easebuzzPublicCors.setAllowedHeaders(List.of("*"));
        easebuzzPublicCors.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/payments/easebuzz/**", easebuzzPublicCors);
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
