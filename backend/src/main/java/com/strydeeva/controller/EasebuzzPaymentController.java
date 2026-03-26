package com.strydeeva.controller;

import com.strydeeva.dto.CreateOrderRequestDto;
import com.strydeeva.dto.InitiateEasebuzzRequestDto;
import com.strydeeva.entity.Order;
import com.strydeeva.service.EasebuzzService;
import com.strydeeva.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(EasebuzzPaymentController.class);

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

        String amount = fmtAmount(order.getTotalAmount());
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
                normalizePhoneForEasebuzz(phone),
                trimProductInfo(productinfo),
                surl,
                furl,
                String.valueOf(order.getId()),
                "",
                "",
                "",
                ""
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", order.getId());
        resp.put("orderNumber", order.getOrderNumber());
        try {
            // Current Easebuzz API: S2S POST → JSON { status:1, data: accessKey } → browser opens /pay/{key}
            String redirectUrl = easebuzzService.initiateAndGetCheckoutUrl(fields);
            resp.put("redirectUrl", redirectUrl);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            log.warn("Easebuzz initiate rejected: {}", e.getMessage());
            resp.clear();
            resp.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        } catch (Exception e) {
            log.error("Easebuzz initiate failed", e);
            resp.clear();
            resp.put("error", "Payment gateway could not start: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    // Easebuzz may call SURL/FURL as POST (form) or GET (query). Accept both.
    @RequestMapping(path = "/success", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> success(@RequestParam MultiValueMap<String, String> params) {
        return handleGatewayReturn(params, true);
    }

    @RequestMapping(path = "/failure", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> failure(@RequestParam MultiValueMap<String, String> params) {
        return handleGatewayReturn(params, false);
    }

    private ResponseEntity<?> handleGatewayReturn(MultiValueMap<String, String> params, boolean isSuccessUrl) {
        Map<String, String> map = new HashMap<>();
        for (Map.Entry<String, java.util.List<String>> e : params.entrySet()) {
            map.put(e.getKey(), e.getValue() != null && !e.getValue().isEmpty() ? e.getValue().get(0) : "");
        }

        String status = safe(map.get("status"));
        String orderIdStr = safe(map.get("udf1"));
        String orderNumber = safe(map.get("udf2"));
        String txnid = safe(map.get("txnid"));

        boolean hashOk = false;
        try {
            hashOk = easebuzzService.verifyResponseHash(map);
        } catch (Exception e) {
            // Never break gateway redirect due to hash parsing issues.
            log.warn("Easebuzz return: hash verify error: {}", e.getMessage());
            hashOk = false;
        }

        String finalStatus = "failure";
        String invoiceToken = "";
        Long orderId = null;
        try {
            if (!orderIdStr.isBlank()) orderId = Long.parseLong(orderIdStr);
        } catch (Exception ignored) {}

        boolean gatewaySaysSuccess = "success".equalsIgnoreCase(status) || (isSuccessUrl && !status.isBlank() && !"failure".equalsIgnoreCase(status));
        log.info("Easebuzz return: method={} urlType={} statusField={} hashOk={} txnid={} udf1(orderId)={} udf2(orderNo)={}",
                (isSuccessUrl ? "success" : "failure"),
                (isSuccessUrl ? "SURL" : "FURL"),
                status,
                hashOk,
                txnid,
                orderIdStr,
                orderNumber);

        if (orderId != null && gatewaySaysSuccess) {
            if (hashOk) {
                try {
                    finalStatus = "success";
                    invoiceToken = orderService.confirmPendingOrder(orderId);
                } catch (Exception e) {
                    // Do not block redirect; user should still land on website and see failure/retry message.
                    log.error("Easebuzz return: confirmPendingOrder failed for orderId={}", orderId, e);
                    finalStatus = "failure";
                    invoiceToken = "";
                }
            } else {
                // If hash invalid, treat as failure but still redirect out of gateway.
                finalStatus = "failure";
            }
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

    /** Easebuzz-safe productinfo (allowed chars + max 45 chars). */
    private String trimProductInfo(String productinfo) {
        String s = safe(productinfo);
        // Keep only conservative allowed chars for gateway validation.
        s = s.replaceAll("[^a-zA-Z0-9\\s\\-\\|]", "");
        if (s.length() <= 45) return s;
        return s.substring(0, 45);
    }

    /** Prefer digits-only phone within 5–20 chars as per Easebuzz pattern. */
    private String normalizePhoneForEasebuzz(String raw) {
        String s = safe(raw);
        String digits = s.replaceAll("\\D", "");
        if (digits.length() >= 5 && digits.length() <= 20) return digits;
        return s.length() > 20 ? s.substring(0, 20) : s;
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

