package com.strydeeva.controller;

import com.strydeeva.dto.OrderResponseDto;
import com.strydeeva.service.OrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getOrders(@RequestParam(defaultValue = "CONFIRMED") String status) {
        List<OrderResponseDto> orders = "ALL".equalsIgnoreCase(status)
            ? orderService.getAllOrders()
            : orderService.getConfirmedOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] excel = orderService.exportConfirmedOrdersToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "confirmed_orders.xlsx");
        return ResponseEntity.ok().headers(headers).body(excel);
    }
}
