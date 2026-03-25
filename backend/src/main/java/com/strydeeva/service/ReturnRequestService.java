package com.strydeeva.service;

import com.strydeeva.entity.Order;
import com.strydeeva.entity.ReturnRequest;
import com.strydeeva.repository.CustomerRepository;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.repository.ReturnRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Optional;

@Service
public class ReturnRequestService {

    @Value("${app.upload.returns-dir:uploads/returns}")
    private String returnsDir;

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final EmailNotificationService emailNotificationService;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            EmailNotificationService emailNotificationService
    ) {
        this.returnRequestRepository = returnRequestRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.emailNotificationService = emailNotificationService;
    }

    public ReturnRequest submit(
            String customerName,
            String contactNumber,
            String email,
            String orderIdText,
            String issueText,
            MultipartFile video
    ) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        Long orderId = parseLong(orderIdText);
        if (orderId == null) throw new IllegalArgumentException("Invalid order id");

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) throw new IllegalArgumentException("Order not found");
        Order order = orderOpt.get();
        String orderEmail = order.getCustomerEmail() == null ? "" : order.getCustomerEmail().trim().toLowerCase();
        if (!orderEmail.equals(normalizedEmail)) {
            throw new IllegalArgumentException("This order does not belong to the provided email");
        }

        ReturnRequest req = new ReturnRequest();
        req.setCustomerName(customerName == null ? "" : customerName.trim());
        req.setContactNumber(contactNumber == null ? "" : contactNumber.trim());
        req.setEmail(normalizedEmail);
        req.setOrderId(String.valueOf(orderId));
        req.setIssueText(issueText == null ? "" : issueText.trim());
        if (order.getCustomerId() != null) {
            req.setCustomerId(order.getCustomerId());
        } else {
            req.setCustomerId(customerRepository.findByEmailIgnoreCase(normalizedEmail).map(c -> c.getId()).orElse(null));
        }
        if (video != null && !video.isEmpty()) {
            try {
                req.setVideoContentType(video.getContentType());
                String filename = UUID.randomUUID().toString() + safeExtension(video.getOriginalFilename());
                Path dir = Paths.get(returnsDir);
                Files.createDirectories(dir);
                Path filePath = dir.resolve(filename);
                video.transferTo(filePath);
                req.setVideoPath(filePath.toString());
            } catch (Exception e) {
                throw new RuntimeException("Failed to save video file", e);
            }
        }
        ReturnRequest saved = returnRequestRepository.save(req);

        emailNotificationService.sendReturnRequestEmails(
                normalizedEmail,
                req.getCustomerName(),
                req.getOrderId(),
                req.getIssueText()
        );
        return saved;
    }

    private Long parseLong(String v) {
        if (v == null || v.isBlank()) return null;
        try {
            return Long.parseLong(v.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String safeExtension(String originalName) {
        if (originalName == null) return "";
        int dot = originalName.lastIndexOf('.');
        if (dot < 0 || dot == originalName.length() - 1) return "";
        String ext = originalName.substring(dot).toLowerCase();
        // keep extension short + safe
        if (ext.length() > 10) return "";
        if (!ext.matches("\\.[a-z0-9]+")) return "";
        return ext;
    }
}

