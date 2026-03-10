package com.strydeeva.controller;

import com.strydeeva.entity.CustomSize;
import com.strydeeva.service.CustomSizeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/custom-sizes")
public class AdminCustomSizeController {

    private final CustomSizeService customSizeService;

    public AdminCustomSizeController(CustomSizeService customSizeService) {
        this.customSizeService = customSizeService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomSize> getById(@PathVariable Long id) {
        CustomSize cs = customSizeService.findById(id);
        if (cs == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(cs);
    }
}

