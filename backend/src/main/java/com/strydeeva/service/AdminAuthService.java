package com.strydeeva.service;

import com.strydeeva.entity.Admin;
import com.strydeeva.repository.AdminRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, Long> tokenToAdminId = new ConcurrentHashMap<>();

    public AdminAuthService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public String login(String username, String password) {
        Admin admin = adminRepository.findByUsername(username)
            .orElse(null);
        if (admin == null || !passwordEncoder.matches(password, admin.getPasswordHash())) {
            return null;
        }
        String token = UUID.randomUUID().toString();
        tokenToAdminId.put(token, admin.getId());
        return token;
    }

    public boolean isValidToken(String token) {
        return token != null && tokenToAdminId.containsKey(token);
    }

    public void logout(String token) {
        tokenToAdminId.remove(token);
    }
}
