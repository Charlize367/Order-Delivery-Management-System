package org.example.Listeners;

import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderDeliveredEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Notifications.NotificationService;
import org.example.Notifications.NotificationType;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OrderDeliveredNotificationListener {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private NotificationService notificationService;

    @EventListener
    public void handle(OrderDeliveredEvent event) {

        System.out.println(
                "Assigned driver for order " + event.orderId()
        );

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));


        notificationService.createNotification(order.getCustomer().getUserId(), NotificationType.DELIVERY_COMPLETED,
                "Your order has been delivered.", event.orderId());


    }
}