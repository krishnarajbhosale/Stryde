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
        // Default CORS for your site + local dev (credentials allowed for auth endpoints).
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://strydeeva.com",
                "https://www.strydeeva.com",
                // Easebuzz hosted checkout posts back to our SURL/FURL from these origins
                "https://pay.easebuzz.in",
                "https://testpay.easebuzz.in"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        // Easebuzz callback endpoints must accept cross-site POSTs reliably.
        // Some gateway browsers can send varying Origin headers; do NOT require cookies here.
        CorsConfiguration easebuzzCallbackCors = new CorsConfiguration();
        // Be explicit: some Spring setups still reject "*" patterns for non-simple requests.
        easebuzzCallbackCors.setAllowedOrigins(List.of(
                "https://pay.easebuzz.in",
                "https://testpay.easebuzz.in"
        ));
        easebuzzCallbackCors.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        easebuzzCallbackCors.setAllowedHeaders(List.of("*"));
        easebuzzCallbackCors.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/payments/easebuzz/**", easebuzzCallbackCors);
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
