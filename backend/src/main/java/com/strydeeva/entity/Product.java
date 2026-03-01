package com.strydeeva.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "basic_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicPrice;

    @Column(length = 500)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    /** Legacy column in DB (NOT NULL, no default). Set false on insert so schema matches; not used in API. */
    @Column(name = "sold_out", nullable = false)
    private boolean soldOut = false;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSizeInventory> sizeInventories = new ArrayList<>();

    public Product() {}

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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isSoldOut() { return soldOut; }
    public void setSoldOut(boolean soldOut) { this.soldOut = soldOut; }
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public List<ProductSizeInventory> getSizeInventories() { return sizeInventories; }
    public void setSizeInventories(List<ProductSizeInventory> sizeInventories) { this.sizeInventories = sizeInventories; }
}
