package org.example.ModifierOption;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ModifierOptionRequest(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
        String name,

        @NotNull(message = "Price adjustment is required")
        @DecimalMax(value = "1000000.00", message = "Price adjustment must not exceed 1,000,000")
        BigDecimal priceAdjustment,

        @NotNull
        Long modifierGroupId

) {}