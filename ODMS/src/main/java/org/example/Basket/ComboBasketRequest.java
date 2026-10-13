package org.example.Basket;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ComboBasketRequest(

        @NotNull(message = "Combo ID is required")
        Long comboId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @Valid
        List<ComboItemBasketRequest> itemSelections,

        String specialInstructions


) {
}