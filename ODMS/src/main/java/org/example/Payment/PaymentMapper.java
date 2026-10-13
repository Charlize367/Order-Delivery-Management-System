package org.example.Payment;

import org.example.Orders.OrderMapper;
import org.springframework.stereotype.Component;


@Component
public class PaymentMapper {


    private final OrderMapper orderMapper;

    public PaymentMapper(OrderMapper orderMapper) {

        this.orderMapper = orderMapper;
    }

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(payment.getPaymentId(), payment.getStatus(), payment.getAmount());
    }
}
