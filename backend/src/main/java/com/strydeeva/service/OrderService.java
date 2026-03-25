package com.strydeeva.service;

import com.strydeeva.dto.CreateOrderRequestDto;
import com.strydeeva.dto.OrderResponseDto;
import com.strydeeva.entity.Customer;
import com.strydeeva.entity.Order;
import com.strydeeva.entity.OrderItem;
import com.strydeeva.entity.Order.OrderStatus;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.repository.CustomerRepository;
import com.strydeeva.repository.ProductSizeInventoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductSizeInventoryRepository productSizeInventoryRepository;
    private final InvoiceTokenService invoiceTokenService;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.systemDefault());

    public OrderService(OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductSizeInventoryRepository productSizeInventoryRepository,
            InvoiceTokenService invoiceTokenService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productSizeInventoryRepository = productSizeInventoryRepository;
        this.invoiceTokenService = invoiceTokenService;
    }

    public List<OrderResponseDto> getConfirmedOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.CONFIRMED).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDto> getOrdersForCustomer(String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank()) return List.of();
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(customerEmail).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDto> getOrdersForCustomerId(Long customerId) {
        return getOrdersForCustomerId(customerId, null);
    }

    @org.springframework.transaction.annotation.Transactional
    public List<OrderResponseDto> getOrdersForCustomerId(Long customerId, String customerEmail) {
        if (customerId == null) return List.of();
        List<Order> byId = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        if (byId != null && !byId.isEmpty()) {
            return byId.stream().map(this::toDto).collect(Collectors.toList());
        }

        // Fallback for legacy orders created before customerId existed
        String normalizedEmail = customerEmail == null ? "" : customerEmail.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            normalizedEmail = customerRepository.findById(customerId).map(Customer::getEmail).orElse("");
        }
        if (normalizedEmail.isBlank()) return List.of();

        List<Order> legacy = orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail);
        // Backfill customerId so future requests are fast and consistent
        for (Order o : legacy) {
            if (o.getCustomerId() == null) o.setCustomerId(customerId);
        }
        orderRepository.saveAll(legacy);
        return legacy.stream().map(this::toDto).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public OrderResponseDto createOrder(CreateOrderRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("At least one item is required");
        }
        Order order = new Order();
        order.setOrderNumber("STR-" + System.currentTimeMillis());
        String normalizedEmail = request.getCustomerEmail() != null ? request.getCustomerEmail().trim().toLowerCase() : "";
        order.setCustomerEmail(normalizedEmail);
        order.setCustomerMobile(request.getCustomerMobile() != null ? request.getCustomerMobile().trim() : "");
        order.setCustomerName(request.getCustomerName() != null ? request.getCustomerName().trim() : "");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress().trim() : "");
        order.setCity(request.getCity() != null ? request.getCity().trim() : "");
        order.setPinCode(request.getPinCode() != null ? request.getPinCode().trim() : "");
        order.setGstNumber(request.getGstNumber() != null ? request.getGstNumber().trim() : "");
        order.setPromoCode(request.getPromoCode() != null && !request.getPromoCode().isBlank()
                ? request.getPromoCode().trim().toUpperCase()
                : null);
        order.setPromoDiscount(request.getPromoDiscount() != null ? request.getPromoDiscount() : BigDecimal.ZERO);
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);
        order.setCodCharge(request.getCodCharge() != null ? request.getCodCharge() : BigDecimal.ZERO);
        order.setGstAmount(request.getGstAmount() != null ? request.getGstAmount() : BigDecimal.ZERO);
        if (!normalizedEmail.isBlank()) {
            Customer customer = customerRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
                Customer c = new Customer();
                c.setEmail(normalizedEmail);
                return customerRepository.save(c);
            });
            order.setCustomerId(customer.getId());
        }
        order.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO);
        order.setStatus(OrderStatus.CONFIRMED);

        for (CreateOrderRequestDto.OrderItemRequestDto itemReq : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemReq.getProductId());
            item.setProductName(itemReq.getProductName() != null ? itemReq.getProductName().trim() : "");
            item.setSizeName(itemReq.getSizeName() != null ? itemReq.getSizeName().trim() : "");
            item.setQuantity(Math.max(1, itemReq.getQuantity()));
            item.setUnitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO);
            if (itemReq.getCustomSizeId() != null) {
                item.setCustomSizeId(itemReq.getCustomSizeId());
            }
            order.getItems().add(item);
        }

        order = orderRepository.save(order);

        // Decrement product size inventory for each ordered item (skip custom size
        // items)
        for (OrderItem orderItem : order.getItems()) {
            if (orderItem.getProductId() == null || orderItem.getSizeName() == null
                    || "Custom".equalsIgnoreCase(orderItem.getSizeName()) || orderItem.getCustomSizeId() != null)
                continue;
            productSizeInventoryRepository
                    .findByProduct_IdAndSizeName(orderItem.getProductId(), orderItem.getSizeName())
                    .ifPresent(inv -> {
                        int newQty = Math.max(0, inv.getQuantity() - orderItem.getQuantity());
                        inv.setQuantity(newQty);
                        productSizeInventoryRepository.save(inv);
                    });
        }

        // Build response from saved order + request to avoid lazy-load on items
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerMobile(order.getCustomerMobile());
        dto.setCustomerName(order.getCustomerName());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCity(order.getCity());
        dto.setPinCode(order.getPinCode());
        dto.setGstNumber(order.getGstNumber());
        dto.setPromoCode(order.getPromoCode());
        dto.setPromoDiscount(order.getPromoDiscount());
        dto.setShippingFee(order.getShippingFee());
        dto.setCodCharge(order.getCodCharge());
        dto.setGstAmount(order.getGstAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : "");
        dto.setCreatedAt(order.getCreatedAt());
        List<OrderResponseDto.OrderItemDto> itemDtos = new ArrayList<>();
        for (CreateOrderRequestDto.OrderItemRequestDto itemReq : request.getItems()) {
            itemDtos.add(new OrderResponseDto.OrderItemDto(
                    itemReq.getProductName() != null ? itemReq.getProductName() : "",
                    itemReq.getSizeName() != null ? itemReq.getSizeName() : "",
                    Math.max(1, itemReq.getQuantity()),
                    itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO,
                    itemReq.getCustomSizeId()));
        }
        dto.setItems(itemDtos);
        // one-time token to download invoice PDF immediately after placing order
        dto.setInvoiceToken(invoiceTokenService.createTokenForOrder(order.getId()));
        return dto;
    }

    @org.springframework.transaction.annotation.Transactional
    public Order createPendingOrder(CreateOrderRequestDto request, String paymentMethod, String paymentProvider, String paymentTxnId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("At least one item is required");
        }
        Order order = new Order();
        order.setOrderNumber("STR-" + System.currentTimeMillis());
        String normalizedEmail = request.getCustomerEmail() != null ? request.getCustomerEmail().trim().toLowerCase() : "";
        order.setCustomerEmail(normalizedEmail);
        order.setCustomerMobile(request.getCustomerMobile() != null ? request.getCustomerMobile().trim() : "");
        order.setCustomerName(request.getCustomerName() != null ? request.getCustomerName().trim() : "");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress().trim() : "");
        order.setCity(request.getCity() != null ? request.getCity().trim() : "");
        order.setPinCode(request.getPinCode() != null ? request.getPinCode().trim() : "");
        order.setGstNumber(request.getGstNumber() != null ? request.getGstNumber().trim() : "");
        order.setPromoCode(request.getPromoCode() != null && !request.getPromoCode().isBlank()
                ? request.getPromoCode().trim().toUpperCase()
                : null);
        order.setPromoDiscount(request.getPromoDiscount() != null ? request.getPromoDiscount() : BigDecimal.ZERO);
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);
        order.setCodCharge(request.getCodCharge() != null ? request.getCodCharge() : BigDecimal.ZERO);
        order.setGstAmount(request.getGstAmount() != null ? request.getGstAmount() : BigDecimal.ZERO);
        order.setPaymentMethod(paymentMethod != null ? paymentMethod.trim().toLowerCase() : null);
        order.setPaymentProvider(paymentProvider != null ? paymentProvider.trim().toLowerCase() : null);
        order.setPaymentTxnId(paymentTxnId != null ? paymentTxnId.trim() : null);
        if (!normalizedEmail.isBlank()) {
            Customer customer = customerRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
                Customer c = new Customer();
                c.setEmail(normalizedEmail);
                return customerRepository.save(c);
            });
            order.setCustomerId(customer.getId());
        }
        order.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO);
        order.setStatus(OrderStatus.PENDING);

        for (CreateOrderRequestDto.OrderItemRequestDto itemReq : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemReq.getProductId());
            item.setProductName(itemReq.getProductName() != null ? itemReq.getProductName().trim() : "");
            item.setSizeName(itemReq.getSizeName() != null ? itemReq.getSizeName().trim() : "");
            item.setQuantity(Math.max(1, itemReq.getQuantity()));
            item.setUnitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO);
            if (itemReq.getCustomSizeId() != null) {
                item.setCustomSizeId(itemReq.getCustomSizeId());
            }
            order.getItems().add(item);
        }

        return orderRepository.save(order);
    }

    @org.springframework.transaction.annotation.Transactional
    public String confirmPendingOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) throw new IllegalArgumentException("Order not found");
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            return invoiceTokenService.createTokenForOrder(order.getId());
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Decrement product size inventory for each ordered item (skip custom size items)
        for (OrderItem orderItem : order.getItems()) {
            if (orderItem.getProductId() == null || orderItem.getSizeName() == null
                    || "Custom".equalsIgnoreCase(orderItem.getSizeName()) || orderItem.getCustomSizeId() != null)
                continue;
            productSizeInventoryRepository
                    .findByProduct_IdAndSizeName(orderItem.getProductId(), orderItem.getSizeName())
                    .ifPresent(inv -> {
                        int newQty = Math.max(0, inv.getQuantity() - orderItem.getQuantity());
                        inv.setQuantity(newQty);
                        productSizeInventoryRepository.save(inv);
                    });
        }

        return invoiceTokenService.createTokenForOrder(order.getId());
    }

    public byte[] exportConfirmedOrdersToExcel() {
        List<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.CONFIRMED);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Confirmed Orders");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            int rowNum = 0;
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = { "Order ID", "Order Number", "Customer Name", "Customer Email", "Address", "City",
                    "Pin Code",
                    "Total Amount", "Status", "Created At", "Items (Product, Size, Qty, Price)" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            for (Order order : orders) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getOrderNumber() != null ? order.getOrderNumber() : "");
                row.createCell(2).setCellValue(order.getCustomerName() != null ? order.getCustomerName() : "");
                row.createCell(3).setCellValue(order.getCustomerEmail() != null ? order.getCustomerEmail() : "");
                row.createCell(4).setCellValue(order.getShippingAddress() != null ? order.getShippingAddress() : "");
                row.createCell(5).setCellValue(order.getCity() != null ? order.getCity() : "");
                row.createCell(6).setCellValue(order.getPinCode() != null ? order.getPinCode() : "");
                row.createCell(7)
                        .setCellValue(order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0);
                row.createCell(8).setCellValue(order.getStatus() != null ? order.getStatus().name() : "");
                row.createCell(9)
                        .setCellValue(order.getCreatedAt() != null ? FORMATTER.format(order.getCreatedAt()) : "");
                StringBuilder itemsStr = new StringBuilder();
                for (OrderItem item : order.getItems()) {
                    if (itemsStr.length() > 0)
                        itemsStr.append("; ");
                    itemsStr.append(item.getProductName()).append(" | ").append(item.getSizeName())
                            .append(" | Qty:").append(item.getQuantity())
                            .append(" | ₹").append(item.getUnitPrice() != null ? item.getUnitPrice() : "0");
                }
                row.createCell(10).setCellValue(itemsStr.toString());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Excel export failed", e);
        }
    }

    private OrderResponseDto toDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerMobile(order.getCustomerMobile());
        dto.setCustomerName(order.getCustomerName());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCity(order.getCity());
        dto.setPinCode(order.getPinCode());
        dto.setGstNumber(order.getGstNumber());
        dto.setPromoCode(order.getPromoCode());
        dto.setPromoDiscount(order.getPromoDiscount());
        dto.setShippingFee(order.getShippingFee());
        dto.setCodCharge(order.getCodCharge());
        dto.setGstAmount(order.getGstAmount());
        dto.setAwbNumber(order.getAwbNumber());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : "");
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(order.getItems().stream()
                .map(item -> new OrderResponseDto.OrderItemDto(
                        item.getProductName(),
                        item.getSizeName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getCustomSizeId()))
                .collect(Collectors.toList()));
        return dto;
    }
}
