package org.example.Payment;


import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
        @NotNull
        Long orderId,

        @NotNull
        PaymentMethod method
) {}
