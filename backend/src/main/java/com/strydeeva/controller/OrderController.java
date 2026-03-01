package com.strydeeva.controller;

import com.strydeeva.dto.CreateOrderRequestDto;
import com.strydeeva.dto.OrderResponseDto;
import com.strydeeva.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody CreateOrderRequestDto request) {
        OrderResponseDto order = orderService.createOrder(request);
        return ResponseEntity.status(201).body(order);
    }
}
