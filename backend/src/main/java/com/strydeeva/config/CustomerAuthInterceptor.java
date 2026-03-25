package com.strydeeva.config;

import com.strydeeva.repository.CustomerRepository;
import com.strydeeva.service.CustomerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class CustomerAuthInterceptor implements HandlerInterceptor {

    private final CustomerAuthService customerAuthService;
    private final CustomerRepository customerRepository;

    public CustomerAuthInterceptor(CustomerAuthService customerAuthService, CustomerRepository customerRepository) {
        this.customerAuthService = customerAuthService;
        this.customerRepository = customerRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        String token = auth.substring(7).trim();
        if (!customerAuthService.isValidToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        Long customerId = customerAuthService.getCustomerIdForToken(token);
        request.setAttribute("customerId", customerId);
        if (customerId != null) {
            customerRepository.findById(customerId).ifPresent(c -> request.setAttribute("customerEmail", c.getEmail()));
        }
        return true;
    }
}

