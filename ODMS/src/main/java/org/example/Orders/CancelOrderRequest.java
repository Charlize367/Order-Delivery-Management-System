package org.example.Orders;

public record CancelOrderRequest(
        OrderCancellationReason reason,
        String note
) {}
