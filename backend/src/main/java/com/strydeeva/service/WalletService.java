package com.strydeeva.service;

import com.strydeeva.entity.Order;
import com.strydeeva.entity.WalletTransaction;
import com.strydeeva.repository.OrderRepository;
import com.strydeeva.repository.WalletTransactionRepository;
import com.strydeeva.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private final WalletTransactionRepository walletTransactionRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final EmailNotificationService emailNotificationService;

    public WalletService(
            WalletTransactionRepository walletTransactionRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            EmailNotificationService emailNotificationService
    ) {
        this.walletTransactionRepository = walletTransactionRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.emailNotificationService = emailNotificationService;
    }

    public WalletTransaction credit(Long orderId, BigDecimal amount) {
        if (orderId == null) throw new IllegalArgumentException("Order is required");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        Long customerId = order.getCustomerId();
        if (customerId == null) {
            String email = order.getCustomerEmail() == null ? "" : order.getCustomerEmail().trim().toLowerCase();
            customerId = customerRepository.findByEmailIgnoreCase(email)
                    .map(c -> c.getId())
                    .orElse(null);
        }
        if (customerId == null) throw new IllegalArgumentException("Customer not found for this order");
        WalletTransaction tx = new WalletTransaction();
        tx.setOrderId(orderId);
        tx.setCustomerId(customerId);
        tx.setAmount(amount);
        WalletTransaction saved = walletTransactionRepository.save(tx);
        String emailTo = order.getCustomerEmail() == null ? "" : order.getCustomerEmail().trim().toLowerCase();
        emailNotificationService.sendWalletCreditEmails(emailTo, order.getOrderNumber(), amount.toPlainString());
        return saved;
    }

    public BigDecimal getBalance(Long customerId) {
        if (customerId == null) return BigDecimal.ZERO;
        return walletTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(WalletTransaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Deduct wallet for an order (negative txn). Call only after order is persisted with a real id.
     */
    @org.springframework.transaction.annotation.Transactional
    public void debitForOrder(Long customerId, Long orderId, BigDecimal amount) {
        if (customerId == null || orderId == null) return;
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;
        BigDecimal bal = getBalance(customerId);
        if (amount.compareTo(bal) > 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }
        WalletTransaction tx = new WalletTransaction();
        tx.setCustomerId(customerId);
        tx.setOrderId(orderId);
        tx.setAmount(amount.negate().setScale(2, RoundingMode.HALF_UP));
        walletTransactionRepository.save(tx);
    }

    public Map<String, Object> getWalletForCustomerId(Long customerId) {
        List<WalletTransaction> txns = customerId == null ? List.of() : walletTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        BigDecimal balance = getBalance(customerId);
        List<Map<String, Object>> rows = txns.stream().map(tx -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", tx.getId());
            m.put("orderId", tx.getOrderId());
            m.put("amount", tx.getAmount());
            m.put("createdAt", tx.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        Map<String, Object> result = new HashMap<>();
        result.put("customerId", customerId);
        result.put("balance", balance);
        result.put("transactions", rows);
        return result;
    }
}

