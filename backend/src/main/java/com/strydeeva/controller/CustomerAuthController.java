package com.strydeeva.controller;

import com.strydeeva.service.CustomerAuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    public CustomerAuthController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
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
    public ResponseEntity<Map<String, Object>> requestOtp(@RequestBody RequestOtpDto request) {
        String otp = customerAuthService.createAndStoreOtp(request.getEmail());
        // TODO: integrate real email delivery provider here.
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP generated. Use the 6-digit code sent to your email.",
                "devOtp", otp
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpDto request) {
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

