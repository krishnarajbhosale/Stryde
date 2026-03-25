package com.strydeeva.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;
    private final CustomerAuthInterceptor customerAuthInterceptor;

    public WebMvcConfig(AdminAuthInterceptor adminAuthInterceptor, CustomerAuthInterceptor customerAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
        this.customerAuthInterceptor = customerAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
            .addPathPatterns("/api/admin/**")
            .excludePathPatterns("/api/admin/login");

        registry.addInterceptor(customerAuthInterceptor)
            .addPathPatterns("/api/orders/me", "/api/wallet/me");
    }
}
