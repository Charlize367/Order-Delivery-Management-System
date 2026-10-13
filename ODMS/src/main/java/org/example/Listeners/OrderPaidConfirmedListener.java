package org.example.Listeners;

import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Events.OrderPaidEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Notifications.NotificationService;
import org.example.Notifications.NotificationType;
import org.example.Orders.OrderStatuses;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Payment.Payment;
import org.example.Payment.PaymentMethod;
import org.example.Payment.PaymentRepository;
import org.example.PromoCode.PromoCodeService;
import org.example.Validator.OrderStatusTransitionValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OrderPaidConfirmedListener {

    private static final Logger logger = LoggerFactory.getLogger(OrderPaidConfirmedListener.class);

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PromoCodeService promoCodeService;

    @Autowired
    private NotificationService notificationService;

    private final OrderStatusTransitionValidator validator;

    public OrderPaidConfirmedListener(OrderStatusTransitionValidator validator) {
        this.validator = validator;
    }

    @EventListener
    public void handle(OrderPaidEvent event) {

        logger.info("Listening to OrderPaidEvent for order {}", event.orderId());

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));

        Payment payment = paymentRepository.findById(event.paymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + event.paymentId()));

        if (payment.getMethod() == PaymentMethod.CREDIT_CARD) {

            // Decide the target status FIRST, based on the order's CURRENT
            // status, before mutating anything. Previously this validated
            // CONFIRMED -> SCHEDULED (using the status after it had already
            // been set to CONFIRMED), which is an invalid transition and
            // threw inside the webhook handler.
            OrderStatuses currentStatus = order.getOrder_status();
            OrderStatuses targetStatus = resolveTargetStatus(order);

            validator.validate(currentStatus, targetStatus);
            order.setOrder_status(targetStatus);
        }

        if (order.getPromoCode() != null) {
            promoCodeService.redeemPromoCode(order, order.getPromoCode().getPromoCodeId());
        }

        ordersRepository.save(order);

        logger.info("New order status after payment: {}", order.getOrder_status());

        try {
            notificationService.createNotification(
                    order.getCustomer().getUserId(),
                    NotificationType.ORDER_PAID,
                    "Your order has been paid.",
                    event.orderId()
            );
        } catch (Exception e) {
            logger.warn("Failed to send notification for order {}", event.orderId(), e);
        }
    }

    /**
     * Orders with no delivery record yet (order.getDeliveries() == null)
     * are treated as a plain CONFIRMED order rather than throwing an NPE.
     */
    private OrderStatuses resolveTargetStatus(Orders order) {
        if (order.getDeliveries() == null) {
            return OrderStatuses.CONFIRMED;
        }

        Deliveries delivery = deliveryRepository.findById(order.getDeliveries().getDeliveryId())
                .orElseThrow(() -> new ResourceNotFoundException("Deliveries not found"));

        boolean isScheduled = delivery.getScheduledDeliveredTime() != null;
        return isScheduled ? OrderStatuses.SCHEDULED : OrderStatuses.CONFIRMED;
    }
}