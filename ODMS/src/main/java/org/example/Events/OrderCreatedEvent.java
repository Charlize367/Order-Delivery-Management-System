package org.example.Events;

import org.example.Orders.OrderStatuses;
import org.example.Payment.PaymentMethod;

public record OrderCreatedEvent(
        Long orderId,
        PaymentMethod paymentMethod


) {}