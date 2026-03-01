package com.strydeeva.service;

import com.strydeeva.dto.ProductResponseDto;
import com.strydeeva.dto.SizeQuantityDto;
import com.strydeeva.entity.Product;
import com.strydeeva.entity.ProductImage;
import com.strydeeva.entity.ProductSizeInventory;
import com.strydeeva.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final int MAX_IMAGES = 3;

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public ProductResponseDto createProduct(
            String name,
            BigDecimal basicPrice,
            String category,
            String description,
            List<SizeQuantityDto> sizeInventories,
            List<MultipartFile> imageFiles
    ) {
        Product product = new Product();
        product.setName(name);
        product.setBasicPrice(basicPrice);
        product.setCategory(category);
        product.setDescription(description != null ? description : "");

        if (sizeInventories != null) {
            for (SizeQuantityDto dto : sizeInventories) {
                if (dto.getSizeName() == null || dto.getSizeName().isBlank()) continue;
                ProductSizeInventory inv = new ProductSizeInventory();
                inv.setProduct(product);
                inv.setSizeName(dto.getSizeName().trim());
                inv.setQuantity(Math.max(0, dto.getQuantity()));
                product.getSizeInventories().add(inv);
            }
        }

        if (imageFiles != null && !imageFiles.isEmpty()) {
            int count = 0;
            for (MultipartFile file : imageFiles) {
                if (count >= MAX_IMAGES) break;
                if (file == null || file.isEmpty()) continue;
                try {
                    ProductImage img = new ProductImage();
                    img.setProduct(product);
                    img.setImageData(file.getBytes());
                    img.setContentType(file.getContentType());
                    img.setSortOrder(count);
                    product.getImages().add(img);
                    count++;
                } catch (Exception e) {
                    throw new RuntimeException("Failed to save image", e);
                }
            }
        }

        product = productRepository.save(product);
        return toDto(product, true);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(p -> toDto(p, true))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ProductResponseDto> getProductById(Long id) {
        return productRepository.findByIdWithImagesAndSizes(id).map(p -> toDto(p, true));
    }

    @Transactional
    public Optional<ProductResponseDto> updateProduct(Long id, Map<String, Object> updates) {
        final Map<String, Object> updatesMap = updates != null ? updates : new HashMap<>();
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();
        Product product = opt.get();
        if (updatesMap.containsKey("name")) {
            Object v = updatesMap.get("name");
            product.setName(v != null ? v.toString() : null);
        }
        if (updatesMap.containsKey("basicPrice")) {
            Object v = updatesMap.get("basicPrice");
            if (v != null && !v.toString().isBlank()) {
                try {
                    product.setBasicPrice(new BigDecimal(v.toString()));
                } catch (NumberFormatException ignored) { }
            }
        }
        if (updatesMap.containsKey("category")) {
            Object v = updatesMap.get("category");
            product.setCategory(v != null ? v.toString() : null);
        }
        if (updatesMap.containsKey("description")) {
            Object v = updatesMap.get("description");
            product.setDescription(v != null ? v.toString() : null);
        }
        if (updatesMap.containsKey("sizeInventories")) {
            product.getSizeInventories().clear();
            productRepository.saveAndFlush(product);
            Object raw = updatesMap.get("sizeInventories");
            if (raw instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> list = (List<Map<String, Object>>) raw;
                for (Map<String, Object> m : list) {
                    if (m == null) continue;
                    String sizeName = m.get("sizeName") != null ? m.get("sizeName").toString().trim() : "";
                    if (sizeName.isEmpty()) continue;
                    ProductSizeInventory inv = new ProductSizeInventory();
                    inv.setProduct(product);
                    inv.setSizeName(sizeName);
                    Object q = m.get("quantity");
                    inv.setQuantity(q != null && q instanceof Number ? ((Number) q).intValue() : 0);
                    product.getSizeInventories().add(inv);
                }
            }
        }
        productRepository.saveAndFlush(product);
        return productRepository.findByIdWithImagesAndSizes(id).map(p -> toDto(p, true));
    }

    /** Add images to an existing product. Keeps existing images; new ones are appended up to MAX_IMAGES total. */
    @Transactional
    public Optional<ProductResponseDto> addProductImages(Long productId, List<MultipartFile> imageFiles) {
        Optional<Product> opt = productRepository.findByIdWithImagesAndSizes(productId);
        if (opt.isEmpty()) return Optional.empty();
        Product product = opt.get();
        List<ProductImage> existing = product.getImages() != null ? product.getImages() : new ArrayList<>();
        int nextOrder = existing.size();
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (nextOrder >= MAX_IMAGES) break;
                if (file == null || file.isEmpty()) continue;
                try {
                    ProductImage img = new ProductImage();
                    img.setProduct(product);
                    img.setImageData(file.getBytes());
                    img.setContentType(file.getContentType());
                    img.setSortOrder(nextOrder);
                    product.getImages().add(img);
                    nextOrder++;
                } catch (Exception e) {
                    throw new RuntimeException("Failed to save image", e);
                }
            }
        }
        productRepository.saveAndFlush(product);
        return productRepository.findByIdWithImagesAndSizes(productId).map(p -> toDto(p, true));
    }

    @Transactional
    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) return false;
        productRepository.deleteById(id);
        return true;
    }

    @Transactional(readOnly = true)
    public Optional<byte[]> getImage(Long productId, int imageIndex) {
        return productRepository.findById(productId)
            .flatMap(p -> p.getImages().stream()
                .filter(img -> img.getSortOrder() == imageIndex)
                .findFirst())
            .map(ProductImage::getImageData);
    }

    @Transactional(readOnly = true)
    public Optional<String> getImageContentType(Long productId, int imageIndex) {
        return productRepository.findById(productId)
            .flatMap(p -> p.getImages().stream()
                .filter(img -> img.getSortOrder() == imageIndex)
                .findFirst())
            .map(ProductImage::getContentType);
    }

    private ProductResponseDto toDto(Product product, boolean includeImageUrls) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setName(product.getName() != null ? product.getName() : "");
        dto.setBasicPrice(product.getBasicPrice() != null ? product.getBasicPrice() : BigDecimal.ZERO);
        dto.setCategory(product.getCategory());
        dto.setDescription(product.getDescription());
        List<ProductSizeInventory> sizes = product.getSizeInventories();
        dto.setSizeInventories(sizes != null ? sizes.stream()
            .map(si -> new SizeQuantityDto(si.getSizeName(), si.getQuantity()))
            .collect(Collectors.toList()) : new ArrayList<>());
        if (includeImageUrls) {
            List<String> urls = new ArrayList<>();
            List<ProductImage> imgs = product.getImages();
            int count = imgs != null ? imgs.size() : 0;
            for (int i = 0; i < count; i++) {
                urls.add("/api/admin/products/" + product.getId() + "/image/" + i);
            }
            dto.setImageUrls(urls);
        }
        return dto;
    }
}
