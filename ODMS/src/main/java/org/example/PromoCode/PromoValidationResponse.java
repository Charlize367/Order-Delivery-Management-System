package org.example.PromoCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromoValidationResponse(

        Long promoCodeId,
        Boolean valid,
        String code,


        DiscountType discountType,


        BigDecimal discountValue,

        BigDecimal discountAmount

) {}
