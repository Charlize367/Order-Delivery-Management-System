package org.example.Pricing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PricingCalculator {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.12");

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("50");

    public BigDecimal calculateTax(BigDecimal subtotal) {

        return subtotal.multiply(VAT_RATE);
    }

    public BigDecimal calculateDeliveryFee() {

        return DELIVERY_FEE;
    }
}
