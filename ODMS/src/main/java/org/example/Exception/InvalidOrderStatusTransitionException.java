package org.example.Exception;

import org.example.Orders.OrderStatuses;

public class InvalidOrderStatusTransitionException extends RuntimeException {
    public InvalidOrderStatusTransitionException(
            OrderStatuses current,
            OrderStatuses next) {

        super("Cannot transition from " + current + " to " + next);
    }
}
