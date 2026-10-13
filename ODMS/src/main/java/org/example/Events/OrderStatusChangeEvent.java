package org.example.Events;

import org.example.Orders.OrderStatuses;
import org.example.Payment.PaymentMethod;

public record OrderStatusChangeEvent(
        Long orderId,
        OrderStatuses status


) {}