package com.strydeeva.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductResponseDto {
    private Long id;
    private String name;
    private BigDecimal basicPrice;
    private String category;
    private String description;
    private List<String> imageUrls = new ArrayList<>();
    private List<SizeQuantityDto> sizeInventories = new ArrayList<>();

    public ProductResponseDto() {}

    public ProductResponseDto(Long id, String name, BigDecimal basicPrice, String category, String description,
                             List<String> imageUrls, List<SizeQuantityDto> sizeInventories) {
        this.id = id;
        this.name = name;
        this.basicPrice = basicPrice;
        this.category = category;
        this.description = description;
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
        this.sizeInventories = sizeInventories != null ? sizeInventories : new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getBasicPrice() { return basicPrice; }
    public void setBasicPrice(BigDecimal basicPrice) { this.basicPrice = basicPrice; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>(); }
    public List<SizeQuantityDto> getSizeInventories() { return sizeInventories; }
    public void setSizeInventories(List<SizeQuantityDto> sizeInventories) { this.sizeInventories = sizeInventories != null ? sizeInventories : new ArrayList<>(); }
}
