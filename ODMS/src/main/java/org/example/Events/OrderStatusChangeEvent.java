package org.example.Events;

import org.example.Orders.OrderStatuses;

public record OrderStatusChangeEvent(
        Long orderId,
        OrderStatuses status
) {}