package com.strydeeva.controller;

import com.strydeeva.entity.WalletTransaction;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.repository.CustomerRepository;
import com.strydeeva.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/wallet")
public class AdminWalletController {

    private final WalletService walletService;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public AdminWalletController(WalletService walletService, OrderRepository orderRepository, CustomerRepository customerRepository) {
        this.walletService = walletService;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/customers")
    public ResponseEntity<List<String>> customers() {
        List<String> emails = customerRepository.findAll().stream()
                .map(c -> c.getEmail() == null ? "" : c.getEmail().trim().toLowerCase())
                .filter(s -> !s.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return ResponseEntity.ok(emails);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> ordersByCustomer(@RequestParam("email") String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        List<Map<String, Object>> rows = orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(normalized).stream()
                .map(o -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", o.getId());
                    m.put("orderNumber", Objects.toString(o.getOrderNumber(), ""));
                    m.put("totalAmount", o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    @PostMapping("/credit")
    public ResponseEntity<?> credit(@RequestBody Map<String, Object> body) {
        try {
            Long orderId = body.get("orderId") instanceof Number ? ((Number) body.get("orderId")).longValue() : null;
            BigDecimal amount = body.get("amount") != null ? new BigDecimal(body.get("amount").toString()) : null;
            WalletTransaction tx = walletService.credit(orderId, amount);
            return ResponseEntity.ok(Map.of("success", true, "transactionId", tx.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

