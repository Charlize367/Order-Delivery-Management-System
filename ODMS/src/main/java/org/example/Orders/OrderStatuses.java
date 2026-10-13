package org.example.Orders;

import java.util.Set;

public enum OrderStatuses {
    PENDING,
    CONFIRMED,
    SCHEDULED,
    PREPARING,
    READY,
    ASSIGNED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;


    private Set<OrderStatuses> allowedTransitions;

    static {
        PENDING.allowedTransitions = Set.of(CONFIRMED, CANCELLED);
        CONFIRMED.allowedTransitions = Set.of(SCHEDULED, PREPARING, CANCELLED);
        SCHEDULED.allowedTransitions = Set.of(PREPARING, CANCELLED);
        PREPARING.allowedTransitions = Set.of(READY, CANCELLED);
        READY.allowedTransitions = Set.of(ASSIGNED);
        ASSIGNED.allowedTransitions = Set.of(OUT_FOR_DELIVERY);
        OUT_FOR_DELIVERY.allowedTransitions = Set.of(DELIVERED);
        DELIVERED.allowedTransitions = Set.of();
        CANCELLED.allowedTransitions = Set.of();
    }

    public boolean canTransitionTo(OrderStatuses next) {
        return allowedTransitions.contains(next);
    }
}
