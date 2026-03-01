package com.strydeeva.repository;

import com.strydeeva.entity.Order;
import com.strydeeva.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
}
