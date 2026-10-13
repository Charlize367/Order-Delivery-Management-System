package org.example.Validator;

import org.example.Exception.InvalidOrderStatusTransitionException;
import org.example.Orders.OrderStatuses;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusTransitionValidator {
    public void validate(OrderStatuses current, OrderStatuses next) {

        if (!current.canTransitionTo(next)) {
            throw new InvalidOrderStatusTransitionException(current, next);
        }

    }
}
