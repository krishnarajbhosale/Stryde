package com.strydeeva.controller;

import com.strydeeva.dto.CustomSizeRequestDto;
import com.strydeeva.entity.CustomSize;
import com.strydeeva.service.CustomSizeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/custom-sizes")
public class CustomSizeController {

    private final CustomSizeService customSizeService;

    public CustomSizeController(CustomSizeService customSizeService) {
        this.customSizeService = customSizeService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@RequestBody CustomSizeRequestDto request) {
        CustomSize created = customSizeService.create(request);
        return ResponseEntity.status(201).body(Map.of("id", created.getId()));
    }
}
