package com.strydeeva.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InvoiceTokenService {

    private static final long TTL_SECONDS = 10 * 60; // 10 minutes

    private static class Entry {
        private final String token;
        private final Instant expiresAt;

        private Entry(String token, Instant expiresAt) {
            this.token = token;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<Long, Entry> orderIdToToken = new ConcurrentHashMap<>();

    public String createTokenForOrder(Long orderId) {
        if (orderId == null) return null;
        String t = UUID.randomUUID().toString();
        orderIdToToken.put(orderId, new Entry(t, Instant.now().plusSeconds(TTL_SECONDS)));
        return t;
    }

    public boolean isValid(Long orderId, String token) {
        if (orderId == null || token == null || token.isBlank()) return false;
        Entry e = orderIdToToken.get(orderId);
        if (e == null) return false;
        if (Instant.now().isAfter(e.expiresAt)) {
            orderIdToToken.remove(orderId);
            return false;
        }
        return e.token.equals(token);
    }
}

