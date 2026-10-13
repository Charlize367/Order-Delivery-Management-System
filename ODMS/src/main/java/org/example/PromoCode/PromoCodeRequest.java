package org.example.PromoCode;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromoCodeRequest(

        @NotBlank(message = "Code cannot be blank")
        @Size(max = 50, message = "Code must not exceed 50 characters")
        String code,

        @NotNull(message = "Discount type is required")
        DiscountType discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
        @DecimalMax(value = "1000000.00", message = "Discount value must not exceed 1,000,000")
        BigDecimal discountValue,

        @NotNull(message = "Start date is required")
        @FutureOrPresent(message = "Start date must be in the present or future")
        LocalDateTime startDate,

        @NotNull(message = "Expiry date is required")
        @Future(message = "Expiry date must be in the future")
        LocalDateTime expiryDate,

        @NotNull(message = "Usage limit is required")
        @Min(value = 1, message = "Usage limit must be at least 1")
        @Max(value = 1000000, message = "Usage limit is too large")
        Integer usageLimit,

        @NotNull(message = "Minimum order amount is required")
        @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
        @DecimalMax(value = "1000000.00", message = "Minimum order amount must not exceed 1,000,000")
        BigDecimal minimumOrderAmount,

        @DecimalMin(value = "0.00", message = "Maximum discount amount cannot be negative")
        @DecimalMax(value = "1000000.00", message = "Maximum discount amount must not exceed 1,000,000")
        BigDecimal maximumDiscountAmount,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description

) {}