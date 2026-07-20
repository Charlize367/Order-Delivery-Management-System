package org.example.Events;

public record OrderPaidEvent(Long orderId, Long paymentId) {}
