package org.example.Events;

import org.example.Orders.OrderCancellationReason;

public record OrderCancelledEvent(Long orderId, OrderCancellationReason reason) {}
