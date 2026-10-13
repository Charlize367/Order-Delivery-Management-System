package org.example.Payment;

import java.math.BigDecimal;

public record PaymentResponse(
        Long paymentId,
        PaymentStatus status,
        BigDecimal amount
) {}
