package com.strydeeva.repository;

import com.strydeeva.entity.ProductSizeInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductSizeInventoryRepository extends JpaRepository<ProductSizeInventory, Long> {

    Optional<ProductSizeInventory> findByProduct_IdAndSizeName(Long productId, String sizeName);
}
