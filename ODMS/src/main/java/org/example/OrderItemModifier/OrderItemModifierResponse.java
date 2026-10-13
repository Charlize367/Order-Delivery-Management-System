package org.example.OrderItemModifier;

import java.math.BigDecimal;

public record OrderItemModifierResponse(
        Long orderItemModifierId,
        Long modifierOptionId,
        BigDecimal priceAdjustment
) {
}