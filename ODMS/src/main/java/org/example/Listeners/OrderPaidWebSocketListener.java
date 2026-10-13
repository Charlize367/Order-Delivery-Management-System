package org.example.Listeners;

import org.example.Events.OrderDeliveredEvent;
import org.example.Events.OrderPaidEvent;
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
public class OrderPaidWebSocketListener {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private FcmService fcmService;

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    public OrderPaidWebSocketListener(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }


    @EventListener
    public void handle(OrderPaidEvent event) {

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));


        NotificationResponse response =
                new NotificationResponse(
                        null,
                        order.getCustomer().getUserId(),
                        event.orderId(),
                        NotificationType.ORDER_PAID,
                        "Your order has been paid",
                        false,
                        LocalDateTime.now(),
                        order.getOrder_status().toString()

                );


        messagingTemplate.convertAndSendToUser(
                order.getCustomer().getUserId().toString(),
                "/queue/notifications",
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
