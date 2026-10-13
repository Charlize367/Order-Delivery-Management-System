package org.example.PromoCode;


import org.example.Payment.Payment;
import org.example.Payment.PaymentResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PromoCodeMapper {


    public PromoCodeResponse toResponse(PromoCode promoCode) {
        return new PromoCodeResponse(promoCode.getPromoCodeId(), promoCode.getCode(), promoCode.getDiscountType(),
                promoCode.getDiscountValue(), promoCode.getStartDate(), promoCode.getExpiryDate(),
                promoCode.getUsageLimit(), promoCode.getUsedCount(), promoCode.getMinimumOrderAmount(),
                promoCode.getMaximumDiscountAmount(), promoCode.getDescription(), promoCode.isActive());
    }

    public PromoValidationResponse toValidResponse(Long promoCodeId, Boolean valid, String code,
                                                   DiscountType discountType, BigDecimal discountValue,
                                                   BigDecimal discountAmount) {
        return new PromoValidationResponse(promoCodeId, valid, code,
                discountType, discountValue,
                discountAmount);
    }
}
