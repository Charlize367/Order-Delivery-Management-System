package org.example.Payment;


public record PaymentRequest(
        Long orderId,
        PaymentMethod method,
        String transactionReference
) {}
