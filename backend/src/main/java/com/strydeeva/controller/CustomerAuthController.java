package com.strydeeva.controller;

import com.strydeeva.service.CustomerAuthService;
import com.strydeeva.service.EmailNotificationService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;
    private final EmailNotificationService emailNotificationService;

    public CustomerAuthController(CustomerAuthService customerAuthService, EmailNotificationService emailNotificationService) {
        this.customerAuthService = customerAuthService;
        this.emailNotificationService = emailNotificationService;
    }

    public static class RequestOtpDto {
        @NotBlank
        @Email
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class VerifyOtpDto {
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String otp;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, Object>> requestOtp(@jakarta.validation.Valid @RequestBody(required = false) RequestOtpDto request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email is required"
            ));
        }
        String otp = customerAuthService.createAndStoreOtp(request.getEmail());
        boolean sent = emailNotificationService.sendOtpEmail(request.getEmail(), otp);
        if (!sent) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "OTP could not be sent. Email (SMTP) is not configured on server."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit OTP has been sent to your email."
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@jakarta.validation.Valid @RequestBody(required = false) VerifyOtpDto request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank() || request.getOtp() == null || request.getOtp().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email and OTP are required"
            ));
        }
        String token = customerAuthService.verifyOtpAndCreateToken(request.getEmail(), request.getOtp());
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired OTP"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", token
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth != null && auth.startsWith("Bearer ")) {
            customerAuthService.logout(auth.substring(7).trim());
        }
        return ResponseEntity.ok().build();
    }
}

