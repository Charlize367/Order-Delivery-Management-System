package org.example.Payment;

import org.example.Orders.OrderMapper;

public class PaymentMapper {

    private final PaymentMapper paymentMapper;
    private final OrderMapper orderMapper;

    public PaymentMapper(PaymentMapper paymentMapper, OrderMapper orderMapper) {
        this.paymentMapper = paymentMapper;
        this.orderMapper = orderMapper;
    }

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(payment.getPaymentId(), payment.getStatus(), payment.getAmount());
    }
}
