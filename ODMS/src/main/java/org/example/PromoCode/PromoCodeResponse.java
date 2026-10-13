package org.example.PromoCode;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromoCodeResponse(

        Long promoCodeId,
        String code,


        DiscountType discountType,


        BigDecimal discountValue,


        LocalDateTime startDate,


        LocalDateTime expiryDate,

        Integer usageLimit,

        Integer usedCount,

        BigDecimal minimumOrderAmount,


        BigDecimal maximumDiscountAmount,


        String description,
        Boolean active

) {}