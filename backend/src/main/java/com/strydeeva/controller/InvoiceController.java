package com.strydeeva.controller;

import com.strydeeva.entity.Order;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.service.InvoicePdfService;
import com.strydeeva.service.InvoiceTokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class InvoiceController {

    private final OrderRepository orderRepository;
    private final InvoicePdfService invoicePdfService;
    private final InvoiceTokenService invoiceTokenService;

    public InvoiceController(OrderRepository orderRepository, InvoicePdfService invoicePdfService, InvoiceTokenService invoiceTokenService) {
        this.orderRepository = orderRepository;
        this.invoicePdfService = invoicePdfService;
        this.invoiceTokenService = invoiceTokenService;
    }

    @GetMapping("/{id}/invoice.pdf")
    public ResponseEntity<byte[]> invoice(@PathVariable Long id, @RequestParam("token") String token) {
        if (!invoiceTokenService.isValid(id, token)) {
            return ResponseEntity.status(401).build();
        }
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        byte[] pdf = invoicePdfService.generate(order);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + (order.getOrderNumber() != null ? order.getOrderNumber() : id) + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}

