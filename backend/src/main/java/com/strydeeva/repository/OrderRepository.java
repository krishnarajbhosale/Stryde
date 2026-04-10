package com.strydeeva.repository;

import com.strydeeva.entity.Order;
import com.strydeeva.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    /** All orders with line items in one query (avoids lazy-load gaps when mapping to DTO). */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items")
    List<Order> findAllWithItems();
}
