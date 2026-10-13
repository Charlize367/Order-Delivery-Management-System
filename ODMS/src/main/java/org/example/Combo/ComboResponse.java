package org.example.Combo;

import java.math.BigDecimal;
import java.util.List;

public record ComboResponse(
        Long comboId,
        String name,
        String description,
        BigDecimal bundlePrice,
        boolean active,
        List<ComboItemResponse> comboItems
) {
}