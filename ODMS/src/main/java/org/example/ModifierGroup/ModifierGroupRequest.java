package org.example.ModifierGroup;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Catalog.Catalog;
import org.example.ModifierOption.ModifierOptionRequest;
import org.example.Payment.PaymentMethod;

import java.util.List;


public record ModifierGroupRequest(

        @NotBlank(message = "Name cannot be blank")
        @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
         String name,

        boolean required,

        @NotNull(message = "Minimum selections is required")
        @Min(value = 0, message = "Minimum selections cannot be negative")
        @Max(value = 1000, message = "Minimum selections is too large")
        Integer minSelections,

        @NotNull(message = "Maximum selections is required")
        @Min(value = 1, message = "Maximum selections must be at least 1")
        @Max(value = 1000, message = "Maximum selections is too large")
         Integer maxSelections,

        @NotNull
        Long catalogId,

        @NotNull
        List<ModifierOptionRequest> modifierOptions
) {}

