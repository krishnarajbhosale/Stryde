package com.strydeeva.config;

import com.strydeeva.entity.Admin;
import com.strydeeva.entity.Order;
import com.strydeeva.entity.OrderItem;
import com.strydeeva.repository.AdminRepository;
import com.strydeeva.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final OrderRepository orderRepository;

    public DataInitializer(AdminRepository adminRepository, OrderRepository orderRepository) {
        this.adminRepository = adminRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername("admin").isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPasswordHash(new BCryptPasswordEncoder().encode("admin123"));
            adminRepository.save(admin);
        }
        if (orderRepository.count() == 0) {
            Order sample = new Order();
            sample.setOrderNumber("ORD-001");
            sample.setCustomerName("Sample Customer");
            sample.setCustomerEmail("customer@example.com");
            sample.setShippingAddress("123 Sample Street");
            sample.setCity("Mumbai");
            sample.setPinCode("400001");
            sample.setTotalAmount(new BigDecimal("2999.00"));
            sample.setStatus(Order.OrderStatus.CONFIRMED);
            OrderItem item = new OrderItem();
            item.setOrder(sample);
            item.setProductName("Sample Product");
            item.setSizeName("M");
            item.setQuantity(1);
            item.setUnitPrice(new BigDecimal("2999.00"));
            sample.setItems(List.of(item));
            orderRepository.save(sample);
        }
    }
}
