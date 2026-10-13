package org.example.ModifierOption;

import org.example.ModifierGroup.ModifierGroupResponse;

import java.math.BigDecimal;

public record ModifierOptionResponse(

        Long modifierOptionId,

        String name,

        BigDecimal priceAdjustment,

        Long modifierGroupId,

        boolean active

) {}