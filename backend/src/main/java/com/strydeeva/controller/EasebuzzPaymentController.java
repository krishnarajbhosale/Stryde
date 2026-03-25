package com.strydeeva.controller;

import com.strydeeva.dto.CreateOrderRequestDto;
import com.strydeeva.dto.InitiateEasebuzzRequestDto;
import com.strydeeva.entity.Order;
import com.strydeeva.service.EasebuzzService;
import com.strydeeva.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/easebuzz")
public class EasebuzzPaymentController {

    private final EasebuzzService easebuzzService;
    private final OrderService orderService;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public EasebuzzPaymentController(EasebuzzService easebuzzService, OrderService orderService,
                                     @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
                                     @Value("${app.backend.base-url:}") String backendBaseUrl) {
        this.easebuzzService = easebuzzService;
        this.orderService = orderService;
        this.frontendBaseUrl = (frontendBaseUrl == null ? "" : frontendBaseUrl.trim());
        this.backendBaseUrl = (backendBaseUrl == null ? "" : backendBaseUrl.trim());
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@Valid @RequestBody InitiateEasebuzzRequestDto req) {
        CreateOrderRequestDto orderReq = req.getOrder();
        String txnid = "EBZ-" + System.currentTimeMillis();

        // Create PENDING order before redirecting to gateway
        Order order = orderService.createPendingOrder(orderReq, req.getPaymentMethod(), "easebuzz", txnid);

        String amount = fmtAmount(orderReq.getTotalAmount());
        String firstname = safe(orderReq.getCustomerName());
        String email = safe(orderReq.getCustomerEmail()).toLowerCase();
        String phone = safe(orderReq.getCustomerMobile());
        String productinfo = buildProductInfo(orderReq);

        String base = !backendBaseUrl.isBlank()
                ? backendBaseUrl
                : ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String surl = base + "/api/payments/easebuzz/success";
        String furl = base + "/api/payments/easebuzz/failure";

        Map<String, String> fields = easebuzzService.buildInitiateFields(
                txnid,
                amount,
                firstname,
                email,
                phone,
                productinfo,
                surl,
                furl,
                String.valueOf(order.getId()),
                "",
                "",
                "",
                ""
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("paymentUrl", easebuzzService.getPaymentUrl());
        resp.put("fields", fields);
        resp.put("orderId", order.getId());
        resp.put("orderNumber", order.getOrderNumber());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/success")
    public ResponseEntity<?> success(@RequestParam MultiValueMap<String, String> params) {
        return handleGatewayReturn(params, true);
    }

    @PostMapping("/failure")
    public ResponseEntity<?> failure(@RequestParam MultiValueMap<String, String> params) {
        return handleGatewayReturn(params, false);
    }

    private ResponseEntity<?> handleGatewayReturn(MultiValueMap<String, String> params, boolean isSuccessUrl) {
        Map<String, String> map = new HashMap<>();
        for (Map.Entry<String, java.util.List<String>> e : params.entrySet()) {
            map.put(e.getKey(), e.getValue() != null && !e.getValue().isEmpty() ? e.getValue().get(0) : "");
        }

        boolean hashOk = easebuzzService.verifyResponseHash(map);
        String status = safe(map.get("status"));
        String orderIdStr = safe(map.get("udf1"));
        String orderNumber = safe(map.get("udf2"));

        String finalStatus = "failure";
        String invoiceToken = "";
        Long orderId = null;
        try {
            if (!orderIdStr.isBlank()) orderId = Long.parseLong(orderIdStr);
        } catch (Exception ignored) {}

        if (hashOk && orderId != null && ("success".equalsIgnoreCase(status) || (isSuccessUrl && !status.isBlank()))) {
            finalStatus = "success";
            invoiceToken = orderService.confirmPendingOrder(orderId);
        }

        String redirect = (frontendBaseUrl.isBlank() ? "http://localhost:5173" : frontendBaseUrl)
                + "/payment-return"
                + "?status=" + url(finalStatus)
                + (orderId != null ? "&orderId=" + orderId : "")
                + (!orderNumber.isBlank() ? "&orderNumber=" + url(orderNumber) : "")
                + (!invoiceToken.isBlank() ? "&invoiceToken=" + url(invoiceToken) : "")
                + (!hashOk ? "&hash=invalid" : "");

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirect));
        return ResponseEntity.status(302).headers(headers).build();
    }

    private String buildProductInfo(CreateOrderRequestDto req) {
        if (req == null || req.getItems() == null || req.getItems().isEmpty()) return "STRYDEEVA ORDER";
        String first = req.getItems().get(0).getProductName();
        if (req.getItems().size() == 1) return safe(first);
        return safe(first) + " + " + (req.getItems().size() - 1) + " more";
    }

    private String fmtAmount(BigDecimal amt) {
        if (amt == null) return "0.00";
        return amt.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private String url(String s) {
        return java.net.URLEncoder.encode(s == null ? "" : s, java.nio.charset.StandardCharsets.UTF_8);
    }
}

