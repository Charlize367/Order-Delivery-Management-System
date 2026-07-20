package org.example.Payment;


import org.example.Events.OrderPaidEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;

public class PaymentService {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentMapper paymentMapper;

    private static final Logger logger = LoggerFactory.getLogger(Payment.class);

    private final ApplicationEventPublisher publisher;

    public PaymentService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }


    @Caching(
            put = {
                    @CachePut(value = "payment", key = "#savedPayment.paymentId")
            },
            evict = {
                    @CacheEvict(value = "payments", allEntries = true)
            }
    )
    public PaymentResponse payOrder(PaymentRequest request){
        logger.info("Attempting to add new payment record with ID: {}", request.orderId());

        Payment payment = new Payment();
        Orders order = ordersRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        payment.setOrder(order);
        payment.setAmount(order.getOrder_price());
        payment.setMethod(request.method());
        payment.setStatus(PaymentStatus.PAID);
        payment.setCreatedAt(Instant.now());
        payment.setPaidAt(Instant.now());
        payment.setUpdatedAt(Instant.now());

        Payment savedPayment = paymentRepository.save(payment);
        publisher.publishEvent(new OrderPaidEvent(request.orderId(), savedPayment.getPaymentId()));


        return paymentMapper.toResponse(savedPayment);

    }


    public PaymentResponse changeStatus(Long paymentId, PaymentStatus paymentStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));

        payment.setStatus(paymentStatus);
        Payment updatedPaymentRecord = paymentRepository.save(payment);
        return paymentMapper.toResponse(updatedPaymentRecord);
    }
}
