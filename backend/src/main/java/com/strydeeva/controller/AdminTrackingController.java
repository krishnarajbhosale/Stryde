package com.strydeeva.controller;

import com.strydeeva.dto.OrderResponseDto;
import com.strydeeva.entity.Order;
import com.strydeeva.repository.OrderRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tracking")
public class AdminTrackingController {

    private final OrderRepository orderRepository;

    public AdminTrackingController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerMobile(order.getCustomerMobile());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : "");
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setAwbNumber(order.getAwbNumber());
        return ResponseEntity.ok(dto);
    }

    public static class UpdateAwbDto {
        @NotBlank
        private String awbNumber;
        public String getAwbNumber() { return awbNumber; }
        public void setAwbNumber(String awbNumber) { this.awbNumber = awbNumber; }
    }

    @PutMapping("/orders/{id}/awb")
    public ResponseEntity<Map<String, Object>> setAwb(@PathVariable Long id, @RequestBody UpdateAwbDto body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        String awb = body != null && body.getAwbNumber() != null ? body.getAwbNumber().trim() : "";
        order.setAwbNumber(awb.isBlank() ? null : awb);
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "awbNumber", order.getAwbNumber()));
    }
}

