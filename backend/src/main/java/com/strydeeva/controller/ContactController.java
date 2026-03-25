package com.strydeeva.controller;

import com.strydeeva.service.EmailNotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailNotificationService emailNotificationService;

    public ContactController(EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    public static class ContactDto {
        @NotBlank
        private String name;
        @NotBlank
        @Email
        private String email;
        private String subject;
        @NotBlank
        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody ContactDto body) {
        boolean sent = emailNotificationService.sendContactFormEmail(
                body.getName(),
                body.getEmail(),
                body.getSubject(),
                body.getMessage()
        );
        if (!sent) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Message could not be sent. Email (SMTP) is not configured on server."
            ));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}

