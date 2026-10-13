package org.example.OrderItemModifier;

import org.springframework.stereotype.Component;

@Component
public class OrderItemModifierMapper {

    public OrderItemModifierResponse toResponse(
            OrderItemModifier orderItemModifier
    ) {
        return new OrderItemModifierResponse(
                orderItemModifier.getOrderItemModifierId(),
                orderItemModifier.getModifierOption().getModifierOptionId(),
                orderItemModifier.getPriceAdjustment()
        );
    }
}