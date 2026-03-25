package com.strydeeva.controller;

import com.strydeeva.dto.OrderResponseDto;
import com.strydeeva.entity.Order;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.service.InvoicePdfService;
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
    private final OrderRepository orderRepository;
    private final InvoicePdfService invoicePdfService;

    public AdminOrderController(OrderService orderService, OrderRepository orderRepository, InvoicePdfService invoicePdfService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.invoicePdfService = invoicePdfService;
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

    @GetMapping("/{id}/invoice.pdf")
    public ResponseEntity<byte[]> invoice(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        byte[] pdf = invoicePdfService.generate(order);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
            "attachment",
            "invoice-" + (order.getOrderNumber() != null ? order.getOrderNumber() : id) + ".pdf"
        );
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
