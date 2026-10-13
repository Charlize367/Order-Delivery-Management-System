package org.example.Combo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ComboItemRequest(

        @NotNull
        Long catalogId,

        @NotNull
        @Min(1)
        Integer quantity
) {
}