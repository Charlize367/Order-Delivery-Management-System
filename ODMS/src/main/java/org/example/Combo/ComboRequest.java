package org.example.Combo;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ComboRequest(

        @NotBlank
        String name,

        String description,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = true)
        BigDecimal bundlePrice,

        @NotEmpty
        List<@Valid ComboItemRequest> comboItems
) {
}