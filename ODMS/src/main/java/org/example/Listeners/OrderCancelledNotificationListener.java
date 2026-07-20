package org.example.Listeners;

import org.example.Events.OrderCancelledEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Notifications.NotificationService;
import org.example.Notifications.NotificationType;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCancelledNotificationListener {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private NotificationService notificationService;

    @EventListener
    public void handle(OrderCancelledEvent event) {

        System.out.println(
                "Assigned driver for order " + event.orderId()
        );

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));


        notificationService.createNotification(order.getCustomer().getUserId(), NotificationType.ORDER_CANCELLED,
                "Your order has been cancelled.", event.orderId());


    }
}
