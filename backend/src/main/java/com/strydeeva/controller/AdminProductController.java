package com.strydeeva.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.strydeeva.dto.ProductResponseDto;
import com.strydeeva.dto.SizeQuantityDto;
import com.strydeeva.service.ProductService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponseDto> createProduct(
            @RequestParam("name") String name,
            @RequestParam("basicPrice") BigDecimal basicPrice,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sizeInventories", required = false) String sizeInventoriesJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        List<SizeQuantityDto> sizeInventories = parseSizeInventories(sizeInventoriesJson);
        ProductResponseDto created = productService.createProduct(name, basicPrice, category, description, sizeInventories, images);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/image/{index}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id, @PathVariable int index) {
        return productService.getImage(id, index)
            .map(data -> {
                HttpHeaders headers = new HttpHeaders();
                productService.getImageContentType(id, index).ifPresent(ct -> headers.setContentType(MediaType.parseMediaType(ct)));
                return ResponseEntity.ok().headers(headers).body(data);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return productService.updateProduct(id, body)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    private List<SizeQuantityDto> parseSizeInventories(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<SizeQuantityDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
