package org.example.Listeners;

import com.stripe.exception.StripeException;
import org.example.Events.OrderCreatedEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Orders.OrdersService;
import org.example.Payment.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Component
public class OrderCreatedPaymentListener {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final Logger logger = LoggerFactory.getLogger(OrderCreatedPaymentListener.class);

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(OrderCreatedEvent event) throws StripeException {
        logger.info("Received OrderCreatedEvent for order {} with payment method {}", event.orderId(), event.paymentMethod());

        try {
            if (paymentRepository.existsByOrderOrderId(event.orderId())) {
                logger.info("Payment already exists for order {}, skipping duplicate trigger", event.orderId());
                return;
            }

            PaymentRequest paymentRequest = new PaymentRequest(event.orderId(), event.paymentMethod());
            if (event.paymentMethod() == PaymentMethod.CASH) {
                logger.info("Triggering cash payment for order {}", event.orderId());
                paymentService.payOrder(paymentRequest);
                logger.info("Cash payment recorded for order {}", event.orderId());
            }

        } catch (Exception e) {
            logger.error("Payment trigger failed for order {}", event.orderId(), e);
            paymentRepository.findByOrderOrderId(event.orderId())
                    .ifPresentOrElse(
                            payment -> {
                                paymentService.changeStatus(payment.getPaymentId(), PaymentStatus.FAILED);
                                logger.warn("Marked payment {} as FAILED for order {}", payment.getPaymentId(), event.orderId());
                            },
                            () -> logger.error("No payment record exists for order {} — failed before record creation", event.orderId())
                    );
        }
    }
}