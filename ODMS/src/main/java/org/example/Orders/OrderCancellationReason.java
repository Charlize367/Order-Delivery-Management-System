package org.example.Orders;

public enum OrderCancellationReason {
    // Customer reasons
    CHANGED_MIND,
    ORDERED_BY_MISTAKE,
    DELIVERY_DELAY,
    OTHER,

    // Restaurant reasons
    OUT_OF_STOCK,
    RESTAURANT_CLOSED,
    KITCHEN_ISSUE,

    // System reasons
    PAYMENT_FAILED
}
