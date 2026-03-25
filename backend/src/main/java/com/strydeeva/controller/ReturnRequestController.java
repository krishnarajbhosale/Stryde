package com.strydeeva.controller;

import com.strydeeva.entity.ReturnRequest;
import com.strydeeva.service.ReturnRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/returns")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submit(
            @RequestParam("name") String name,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("email") String email,
            @RequestParam("orderId") String orderId,
            @RequestParam("issueText") String issueText,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) {
        try {
            ReturnRequest saved = returnRequestService.submit(name, contactNumber, email, orderId, issueText, video);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", saved.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

