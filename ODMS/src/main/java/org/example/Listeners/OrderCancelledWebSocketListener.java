package org.example.Listeners;


import org.example.Events.DriverAssignedEvent;
import org.example.Events.OrderCancelledEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Notifications.NotificationResponse;
import org.example.Notifications.NotificationType;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class OrderCancelledWebSocketListener {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    public OrderCancelledWebSocketListener(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }


    @EventListener
    public void handle(OrderCancelledEvent event) {

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));


        NotificationResponse response =
                new NotificationResponse(
                        null,
                        order.getCustomer().getUserId(),
                        event.orderId(),
                        NotificationType.ORDER_CANCELLED,
                        "Your order has been cancelled",
                        false,
                        LocalDateTime.now()
                );


        messagingTemplate.convertAndSendToUser(
                order.getCustomer().getUserId().toString(),
                "/queue/notifications",
                response
        );
    }
}
