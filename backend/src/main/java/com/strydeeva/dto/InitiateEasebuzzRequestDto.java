package com.strydeeva.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InitiateEasebuzzRequestDto {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // upi/card/netbanking

    @NotNull(message = "Order payload is required")
    @Valid
    private CreateOrderRequestDto order;

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public CreateOrderRequestDto getOrder() { return order; }
    public void setOrder(CreateOrderRequestDto order) { this.order = order; }
}

