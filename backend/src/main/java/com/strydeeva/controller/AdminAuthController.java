package com.strydeeva.controller;

import com.strydeeva.dto.LoginRequest;
import com.strydeeva.dto.LoginResponse;
import com.strydeeva.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = adminAuthService.login(request.getUsername(), request.getPassword());
        if (token == null) {
            return ResponseEntity.ok(new LoginResponse(null, false));
        }
        return ResponseEntity.ok(new LoginResponse(token, true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String auth) {
        if (auth != null && auth.startsWith("Bearer ")) {
            adminAuthService.logout(auth.substring(7).trim());
        }
        return ResponseEntity.ok().build();
    }
}
