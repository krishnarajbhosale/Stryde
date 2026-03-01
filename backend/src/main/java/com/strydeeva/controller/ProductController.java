package com.strydeeva.controller;

import com.strydeeva.dto.ProductResponseDto;
import com.strydeeva.service.ProductService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Public API for the storefront. No authentication required.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final String PUBLIC_IMAGE_PREFIX = "/api/products/";

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        List<ProductResponseDto> list = productService.getAllProducts();
        list.forEach(this::usePublicImageUrls);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(dto -> {
                usePublicImageUrls(dto);
                return ResponseEntity.ok(dto);
            })
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

    private void usePublicImageUrls(ProductResponseDto dto) {
        if (dto.getImageUrls() != null && dto.getId() != null) {
            List<String> publicUrls = new ArrayList<>();
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                publicUrls.add(PUBLIC_IMAGE_PREFIX + dto.getId() + "/image/" + i);
            }
            dto.setImageUrls(publicUrls);
        }
    }
}
