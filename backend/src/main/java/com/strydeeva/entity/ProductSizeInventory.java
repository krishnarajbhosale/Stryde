package com.strydeeva.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_size_inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "product_id", "size_name" })
})
public class ProductSizeInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "size_name", nullable = false, length = 20)
    private String sizeName;

    @Column(nullable = false)
    private int quantity;

    public ProductSizeInventory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getSizeName() { return sizeName; }
    public void setSizeName(String sizeName) { this.sizeName = sizeName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
