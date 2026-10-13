package org.example.Listeners;

import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderDeliveredEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Firebase.FcmService;
import org.example.Firebase.FcmToken;
import org.example.Firebase.FcmTokenRepository;
import org.example.Notifications.NotificationResponse;
import org.example.Notifications.NotificationType;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class OrderDeliveredWebSocketListener {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private FcmService fcmService;

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    public OrderDeliveredWebSocketListener(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }


    @EventListener
    public void handle(OrderDeliveredEvent event) {

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));


        NotificationResponse response =
                new NotificationResponse(
                        null,
                        order.getCustomer().getUserId(),
                        event.orderId(),
                        NotificationType.DELIVERY_COMPLETED,
                        "Your order has been delivered",
                        false,
                        LocalDateTime.now(),
                        order.getOrder_status().toString()

                );


        messagingTemplate.convertAndSendToUser(
                order.getCustomer().getUserId().toString(),
                "/queue/notifications",
                response
        );


        messagingTemplate.convertAndSend(
                "/topic/orders/" + order.getOrderId(),
                response
        );

        Optional<FcmToken> latestToken =
                fcmTokenRepository.findFirstByUserIdOrderByCreatedAtDesc(order.getCustomer().getUserId());

        latestToken.ifPresent(token ->
                fcmService.sendNotification(
                        token.getToken(),
                        "Order Update",
                        response.getMessage()
                )
        );
    }
}
